package com.choicify.backend.controller;

import com.choicify.backend.model.DecisionList;
import com.choicify.backend.model.Lobby;
import com.choicify.backend.model.Option;
import com.choicify.backend.model.User;
import com.choicify.backend.pusher.PusherInstance;
import com.choicify.backend.repository.DecisionListRepository;
import com.choicify.backend.repository.LobbyRepository;
import com.choicify.backend.repository.OptionRepository;
import com.choicify.backend.repository.TournamentRepository;
import com.choicify.backend.security.CurrentUser;
import com.choicify.backend.security.UserPrincipal;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import javax.transaction.Transactional;
import java.util.*;

@Getter
@Setter
@RequiredArgsConstructor
class NewDecisionListBody {
    private String question;
    private boolean is_deleted;
}

@Getter
@Setter
@RequiredArgsConstructor
class NewOptionBody {
    private String name;
    private String description;
    private String url;
    private boolean is_deleted;
}

@RestController
@RequiredArgsConstructor
@RequestMapping(path = "/api")
public class DecisionListController {
    private final DecisionListRepository decisionListRepository;
    private final OptionRepository optionRepository;
    private final LobbyRepository lobbyRepository;
    private final TournamentRepository tournamentRepository;
    private final PusherInstance pusherInstance;

    @PostMapping("/decisionList/new")
    @PreAuthorize("hasRole('USER')")
    public Long createDecisionList(@CurrentUser UserPrincipal userPrincipal, @RequestBody NewDecisionListBody body) {
        if (body.getQuestion() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please provide a question to create a new list");
        }
        User user = userPrincipal.getUser();
        DecisionList newDecisionList = new DecisionList();
        newDecisionList.setUser(user);
        newDecisionList.setQuestion(body.getQuestion());
        DecisionList dbDecisionList = decisionListRepository.save(newDecisionList);
        return dbDecisionList.getId();
    }

    @GetMapping("/decisionList")
    @PreAuthorize("hasRole('USER')")
    public List<DecisionList> getUserDecisionLists(@CurrentUser UserPrincipal userPrincipal) {
        return decisionListRepository.findByUserAndIsDeletedIs(userPrincipal.getUser(), null);
    }


    @GetMapping("/decisionList/{id}")
    @PreAuthorize("hasRole('USER')")
    public DecisionList getDecisionList(@CurrentUser UserPrincipal userPrincipal, @PathVariable long id) {
        return getDecisionListFromDb(userPrincipal, id);
    }

    @GetMapping("/decisionList/{id}/tournament_count")
    @PreAuthorize("hasRole('USER')")
    public Integer getDecisionListTournamentCount(@CurrentUser UserPrincipal userPrincipal, @PathVariable long id) {
        DecisionList decisionList = getDecisionListFromDb(userPrincipal, id);
        return tournamentRepository.getCountByDecisionListId(decisionList.getId());
    }

    @GetMapping("/decisionList/{id}/options")
    @PreAuthorize("hasRole('USER')")
    public List<Option> getDecisionListOptions(@CurrentUser UserPrincipal userPrincipal, @PathVariable long id) {
        DecisionList decisionList = getDecisionListFromDb(userPrincipal, id);
        return optionRepository.findByDecisionListNotDeleted(decisionList.getId());
    }

    @PostMapping("/decisionList/{id}/options/new")
    @PreAuthorize("hasRole('USER')")
    public Option createNewDecisionListOption(@CurrentUser UserPrincipal userPrincipal, @PathVariable long id,
                                              @RequestBody NewOptionBody body) {
        DecisionList decisionList = getDecisionListFromDb(userPrincipal, id);
        Option newOption = new Option();
        newOption.setName(body.getName());
        newOption.setDescription(body.getDescription());
        newOption.setUrl(body.getUrl());
        newOption.setDecisionList(decisionList);
        Option dbOption = optionRepository.save(newOption);
        checkAndSendUpdateToPlayers(decisionList);
        return dbOption;
    }

