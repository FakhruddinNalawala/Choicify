package com.choicify.backend.repository;

import com.choicify.backend.model.DecisionList;
import com.choicify.backend.model.User;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestMethodOrder(OrderAnnotation.class)
public class DecisionListRepositoryTest {

    private static DecisionList decisionListInDb = null;
    @Autowired
    private DecisionListRepository decisionListRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    @Order(1)
    public void testCreateDecisionListRepo() {
        decisionListInDb = null;
        List<User> users = userRepository.findAll();
        assertTrue(users.size() > 0);

        User user = users.get(0);

        DecisionList decisionList = new DecisionList();
        decisionList.setQuestion("Lunch");
        decisionList.setUser(user);
        decisionList.setIsDeleted(false);
        decisionListInDb = decisionListRepository.save(decisionList);

        assertTrue(decisionListRepository.findById(decisionListInDb.getId()).isPresent());
    }

    @Test
    @Order(2)
    public void testReadAllDecisionListRepo() {
        List<DecisionList> list = decisionListRepository.findAll();
        assertTrue(list.size() > 0);
    }

    @Test
    @Order(3)
    public void testUpdateDecisionListRepo() {
        assertNotNull(decisionListInDb);
        Optional<DecisionList> optionalDecisionList = decisionListRepository.findById(decisionListInDb.getId());
        assertTrue(optionalDecisionList.isPresent());
        DecisionList decisionList = optionalDecisionList.get();
        decisionList.setQuestion("brunch");
        decisionListRepository.save(decisionList);

        Optional<DecisionList> result = decisionListRepository.findById(decisionListInDb.getId());
        assertTrue(result.isPresent());

        assertEquals("brunch", result.get().getQuestion());
    }

    @Test
    @Order(4)
    public void testDeleteDecisionListRepository() {
        assertNotNull(decisionListInDb);

        decisionListRepository.deleteById(decisionListInDb.getId());
        assertFalse(decisionListRepository.existsById(decisionListInDb.getId()));
        decisionListInDb = null;
    }

}
