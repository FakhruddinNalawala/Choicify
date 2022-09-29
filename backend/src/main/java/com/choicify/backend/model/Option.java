package com.choicify.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Getter
@Setter
@Entity
@Table(name = "option_table")
public class Option {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private Long id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "decision_list_id", nullable = false)
    private DecisionList decisionList;

    @Column(nullable = false)
    private String name;

    private String description;

    private String url;

    private Boolean isDeleted;
}
