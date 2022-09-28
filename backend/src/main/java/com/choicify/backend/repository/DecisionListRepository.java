package com.choicify.backend.repository;

import com.choicify.backend.model.DecisionList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DecisionListRepository extends JpaRepository<DecisionList, Long> {
}
