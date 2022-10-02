package com.choicify.backend.controller;

import com.choicify.backend.model.DecisionList;
import com.choicify.backend.model.Lobby;
import com.choicify.backend.model.Option;
import com.choicify.backend.model.User;
import com.choicify.backend.pusher.PusherInstance;
import com.choicify.backend.repository.DecisionListRepository;
import com.choicify.backend.repository.LobbyRepository;
import com.choicify.backend.repository.OptionRepository;
import com.choicify.backend.repository.UserRepository;
import com.choicify.backend.security.CurrentUser;
import com.choicify.backend.security.UserPrincipal;
import lombok.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Getter
@Setter
@RequiredArgsConstructor
class NewLobbyBody {
    private Long listId;
}

@Data
@RequiredArgsConstructor
@AllArgsConstructor
class LobbyDataResponse {
    private Long id;
    private String question;
    private String lobbyCode;
}

@RestController
@RequiredArgsConstructor
@RequestMapping(path = "/api")
public class LobbyController {
    private final LobbyRepository lobbyRepository;
    private final OptionRepository optionRepository;
    private final PusherInstance pusherInstance;

    @GetMapping("/lobby/{code}")
    @PreAuthorize("hasRole('USER')")
    public LobbyDataResponse getLobbyByCode(@CurrentUser UserPrincipal userPrincipal, @PathVariable String code) {
        Optional<Lobby> lobby = lobbyRepository.getLobbyByLobbyCode(code);
        if (lobby.isEmpty())
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "The lobby does not exist");
        return new LobbyDataResponse(lobby.get().getId(), lobby.get().getDecisionList().getQuestion(),
                lobby.get().getLobbyCode());
    }

    @GetMapping("/lobby/{id}/options")
    @PreAuthorize("hasRole('USER')")
    public List<Option> getLobbyOptions(@CurrentUser UserPrincipal userPrincipal, @PathVariable Long id) {
        Optional<Lobby> lobby = lobbyRepository.findById(id);
        if (lobby.isEmpty())
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "The lobby does not exist");
        return optionRepository.findByDecisionListNotDeleted(lobby.get().getDecisionList().getId());
    }

    @PostMapping("/lobby/{id}/terminate/{userId}")
    @PreAuthorize("hasRole('USER')")
    public boolean disconnectUserFromLobby(@CurrentUser UserPrincipal userPrincipal, @PathVariable Long id,
                                           @PathVariable Long userId) {
        Optional<Lobby> lobby = lobbyRepository.findById(id);
        if (lobby.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Could not find the lobby");
        }
        Lobby l = lobby.get();
        if (!Objects.equals(l.getDecisionList().getUser().getId(), userPrincipal.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this resource");
        }
        pusherInstance.getPusher().trigger("presence-lobby-" + l.getId(), "remove-user", userId);
        return true;
    }
}
