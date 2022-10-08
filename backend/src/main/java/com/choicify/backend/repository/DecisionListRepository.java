package com.choicify.backend.repository;

import com.choicify.backend.model.DecisionList;
import com.choicify.backend.model.User;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DecisionListRepository extends JpaRepository<DecisionList, Long> {

    List<DecisionList> findByUserAndIsDeletedIs(User user, Boolean isDeleted);
    
}
