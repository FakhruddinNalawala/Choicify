package com.choicify.backend.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;

import java.util.List;

import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.choicify.backend.exception.ResourceNotFoundException;
import com.choicify.backend.model.DecisionList;
import com.choicify.backend.model.User;

@SpringBootTest
@TestMethodOrder(OrderAnnotation.class)
public class DecisionListRepositoryTest {

    @Autowired
    private DecisionListRepository decisionListRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    @Order(1)
    public void testCreateDecisionListRepo() {
        User user = userRepository.findById(2L).orElseThrow(() -> new ResourceNotFoundException("User", "Id", 2L));

        DecisionList decisionList = new DecisionList();            
        decisionList.setQuestion("Lunch");
        decisionList.setUser(user);
        decisionList.setIsDeleted(false);
        decisionListRepository.save(decisionList);

        assertNotNull(decisionListRepository.findById(decisionList.getId()).get());     
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
        List<DecisionList> list = decisionListRepository.findAll();
        Long id = list.get(list.size() -1).getId();
        DecisionList decisionList = decisionListRepository.findById(id).get();
        decisionList.setQuestion("brunch");
        decisionListRepository.save(decisionList);

        assertEquals("brunch", decisionListRepository.findById(id).get().getQuestion());
    }

    @Test
    @Order(4)
    public void testDeleteDecisionListRepository() {
        List<DecisionList> list = decisionListRepository.findAll();
        Long id = list.get(list.size() -1).getId();

        decisionListRepository.deleteById(id);        
        assertFalse(decisionListRepository.existsById(id));
    }
 
}
