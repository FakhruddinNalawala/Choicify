package com.choicify.backend.model;

import lombok.*;

import javax.persistence.*;
import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Embeddable
class PlayerKey implements Serializable {

    @Column(name = "User_ID")
    Long userId;

    @Column(name = "Tournament_ID")
    Long tournamentId;
}

@Getter
@Setter
@Entity
@Table(name = "player")
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    Long id;

    @ManyToOne
    @JoinColumn(name = "User_ID")
    User user;

    @ManyToOne
    @JoinColumn(name = "Tournament_ID")
    Tournament tournament;

    boolean isPrimary;
}
