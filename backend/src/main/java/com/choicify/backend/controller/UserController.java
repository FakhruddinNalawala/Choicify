package com.choicify.backend.controller;

import com.choicify.backend.exception.ResourceNotFoundException;
import com.choicify.backend.model.Lobby;
import com.choicify.backend.model.Tournament;
import com.choicify.backend.model.User;
import com.choicify.backend.pusher.PusherInstance;
import com.choicify.backend.repository.LobbyRepository;
import com.choicify.backend.repository.TournamentRepository;
import com.choicify.backend.repository.UserRepository;
import com.choicify.backend.security.CurrentUser;
import com.choicify.backend.security.UserPrincipal;
import com.pusher.rest.data.PresenceUser;
import lombok.*;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;

@Data
@AllArgsConstructor
@NoArgsConstructor
class PusherAuthBody {
    private String socket_id;
    private String channel_name;
}

@Data
@AllArgsConstructor
@NoArgsConstructor
class PusherPresenceUser {
    private String name;
    private Long id;
}

@RestController
@RequiredArgsConstructor
@RequestMapping(path = "/api")
public class UserController {

    private final UserRepository userRepository;
    private final PusherInstance pusherInstance;
    private final LobbyRepository lobbyRepository;
    private final TournamentRepository tournamentRepository;

    @GetMapping("/profile")
    @PreAuthorize("hasRole('USER')")
    public User getCurrentUser(@CurrentUser UserPrincipal userPrincipal) {
        return userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));
    }

    @GetMapping("/test_session")
    @PreAuthorize("hasRole('USER')")
    public Boolean getCurrentUser() {
        return true;
    }

    @PostMapping(value = "/pusher/auth", consumes = {"application/x-www-form-urlencoded"})
    @PreAuthorize("hasRole('USER')")
    public String authenticateUserInPusher(@CurrentUser UserPrincipal userPrincipal, PusherAuthBody body) {
        if (body.getSocket_id() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden");
        }
        String channel = body.getChannel_name();
        if (channel == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing channel name");
        }
        String[] parts = channel.split("-");
        if (parts.length != 3 || !parts[0].equals("presence") ||
                (!parts[1].equals("lobby") && !parts[1].equals("tournament"))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bad channel format");
        }
        Long id = Long.parseLong(parts[2], 10);
        if (parts[1].equals("lobby")) {
            Optional<Lobby> lobby = lobbyRepository.findById(id);
            if (lobby.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bad channel ID");
            }
        } else { // tournament
            Optional<Tournament> tournament = tournamentRepository.findById(id);
            if (tournament.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bad channel ID");
            }
            Tournament t = tournament.get();
            if (t.isDeleted() || !t.isMultiplayer()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tournament not available");
            }
            // TODO: check that user is in tournament (via players table)
        }
        PusherPresenceUser userInfo =
                new PusherPresenceUser(userPrincipal.getUser().getGivenName(), userPrincipal.getId());
        PresenceUser presenceUser = new PresenceUser(userPrincipal.getId(), userInfo);
        return pusherInstance.getPusher().authenticate(body.getSocket_id(), body.getChannel_name(), presenceUser);
    }

    @GetMapping("/profile/picture/{userId}.svg")
    public ResponseEntity<Resource> getProfileImage(@PathVariable long userId) {
        ResponseEntity<Resource> response;
        try {
            String inputFile = "./files/profile_pictures/" + userId + ".svg";
            File file = new File(inputFile);
            if (!file.exists()) {
                throw new FileNotFoundException();
            }
            Path path = file.toPath();
            FileSystemResource resource = new FileSystemResource(path);
            response = ResponseEntity.ok().contentType(MediaType.parseMediaType(Files.probeContentType(path)))
                    .body(resource);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found");
        }
        return response;
    }
}
