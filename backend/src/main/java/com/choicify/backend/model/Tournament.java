package com.choicify.backend.model;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.sql.Date;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "tournament")
public class Tournament {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private Long id;

    @OneToMany(mappedBy = "tournament", targetEntity = Player.class, fetch = FetchType.LAZY)
    private Set<Player> players;

    @ManyToOne
    @JoinColumn(name = "decision_list_id", nullable = false)
    private DecisionList decisionList;

    @ManyToOne
    @JoinColumn(name = "current_match", nullable = false)
    private Match currentMatch;

    @ManyToOne
    @JoinColumn(name = "winner", nullable = false)
    private Option winner;

    private boolean isDeleted;

    private Date startTime;

    private Date endTime;

    private boolean isMultiplayer;
}
