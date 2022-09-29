package com.choicify.backend.controller;

import com.choicify.backend.model.DecisionList;
import com.choicify.backend.model.Option;
import com.choicify.backend.model.User;
import com.choicify.backend.repository.DecisionListRepository;
import com.choicify.backend.repository.OptionRepository;
import com.choicify.backend.repository.UserRepository;
import com.choicify.backend.security.CurrentUser;
import com.choicify.backend.security.UserPrincipal;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import net.bytebuddy.implementation.bind.annotation.IgnoreForBinding;
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
class NewDecisionListBody {
    private String question;
}

@Getter
@Setter
@RequiredArgsConstructor
class NewOptionBody {
    private String name;
    private String description;
    private String url;
}

@RestController
@RequiredArgsConstructor
@RequestMapping(path = "/api")
public class DecisionListController {
    private final DecisionListRepository decisionListRepository;
    private final OptionRepository optionRepository;

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

    @GetMapping("/decisionList/{id}")
    @PreAuthorize("hasRole('USER')")
    public DecisionList getDecisionList(@CurrentUser UserPrincipal userPrincipal, @PathVariable long id) {
        return getDecisionListFromDb(userPrincipal, id);
    }

    @GetMapping("/decisionList/{id}/options")
    @PreAuthorize("hasRole('USER')")
    public List<Option> getDecisionListOptions(@CurrentUser UserPrincipal userPrincipal, @PathVariable long id) {
        DecisionList decisionList = getDecisionListFromDb(userPrincipal, id);
        return optionRepository.findByDecisionList(decisionList);
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
        return optionRepository.save(newOption);
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
        return optionRepository.save(updateOption);
    }

    private DecisionList getDecisionListFromDb(@CurrentUser UserPrincipal userPrincipal, @PathVariable long id) {
        Optional<DecisionList> decisionList = decisionListRepository.findById(id);
        if (!decisionList.isPresent()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Could not found the decision list");
        }
        if (!Objects.equals(decisionList.get().getUser().getId(), userPrincipal.getUser().getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Could not found the decision list");
        }
        return decisionList.get();
    }
}
