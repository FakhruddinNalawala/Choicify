package com.choicify.backend.controller;

import com.choicify.backend.model.DecisionList;
import com.choicify.backend.model.User;
import com.choicify.backend.repository.DecisionListRepository;
import com.choicify.backend.repository.UserRepository;
import com.choicify.backend.security.CurrentUser;
import com.choicify.backend.security.UserPrincipal;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Getter
@Setter
@RequiredArgsConstructor
class NewDecisionListBody {
    private String question;
}

@RestController
@RequiredArgsConstructor
@RequestMapping(path = "/api")
public class DecisionListController {
    private final DecisionListRepository decisionListRepository;
    private final UserRepository userRepository;

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
}
