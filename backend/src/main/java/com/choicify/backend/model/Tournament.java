package com.choicify.backend.model;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.type.LocalDateTimeType;

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

    @Column(nullable = false)
    private Long currentMatchIndex;

    @ManyToOne
    @JoinColumn(name = "winner", nullable = true)
    private Option winner;

    @ManyToOne
    @JoinColumn(name = "primary_user_id", nullable = false)
    private User primaryUser;

    private boolean isDeleted;

    private Long startTime;

    private Long endTime;

    private boolean isMultiplayer;
}
