package com.choicify.backend.model;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Getter
@Setter
@Entity
@Table(name = "match_table")
public class Match {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @ManyToOne
    @JoinColumn(name = "option_1", nullable = false)
    private Option option1;

    @ManyToOne
    @JoinColumn(name = "option_2", nullable = false)
    private Option option2;

    @ManyToOne
    @JoinColumn(name = "winner", nullable = true)
    private Option winner;

    private Long winningVotes;

    private Long losingVotes;

    private Boolean isMultiplayer;

}
