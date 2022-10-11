package com.choicify.backend.repository;

import com.choicify.backend.model.DecisionList;
import com.choicify.backend.model.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TournamentRepository extends JpaRepository<Tournament, Long> {
    Optional<Tournament> deleteByDecisionList(DecisionList decisionList);

    @Query(value = "SELECT COUNT(*) FROM choicify.tournament t WHERE t.decision_list_id = ?1 AND t.is_deleted=0",
            nativeQuery = true)
    Integer getCountByDecisionListId(Long decisionListId);

    List<Tournament> findByDecisionListAndIsDeleted(DecisionList decisionList, Boolean isDeleted);
}
