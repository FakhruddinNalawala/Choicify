package com.choicify.backend.repository;

import com.choicify.backend.model.Player;
import com.choicify.backend.model.Tournament;
import com.choicify.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {

    List<Player> findPlayersByTournament(Tournament tournament);

    Optional<Player> findPlayerByTournamentAndUser(Tournament tournament, User user);

}
