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

    @OneToMany(mappedBy = "lobby", targetEntity = Guest.class, fetch = FetchType.LAZY)
    private Set<Guest> guests;

    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "decision_list_id", nullable = false)
    private DecisionList decisionList;

    @NonNull
    @Column(unique = true, nullable = false)
    private String lobbyCode;
}