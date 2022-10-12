package com.choicify.backend.repository;

import com.choicify.backend.model.Match;
import com.choicify.backend.model.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface MatchRepository extends JpaRepository<Match, Long> {
    Optional<Match> findByTournamentAndMatchIndex(Tournament tournament, Long matchIndex);

    @Modifying
    @Query(value = "UPDATE choicify.match_table o SET o.votes_for1=o.votes_for1+1, o.total_votes=o.total_votes+1 WHERE o.id = ?1",
            nativeQuery = true)
    void findAndIncrementOption1(Long matchId);

    @Modifying
    @Query(value = "UPDATE choicify.match_table o SET o.votes_for2=o.votes_for2+1, o.total_votes=o.total_votes+1 WHERE o.id = ?1",
            nativeQuery = true)
    void findAndIncrementOption2(Long matchId);

    Optional<Match> findByIdAndTournament(Long id, Tournament tournament);

    List<Match> findByTournamentOrderByMatchIndex(Tournament tournament);
}
