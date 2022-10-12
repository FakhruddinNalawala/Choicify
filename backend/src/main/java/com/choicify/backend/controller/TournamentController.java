package com.choicify.backend.controller;

import com.choicify.backend.model.*;
import com.choicify.backend.pusher.PusherInstance;
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
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.concurrent.Semaphore;

@Data
@AllArgsConstructor
@NoArgsConstructor
class CreateNewTournamentBody {
    private Long decisionListId;
    private List<Long> playerIds;
}

@Data
@AllArgsConstructor
@NoArgsConstructor
class TournamentForResponse {
    private Long id;
    private String question;
    private Boolean isPrimary;
    private Match currentMatch;
    private Long playerCount;
    private Boolean hasVoted;
    private List<TournamentPlayer> haveVoted;
    private List<TournamentPlayer> haveNotVoted;
}

@Data
@AllArgsConstructor
@NoArgsConstructor
class TournamentVotesResponse {
    private Long voteCount;
    private Long totalPlayers;
}

@Data
@AllArgsConstructor
@NoArgsConstructor
class TournamentPlayer {
    private Long id;
    private String name;
    private Boolean hasVoted;
}

@Data
@AllArgsConstructor
@NoArgsConstructor
class TournamentPlayers {
    private List<TournamentPlayer> haveVoted;
    private List<TournamentPlayer> haveNotVoted;
}

@Data
@AllArgsConstructor
@NoArgsConstructor
class MatchWinner {
    private Option option;
    private Long votes;
    private Long totalVotes;
    private Boolean isFinal;
}

@Data
@AllArgsConstructor
@NoArgsConstructor
class MatchFinishedMessage {
    private Long id;
    private Boolean wasFinal;
}

@Data
@AllArgsConstructor
@NoArgsConstructor
class TournamentBracket {
    private List<Match> matches;
    private DecisionList list;
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
    private final LobbyRepository lobbyRepository;
    private final PusherInstance pusherInstance;
    private static final Semaphore finishMatchSemaphore = new Semaphore(1);

    @GetMapping("/tournament/{id}")
    @PreAuthorize("hasRole('USER')")
    public TournamentForResponse getTournament(@CurrentUser UserPrincipal userPrincipal, @PathVariable long id) {
        Optional<Tournament> optionalTournament = tournamentRepository.findById(id);
        if (optionalTournament.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Could not find the tournament");
        }
        // check user
        Tournament t = optionalTournament.get();
        boolean isPrimary = false;
        boolean hasVoted = false;
        if (!t.isMultiplayer()) {
            if (!Objects.equals(t.getPrimaryUser().getId(), userPrincipal.getId()))
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot play in this tournament");
            isPrimary = true;
        } else {
            Optional<Player> player = playerRepository.findPlayerByTournamentAndUser(t, userPrincipal.getUser());
            if (player.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot play in this tournament");
            }
            hasVoted = player.get().isHasVoted();
            if (Objects.equals(t.getPrimaryUser().getId(), userPrincipal.getId())) {
                isPrimary = true;
            }
        }
        if (t.getEndTime() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This tournament was already played");
        }
        Optional<Match> optionalMatch = matchRepository.findByTournamentAndMatchIndex(t, t.getCurrentMatchIndex());
        if (optionalMatch.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This tournament has an invalid match");
        }
        if (!t.isMultiplayer()) {
            hasVoted = optionalMatch.get().getTotalVotes() > 0;
        }
        List<Player> players = playerRepository.findPlayersByTournament(t);
        List<TournamentPlayer> haveVoted = new LinkedList<>();
        List<TournamentPlayer> haveNotVoted = new LinkedList<>();
        for (Player player : players) {
            TournamentPlayer toAdd = new TournamentPlayer(player.getUser().getId(), player.getUser().getGivenName(),
                    player.isHasVoted());
            if (player.isHasVoted()) {
                haveVoted.add(toAdd);
            } else {
                haveNotVoted.add(toAdd);
            }
        }
        return new TournamentForResponse(t.getId(), t.getDecisionList().getQuestion(), isPrimary, optionalMatch.get(),
                t.getPlayerCount(), hasVoted, haveVoted, haveNotVoted);
    }

