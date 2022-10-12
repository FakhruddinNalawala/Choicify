package com.choicify.backend.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.assertj.core.api.Assertions.assertThat;

import com.choicify.backend.controller.DecisionListController;
import com.choicify.backend.helpers.NewDecisionListBody;
import com.choicify.backend.model.AuthProvider;
import com.choicify.backend.model.DecisionList;
import com.choicify.backend.model.User;
import com.choicify.backend.pusher.PusherInstance;
import com.choicify.backend.repository.DecisionListRepository;
import com.choicify.backend.repository.LobbyRepository;
import com.choicify.backend.repository.OptionRepository;
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

import java.util.Optional;


@ExtendWith(MockitoExtension.class)
public class DecisionListControllerTest {
    @InjectMocks
    DecisionListController decisionListController;

    @Mock
    DecisionListRepository decisionListRepository;
    @Mock
    OptionRepository optionRepository;
    @Mock
    LobbyRepository lobbyRepository;
    @Mock
    TournamentRepository tournamentRepository;
    @Mock
    PusherInstance pusherInstance;

    @Test
    public void testNewDecisionListWorks() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        NewDecisionListBody newDecisionListBody = new NewDecisionListBody("Test question", false);

        User user = new User();
        user.setGivenName("Test Given Name");
        user.setName("Test Name");
        user.setId(1L);
        user.setEmail("test@email.com");
        user.setImageUrl("");
        user.setProvider(AuthProvider.google);

        DecisionList newDecisionList = new DecisionList();
        newDecisionList.setId(2L);
        newDecisionList.setUser(user);
        newDecisionList.setQuestion(newDecisionListBody.getQuestion());
        when(decisionListRepository.save(any(DecisionList.class))).thenReturn(newDecisionList);

        UserPrincipal userPrincipal = UserPrincipal.create(user);

        Long newId = decisionListController.createDecisionList(userPrincipal, newDecisionListBody);

        assertThat(newId).isEqualTo(newDecisionList.getId());
    }

    @Test
    public void testNewDecisionListFailsNoBody() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        NewDecisionListBody newDecisionListBody = new NewDecisionListBody(null, false);

        User user = new User();
        user.setGivenName("Test Given Name");
        user.setName("Test Name");
        user.setId(1L);
        user.setEmail("test@email.com");
        user.setImageUrl("");
        user.setProvider(AuthProvider.google);

        UserPrincipal userPrincipal = UserPrincipal.create(user);

        ResponseStatusException thrown = assertThrows(ResponseStatusException.class,
                () -> decisionListController.createDecisionList(userPrincipal, newDecisionListBody),
                "Expected createDecisionList() to throw, but it didn't");
        assertEquals("400 BAD_REQUEST \"Please provide a question to create a new list\"", thrown.getMessage());
    }

    @Test
    public void testGetDecisionList() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        User user = new User();
        user.setGivenName("Test Given Name");
        user.setName("Test Name");
        user.setId(1L);
        user.setEmail("test@email.com");
        user.setImageUrl("");
        user.setProvider(AuthProvider.google);

        DecisionList newDecisionList = new DecisionList();
        newDecisionList.setId(2L);
        newDecisionList.setUser(user);
        newDecisionList.setQuestion("Test question");
        Optional<DecisionList> optionalDecisionList = Optional.of(newDecisionList);
        when(decisionListRepository.findById(newDecisionList.getId())).thenReturn(optionalDecisionList);

        UserPrincipal userPrincipal = UserPrincipal.create(user);
        DecisionList returned = decisionListController.getDecisionList(userPrincipal, newDecisionList.getId());

        assertThat(returned).isEqualTo(newDecisionList);
    }

    @Test
    public void testGetDecisionListFailsEmpty() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        User user = new User();
        user.setGivenName("Test Given Name");
        user.setName("Test Name");
        user.setId(1L);
        user.setEmail("test@email.com");
        user.setImageUrl("");
        user.setProvider(AuthProvider.google);

        DecisionList newDecisionList = new DecisionList();
        newDecisionList.setId(2L);
        newDecisionList.setUser(user);
        newDecisionList.setQuestion("Test question");
        Optional<DecisionList> optionalDecisionList = Optional.empty();
        when(decisionListRepository.findById(newDecisionList.getId())).thenReturn(optionalDecisionList);

        UserPrincipal userPrincipal = UserPrincipal.create(user);
        ResponseStatusException thrown = assertThrows(ResponseStatusException.class,
                () -> decisionListController.getDecisionList(userPrincipal, newDecisionList.getId()),
                "Expected createDecisionList() to throw, but it didn't");

        assertEquals("404 NOT_FOUND \"Could not find the decision list\"", thrown.getMessage());
    }

    @Test
    public void testGetDecisionListFailsDifferentUserFails() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        User user = new User();
        user.setGivenName("Test Given Name");
        user.setName("Test Name");
        user.setId(1L);
        user.setEmail("test@email.com");
        user.setImageUrl("");
        user.setProvider(AuthProvider.google);

        DecisionList newDecisionList = new DecisionList();
        newDecisionList.setId(2L);
        newDecisionList.setUser(user);
        newDecisionList.setQuestion("Test question");
        Optional<DecisionList> optionalDecisionList = Optional.of(newDecisionList);
        when(decisionListRepository.findById(newDecisionList.getId())).thenReturn(optionalDecisionList);

        User otherUser = new User();
        otherUser.setGivenName("Test Given Name");
        otherUser.setName("Test Name");
        otherUser.setId(2L);
        otherUser.setEmail("test@email.com");
        otherUser.setImageUrl("");
        otherUser.setProvider(AuthProvider.google);

        UserPrincipal userPrincipal = UserPrincipal.create(otherUser);
        ResponseStatusException thrown = assertThrows(ResponseStatusException.class,
                () -> decisionListController.getDecisionList(userPrincipal, newDecisionList.getId()),
                "Expected createDecisionList() to throw, but it didn't");

        assertEquals("404 NOT_FOUND \"Could not find the decision list\"", thrown.getMessage());
    }

}
