package com.choicify.backend.repository;

import com.choicify.backend.model.DecisionList;
import com.choicify.backend.model.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TournamentRepository extends JpaRepository<Tournament, Long> {
    Optional<Tournament> deleteByDecisionList(DecisionList decisionList);
}