    @GetMapping("/tournament/{id}/players")
    @PreAuthorize("hasRole('USER')")
    public TournamentPlayers getTournamentPlayers(@CurrentUser UserPrincipal userPrincipal, @PathVariable long id) {
        Optional<Tournament> optionalTournament = tournamentRepository.findById(id);
        if (optionalTournament.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Could not find the tournament");
        }
        Tournament t = optionalTournament.get();
        if (!t.isMultiplayer()) {
            if (!Objects.equals(t.getPrimaryUser().getId(), userPrincipal.getId()))
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot play in this tournament");
        } else {
            Optional<Player> player = playerRepository.findPlayerByTournamentAndUser(t, userPrincipal.getUser());
            if (player.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot play in this tournament");
            }
        }
        if (t.getEndTime() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This tournament was already played");
        }
        List<Player> players = playerRepository.findPlayersByTournament(t);
        List<TournamentPlayer> haveVoted = new LinkedList<>();
        List<TournamentPlayer> haveNotVoted = new LinkedList<>();
        for (Player player : players) {
            TournamentPlayer toAdd = new TournamentPlayer(player.getUser().getId(), player.getUser().getGivenName(),
                    player.isHasVoted());
            if (player.isHasVoted()) {
                haveVoted.add(toAdd);
            } else {
                haveNotVoted.add(toAdd);
            }
        }
        return new TournamentPlayers(haveVoted, haveNotVoted);
    }

