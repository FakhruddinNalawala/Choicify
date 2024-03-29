package com.choicify.backend.repository;

import com.choicify.backend.model.DecisionList;
import com.choicify.backend.model.Lobby;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LobbyRepository extends JpaRepository<Lobby, Long> {
    Optional<Integer> deleteByDecisionList(DecisionList decisionList);
    Optional<Lobby> getLobbyByLobbyCode(String lobbyCode);

    Optional<Lobby> getLobbyByDecisionList(DecisionList decisionList);
}

//    @Query("SELECT p FROM Person p JOIN FETCH p.roles WHERE p.id = (:id)")
//    public Person findByIdAndFetchRolesEagerly(@Param("id") Long id);