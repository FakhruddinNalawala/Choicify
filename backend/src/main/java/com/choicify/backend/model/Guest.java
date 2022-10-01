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
class GuestKey implements Serializable {

    @Column(name = "User_ID")
    Long userId;

    @Column(name = "Lobby_ID")
    Long lobbyId;
}

@Getter
@Setter
@Entity
public class Guest {

    @EmbeddedId
    GuestKey id;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "User_ID")
    User user;

    @ManyToOne
    @MapsId("lobbyId")
    @JoinColumn(name = "Lobby_ID")
    Lobby lobby;
}
