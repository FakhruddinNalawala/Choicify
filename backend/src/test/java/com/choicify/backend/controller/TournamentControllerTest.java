package com.choicify.backend.controller;

import com.choicify.backend.helpers.TournamentForResponse;
import com.choicify.backend.helpers.TournamentPlayer;
import com.choicify.backend.model.*;
import com.choicify.backend.repository.MatchRepository;
import com.choicify.backend.repository.PlayerRepository;
import com.choicify.backend.repository.TournamentRepository;
import com.choicify.backend.security.UserPrincipal;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

import static org.mockito.Mockito.when;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;


@ExtendWith(MockitoExtension.class)
public class TournamentControllerTest {
    @InjectMocks
    TournamentController tournamentController;

    @Mock
    TournamentRepository tournamentRepository;
    @Mock
    PlayerRepository playerRepository;
    @Mock
    MatchRepository matchRepository;

    @Test
    public void testGetTournamentWorks() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
        User user = new User();
        user.setGivenName("Test Given Name");
        user.setName("Test Name");
        user.setId(1L);
        user.setEmail("test@email.com");
        user.setImageUrl("");
        user.setProvider(AuthProvider.google);

        User otherUser = new User();
        otherUser.setGivenName("Test Given Name");
        otherUser.setName("Test Name");
        otherUser.setId(1L);
        otherUser.setEmail("test@email.com");
        otherUser.setImageUrl("");
        otherUser.setProvider(AuthProvider.google);

        UserPrincipal userPrincipal = UserPrincipal.create(otherUser);

        DecisionList newDecisionList = new DecisionList();
        newDecisionList.setId(2L);
        newDecisionList.setUser(user);
        newDecisionList.setQuestion("Test question");

        Tournament t = new Tournament();
        t.setId(5L);
        t.setPlayerCount(1L);
        t.setMultiplayer(false);
        t.setDecisionList(newDecisionList);
        t.setCurrentMatchIndex(2L);
        t.setPrimaryUser(user);
        t.setStartTime(new Date().getTime());
        t.setIsDeleted(false);

        Option option1 = new Option();
        option1.setName("Option 1");
        option1.setId(7L);
        Option option2 = new Option();
        option2.setName("Option 2");
        option2.setId(8L);

        Match match = new Match();
        match.setId(6L);
        match.setTournament(t);
        match.setFinal(false);
        match.setOption1(option1);
        match.setOption2(option2);
        match.setMatchIndex(2L);
        match.setTotalVotes(1L);

        List<Player> playerList = new ArrayList<>();
        Player p = new Player();
        p.setTournament(t);
        p.setHasVoted(true);
        p.setUser(user);
        p.setId(10L);
        playerList.add(p);

        List<TournamentPlayer> haveVoted = new LinkedList<>();
        haveVoted.add(new TournamentPlayer(p.getUser().getId(), p.getUser().getGivenName(), p.isHasVoted()));

        when(tournamentRepository.findById(t.getId())).thenReturn(Optional.of(t));
        //        when(playerRepository.findPlayerByTournamentAndUser(t, user)).thenReturn(Optional.of(p));
        when(matchRepository.findByTournamentAndMatchIndex(t, t.getCurrentMatchIndex())).thenReturn(Optional.of(match));
        when(playerRepository.findPlayersByTournament(t)).thenReturn(playerList);
        TournamentForResponse response =
                new TournamentForResponse(t.getId(), t.getDecisionList().getQuestion(), true, match, t.getPlayerCount(),
                        true, haveVoted, new LinkedList<>());
        TournamentForResponse actual = tournamentController.getTournament(userPrincipal, t.getId());
        assertThat(actual).isEqualTo(response);
    }

    @Test
    public void testGetTournamentFailsOtherUser() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
        User user = new User();
        user.setGivenName("Test Given Name");
        user.setName("Test Name");
        user.setId(1L);
        user.setEmail("test@email.com");
        user.setImageUrl("");
        user.setProvider(AuthProvider.google);

        User otherUser = new User();
        otherUser.setGivenName("Test Given Name");
        otherUser.setName("Test Name");
        otherUser.setId(2L);
        otherUser.setEmail("test@email.com");
        otherUser.setImageUrl("");
        otherUser.setProvider(AuthProvider.google);

        UserPrincipal userPrincipal = UserPrincipal.create(otherUser);

        DecisionList newDecisionList = new DecisionList();
        newDecisionList.setId(2L);
        newDecisionList.setUser(user);
        newDecisionList.setQuestion("Test question");

        Tournament t = new Tournament();
        t.setId(5L);
        t.setPlayerCount(1L);
        t.setMultiplayer(false);
        t.setDecisionList(newDecisionList);
        t.setCurrentMatchIndex(2L);
        t.setPrimaryUser(user);
        t.setStartTime(new Date().getTime());
        t.setIsDeleted(false);

        when(tournamentRepository.findById(t.getId())).thenReturn(Optional.of(t));
        ResponseStatusException thrown = assertThrows(ResponseStatusException.class,
                () -> tournamentController.getTournament(userPrincipal, t.getId()),
                "Expected getTournament() to throw, but it didn't");
        assertEquals("403 FORBIDDEN \"You cannot play in this tournament\"", thrown.getMessage());
    }

}
