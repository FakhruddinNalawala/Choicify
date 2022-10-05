package com.choicify.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Getter
@Setter
@Entity
@Table(name = "match_table", indexes = {@Index(columnList = "tournament_id, match_index")})
public class Match {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @ManyToOne
    @JoinColumn(name = "option_1", nullable = true)
    private Option option1;

    @ManyToOne
    @JoinColumn(name = "option_2", nullable = true)
    private Option option2;

    @ManyToOne
    @JoinColumn(name = "winner", nullable = true)
    private Option winner;

    @Column(name = "match_index", nullable = false)
    private Long matchIndex;

    private Long votesFor1;

    private Long votesFor2;

    private Long totalVotes;

    private boolean isFinal;
}
