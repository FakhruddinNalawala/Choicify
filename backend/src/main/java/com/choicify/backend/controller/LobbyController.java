package com.choicify.backend.controller;

import com.choicify.backend.model.Lobby;
import com.choicify.backend.repository.LobbyRepository;
import com.choicify.backend.security.CurrentUser;
import com.choicify.backend.security.UserPrincipal;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Getter
@Setter
@RequiredArgsConstructor
class NewLobbyBody {
    private Long listId;
}

@RestController
@RequiredArgsConstructor
@RequestMapping(path = "/api")
public class LobbyController {
    private final LobbyRepository lobbyRepository;
}
