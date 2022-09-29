package com.choicify.backend.repository;

import com.choicify.backend.model.DecisionList;
import com.choicify.backend.model.Option;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OptionRepository extends JpaRepository<Option, Long> {
    List<Option> findByDecisionList(DecisionList decisionList);

    //    @Query(value = "SELECT * FROM option_table o WHERE o.decision_list_id = ?1")
    @Query(value = "SELECT * FROM choicify.option_table o WHERE o.decision_list_id = ?1 AND o.is_deleted IS null",
            nativeQuery = true)
    List<Option> findByDecisionListNotDeleted(Long decisionListId);
}