    @PutMapping("/decisionList/{id}/options/{optionId}/edit")
    @PreAuthorize("hasRole('USER')")
    public Option editDecisionListOption(@CurrentUser UserPrincipal userPrincipal, @PathVariable long id,
                                         @PathVariable long optionId, @RequestBody NewOptionBody body) {
        DecisionList decisionList = getDecisionListFromDb(userPrincipal, id);
        Option updateOption = new Option();
        updateOption.setId(optionId);
        updateOption.setName(body.getName());
        updateOption.setDescription(body.getDescription());
        updateOption.setUrl(body.getUrl());
        updateOption.setDecisionList(decisionList);
        Option dbOption = optionRepository.save(updateOption);
        checkAndSendUpdateToPlayers(decisionList);
        return dbOption;
    }

    @DeleteMapping("/decisionList/{id}/options/{optionId}/delete")
    @PreAuthorize("hasRole('USER')")
    public Long deleteDecisionListOption(@CurrentUser UserPrincipal userPrincipal, @PathVariable long id,
                                         @PathVariable long optionId) {
        DecisionList decisionList = getDecisionListFromDb(userPrincipal, id);
        Optional<Option> toDelete = optionRepository.findById(optionId);
        if (!toDelete.isPresent()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Could not find the option");
        }
        Option toDel = toDelete.get();
        toDel.setIsDeleted(true);
        Long delId = optionRepository.save(toDel).getId();
        checkAndSendUpdateToPlayers(decisionList);
        return delId;
    }

    @Transactional
    @DeleteMapping("/decisionList/{id}")
    @PreAuthorize("hasRole('USER')")
    public Boolean deleteDecisionList(@CurrentUser UserPrincipal userPrincipal, @PathVariable long id) {
        DecisionList decisionList = getDecisionListFromDb(userPrincipal, id);
        decisionList.setIsDeleted(true);
        decisionListRepository.save(decisionList);
        return true;
    }

    @Transactional
    @PostMapping("/decisionList/{id}/createLobby")
    @PreAuthorize("hasRole('USER')")
    public Lobby createNewLobby(@CurrentUser UserPrincipal userPrincipal, @PathVariable long id) {
        DecisionList decisionList = getDecisionListFromDb(userPrincipal, id);
        lobbyRepository.deleteByDecisionList(decisionList);
        Lobby lobby = new Lobby();
        lobby.setDecisionList(decisionList);
        Lobby newLobby = null;
        for (int i = 0; i < 2; i++) {
            String generatedString = RandomStringUtils.randomAlphanumeric(6);
            lobby.setLobbyCode(generatedString.toUpperCase());
            try {
                newLobby = lobbyRepository.save(lobby);
                break;
            } catch (Exception ignored) {
            }
        }
        if (newLobby == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not create lobby");
        }
        return newLobby;
    }

    @Transactional
    @DeleteMapping("/decisionList/{id}/deleteLobby")
    @PreAuthorize("hasRole('USER')")
    public boolean deleteListLobby(@CurrentUser UserPrincipal userPrincipal, @PathVariable long id) {
        DecisionList decisionList = getDecisionListFromDb(userPrincipal, id);
        Optional<Lobby> lobbyToDelete = lobbyRepository.getLobbyByDecisionList(decisionList);
        if (lobbyToDelete.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Lobby not found");
        }
        lobbyRepository.deleteByDecisionList(decisionList);
        pusherInstance.getPusher().trigger("presence-lobby-" + lobbyToDelete.get().getId(), "lobby-deleted", "");
        return true;
    }

    private DecisionList getDecisionListFromDb(@CurrentUser UserPrincipal userPrincipal, @PathVariable long id) {
        Optional<DecisionList> decisionList = decisionListRepository.findById(id);
        if (decisionList.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Could not find the decision list");
        }
        if (!Objects.equals(decisionList.get().getUser().getId(), userPrincipal.getUser().getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Could not find the decision list");
        }
        return decisionList.get();
    }

    private void checkAndSendUpdateToPlayers(DecisionList decisionList) {
        Optional<Lobby> lobby = lobbyRepository.getLobbyByDecisionList(decisionList);
        if (lobby.isEmpty())
            return;
        pusherInstance.getPusher().trigger("presence-lobby-" + lobby.get().getId(), "options-update", "Option change");
    }

}