    @GetMapping("/tournament/{id}/votes")
    @PreAuthorize("hasRole('USER')")
    public TournamentVotesResponse getTournamentCurrentMatchVotes(@CurrentUser UserPrincipal userPrincipal,
                                                                  @PathVariable long id) {
        Optional<Tournament> optionalTournament = tournamentRepository.findById(id);
        if (optionalTournament.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Could not find the tournament");
        }
        // check user
        Tournament t = optionalTournament.get();
        if (!t.isMultiplayer()) {
            if (!Objects.equals(t.getPrimaryUser().getId(), userPrincipal.getId()))
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot play in this tournament");
        } else {
            if (!Objects.equals(t.getPrimaryUser().getId(), userPrincipal.getId())) {
                Optional<Player> player = playerRepository.findPlayerByTournamentAndUser(t, userPrincipal.getUser());
                if (player.isEmpty()) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot play in this tournament");
                }
            }
        }
        if (t.getEndTime() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This tournament was already played");
        }
        Optional<Match> optionalMatch = matchRepository.findByTournamentAndMatchIndex(t, t.getCurrentMatchIndex());
        if (optionalMatch.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This tournament has an invalid match");
        }
        return new TournamentVotesResponse(optionalMatch.get().getTotalVotes(), t.getPlayerCount());
    }

    @GetMapping("/tournament/{id}/match")
    @PreAuthorize("hasRole('USER')")
    public Match getTournamentCurrentMatch(@CurrentUser UserPrincipal userPrincipal, @PathVariable long id) {
        Optional<Tournament> optionalTournament = tournamentRepository.findById(id);
        if (optionalTournament.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Could not find the tournament");
        }
        // check user
        Tournament t = optionalTournament.get();
        if (!t.isMultiplayer()) {
            if (!Objects.equals(t.getPrimaryUser().getId(), userPrincipal.getId()))
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot play in this tournament");
        } else {
            if (!Objects.equals(t.getPrimaryUser().getId(), userPrincipal.getId())) {
                Optional<Player> player = playerRepository.findPlayerByTournamentAndUser(t, userPrincipal.getUser());
                if (player.isEmpty()) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot play in this tournament");
                }
            }
        }
        if (t.getEndTime() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This tournament was already played");
        }
        Optional<Match> optionalMatch = matchRepository.findByTournamentAndMatchIndex(t, t.getCurrentMatchIndex());
        if (optionalMatch.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This tournament has an invalid match");
        }
        return optionalMatch.get();
    }

    @GetMapping("/tournament/{id}/match/{matchId}/winner")
    @PreAuthorize("hasRole('USER')")
    public MatchWinner getMatchWinner(@CurrentUser UserPrincipal userPrincipal, @PathVariable long id,
                                      @PathVariable long matchId) {
        Optional<Tournament> optionalTournament = tournamentRepository.findById(id);
        if (optionalTournament.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Could not find the tournament");
        }
        // check user
        Tournament t = optionalTournament.get();
        if (!t.isMultiplayer()) {
            if (!Objects.equals(t.getPrimaryUser().getId(), userPrincipal.getId()))
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot play in this tournament");
        } else {
            if (!Objects.equals(t.getPrimaryUser().getId(), userPrincipal.getId())) {
                Optional<Player> player = playerRepository.findPlayerByTournamentAndUser(t, userPrincipal.getUser());
                if (player.isEmpty()) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot play in this tournament");
                }
            }
        }
        Optional<Match> optionalMatch = matchRepository.findByIdAndTournament(matchId, t);
        if (optionalMatch.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This tournament has an invalid match");
        }
        Match m = optionalMatch.get();
        if (m.getWinner() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Match has no winner yet");
        }
        return new MatchWinner(m.getWinner(), m.getVotesFor1() > m.getVotesFor2() ? m.getVotesFor1() : m.getVotesFor2(),
                m.getTotalVotes(), m.isFinal());
    }

    @GetMapping("/tournament/{id}/bracket")
    @PreAuthorize("hasRole('USER')")
    public TournamentBracket getTournamentBracket(@CurrentUser UserPrincipal userPrincipal, @PathVariable long id) {
        Optional<Tournament> optionalTournament = tournamentRepository.findById(id);
        if (optionalTournament.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Could not find the tournament");
        }
        // check user
        Tournament t = optionalTournament.get();
        if (!t.isMultiplayer()) {
            if (!Objects.equals(t.getPrimaryUser().getId(), userPrincipal.getId()))
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot play in this tournament");
        } else {
            if (!Objects.equals(t.getPrimaryUser().getId(), userPrincipal.getId())) {
                Optional<Player> player = playerRepository.findPlayerByTournamentAndUser(t, userPrincipal.getUser());
                if (player.isEmpty()) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot play in this tournament");
                }
            }
        }
        List<Match> matches = matchRepository.findByTournamentOrderByMatchIndex(t);
        if (matches.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This tournament has an invalid match");
        }
        return new TournamentBracket(matches, t.getDecisionList());
    }

    @Transactional
    @PostMapping("/tournament/{id}/vote/{for1Or2}")
    @PreAuthorize("hasRole('USER')")
    public boolean voteOnTournament(@CurrentUser UserPrincipal userPrincipal, @PathVariable long id,
                                    @PathVariable long for1Or2) {
        if (for1Or2 != 1 && for1Or2 != 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid vote option");
        }
        Optional<Tournament> optionalTournament = tournamentRepository.findById(id);
        if (optionalTournament.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Could not find the tournament");
        }
        // check user
        Tournament t = optionalTournament.get();
        Player p = null;
        if (!t.isMultiplayer()) {
            if (!Objects.equals(t.getPrimaryUser().getId(), userPrincipal.getId()))
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot play in this tournament");
        } else {
            Optional<Player> player = playerRepository.findPlayerByTournamentAndUser(t, userPrincipal.getUser());
            if (player.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot play in this tournament");
            }
            p = player.get();
            if (p.isHasVoted()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot vote twice in the same match");
            }
        }
        if (t.getEndTime() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This tournament was already played");
        }
        Optional<Match> optionalMatch = matchRepository.findByTournamentAndMatchIndex(t, t.getCurrentMatchIndex());
        if (optionalMatch.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This tournament has an invalid match");
        }
        if (optionalMatch.get().getWinner() != null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot vote on past matches");
        }
        if (p != null) {
            p.setHasVoted(true);
            playerRepository.save(p);
        }
        if (for1Or2 == 1) {
            matchRepository.findAndIncrementOption1(optionalMatch.get().getId());
        } else {
            matchRepository.findAndIncrementOption2(optionalMatch.get().getId());
        }
        pusherInstance.getPusher().trigger("presence-tournament-" + t.getId(), "votes-changed", t.getId());
        return true;
    }

    @Transactional
    @PostMapping("/tournament/{id}/finish_match")
    @PreAuthorize("hasRole('USER')")
    public boolean finishMatch(@CurrentUser UserPrincipal userPrincipal, @PathVariable long id) {
        Optional<Tournament> optionalTournament = tournamentRepository.findById(id);
        if (optionalTournament.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Could not find the tournament");
        }
        // check user
        Tournament t = optionalTournament.get();
        if (!Objects.equals(t.getPrimaryUser().getId(), userPrincipal.getId()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot do this");

        if (t.getEndTime() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This tournament was already played");
        }
        try {
            finishMatchSemaphore.acquire();
        } catch (InterruptedException ignored) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Error when getting permissions to run");
        }
        Optional<Match> optionalMatch = matchRepository.findByTournamentAndMatchIndex(t, t.getCurrentMatchIndex());
        if (optionalMatch.isEmpty()) {
            finishMatchSemaphore.release();
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This tournament has an invalid match");
        }
        Match m = optionalMatch.get();
        if (m.getWinner() != null) {
            finishMatchSemaphore.release();
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot finish an already finished match");
        }
        if (m.getTotalVotes() <= 0) {
            finishMatchSemaphore.release();
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot finish a match with 0 votes");
        }
        if (m.getOption1() == null || m.getOption2() == null || m.getVotesFor1() == null || m.getVotesFor2() == null) {
            finishMatchSemaphore.release();
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot finish a match with 1 option missing");
        }
        Option winner;
        if (Objects.equals(m.getVotesFor1(), m.getVotesFor2())) {
            Random randomGenerator = new Random();
            if (randomGenerator.nextInt(2) == 0) {
                winner = m.getOption1();
            } else {
                winner = m.getOption2();
            }
        } else if (m.getVotesFor1() >= m.getVotesFor2()) {
            winner = m.getOption1();
        } else {
            winner = m.getOption2();
        }
        List<Player> players = playerRepository.findPlayersByTournament(t);
        for (Player player : players) {
            player.setHasVoted(false);
        }
        if (t.getCurrentMatchIndex() > 1) {
            t.setCurrentMatchIndex(t.getCurrentMatchIndex() - 1);
            Long newMatchIndex = m.getMatchIndex() / 2;
            Optional<Match> newOptionalMatch = matchRepository.findByTournamentAndMatchIndex(t, newMatchIndex);
            if (newOptionalMatch.isEmpty()) {
                finishMatchSemaphore.release();
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not find next match");
            }
            Match newMatch = newOptionalMatch.get();
            if (newMatch.getMatchIndex() * 2 == m.getMatchIndex()) {
                newMatch.setOption1(winner);
            } else {
                newMatch.setOption2(winner);
            }
            matchRepository.saveAndFlush(newMatch);
        } else {
            t.setEndTime(new Date().getTime());
            t.setWinner(winner);
        }
        tournamentRepository.saveAndFlush(t);
        m.setWinner(winner);
        matchRepository.saveAndFlush(m);
        playerRepository.saveAllAndFlush(players);
        pusherInstance.getPusher().trigger("presence-tournament-" + t.getId(), "match-finished",
                new MatchFinishedMessage(m.getId(), m.isFinal()));
        finishMatchSemaphore.release();
        return true;
    }

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
            player.setHasVoted(false);
            players.add(player);
        }
        boolean isMultiplayer = players.size() > 1;
        Tournament tournament = new Tournament();
        tournament.setDecisionList(decisionList);
        Date currentDate = new Date();
        tournament.setStartTime(currentDate.getTime());
        tournament.setMultiplayer(isMultiplayer);
        tournament.setIsDeleted(false);
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
            match.setFinal(matchIndex == 1);
            match.setMatchIndex(matchIndex--);
            if (optionIndex < options.size())
                match.setOption2(options.get(optionIndex++));
            if (optionIndex < options.size())
                match.setOption1(options.get(optionIndex++));
            matches.add(match);
        }
        matchRepository.saveAll(matches);
        tournamentDb.setCurrentMatchIndex(numberOfMatches);
        Tournament newTournament = tournamentRepository.save(tournamentDb);
        if (isMultiplayer) {
            Optional<Lobby> lobby = lobbyRepository.getLobbyByDecisionList(decisionList);
            if (lobby.isPresent()) {
                pusherInstance.getPusher()
                        .trigger("presence-lobby-" + lobby.get().getId(), "tournament-started", newTournament.getId());
            }
        }
        return newTournament.getId();
    }
}
