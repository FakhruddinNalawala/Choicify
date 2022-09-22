package com.choicify.backend.model;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.io.Serializable;

@Getter
@Setter
@EqualsAndHashCode
@Embeddable
@Table(name = "player")
class PlayerKey implements Serializable {

    @Column(name = "User_ID")
    Long userId;

    @Column(name = "Tournament_ID")
    Long tournamentId;
}

@Getter
@Setter
@Entity
public class Player {

    @EmbeddedId
    PlayerKey id;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "User_ID")
    User user;

    @ManyToOne
    @MapsId("tournamentId")
    @JoinColumn(name = "Tournament_ID")
    Tournament tournament;

    boolean isPrimary;
}
