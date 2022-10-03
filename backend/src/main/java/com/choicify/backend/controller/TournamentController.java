package com.choicify.backend.controller;

import com.choicify.backend.model.*;
import com.choicify.backend.repository.*;
import com.choicify.backend.security.CurrentUser;
import com.choicify.backend.security.UserPrincipal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
class CreateNewTournamentBody {
    private Long decisionListId;
    private List<Long> playerIds;
}

@RestController
@RequiredArgsConstructor
@RequestMapping(path = "/api")
public class TournamentController {
    private final TournamentRepository tournamentRepository;
    private final DecisionListRepository decisionListRepository;
    private final UserRepository userRepository;
    private final PlayerRepository playerRepository;
    private final OptionRepository optionRepository;
    private final MatchRepository matchRepository;

    @Transactional
    @PostMapping("/tournament/new")
    @PreAuthorize("hasRole('USER')")
    public Long createNewTournament(@CurrentUser UserPrincipal userPrincipal,
                                    @RequestBody CreateNewTournamentBody body) {
        if (body.getDecisionListId() == null || body.getPlayerIds() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bad arguments");
        }
        Optional<DecisionList> decisionListOptional = decisionListRepository.findById(body.getDecisionListId());
        if (decisionListOptional.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Could not find the decision list");
        }
        DecisionList decisionList = decisionListOptional.get();
        if (!Objects.equals(decisionList.getUser().getId(), userPrincipal.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to do that");
        }
        List<Option> options = optionRepository.findByDecisionListNotDeleted(decisionList.getId());
        if (options.size() <= 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot create an empty tournament");
        }
        HashSet<Player> players = new HashSet<>();
        for (Long playerId : body.getPlayerIds()) {
            Optional<User> userOptional = userRepository.findById(playerId);
            if (userOptional.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
            }
            Player player = new Player();
            player.setUser(userOptional.get());
            player.setPrimary(Objects.equals(userOptional.get().getId(), userPrincipal.getId()));
            players.add(player);
        }
        boolean isMultiplayer = players.size() > 1;
        Tournament tournament = new Tournament();
        tournament.setDecisionList(decisionList);
        Date currentDate = new Date();
        tournament.setStartTime(currentDate.getTime());
        tournament.setMultiplayer(isMultiplayer);
        tournament.setDeleted(false);
        tournament.setCurrentMatchIndex(-1L);
        tournament.setPrimaryUser(userPrincipal.getUser());
        tournament.setPlayerCount(isMultiplayer ? (long) players.size() : 1L);
        Tournament tournamentDb = tournamentRepository.save(tournament);
        for (Player player : players) {
            player.setTournament(tournamentDb);
        }
        playerRepository.saveAll(players);
        // random order of options
        Random randomGenerator = new Random();
        for (int i = 0; i < options.size() - 1; i++) {
            int randomIndex = randomGenerator.nextInt(options.size() - i) + i;
            Option aux = options.get(randomIndex);
            options.set(randomIndex, options.get(i));
            options.set(i, aux);
        }
        List<Match> matches = new LinkedList<>();
        long numberOfMatches = options.size() - 1;
        int optionIndex = 0;
        long matchIndex = numberOfMatches;
        for (int i = 0; i < numberOfMatches; i++) {
            Match match = new Match();
            match.setTournament(tournamentDb);
            match.setVotesFor1(0L);
            match.setVotesFor2(0L);
            match.setTotalVotes(0L);
            match.setMatchIndex(matchIndex--);
            if (optionIndex < options.size())
                match.setOption2(options.get(optionIndex++));
            if (optionIndex < options.size())
                match.setOption1(options.get(optionIndex++));
            matches.add(match);
        }
        matchRepository.saveAll(matches);
        tournamentDb.setCurrentMatchIndex(numberOfMatches);
        return tournamentRepository.save(tournamentDb).getId();
    }
}
