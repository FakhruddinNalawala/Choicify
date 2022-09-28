package com.choicify.backend.controller;

import com.choicify.backend.exception.ResourceNotFoundException;
import com.choicify.backend.model.User;
import com.choicify.backend.repository.UserRepository;
import com.choicify.backend.security.CurrentUser;
import com.choicify.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequiredArgsConstructor
@RequestMapping(path = "/api")
public class UserController {

    private final UserRepository userRepository;

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
