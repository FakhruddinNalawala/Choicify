package com.choicify.backend.model;

import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import javax.persistence.*;

@Getter
@Setter
@Entity
@Table(name = "lobby")
public class Lobby {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private Long id;

    @OneToOne
    @JsonIgnore
    @JoinColumn(name = "decision_list_id", nullable = false)
    private DecisionList decisionList;

    @NonNull
    @Column(unique = true, nullable = false)
    private String lobbyCode;
}