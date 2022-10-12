package com.choicify.backend.helpers;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TournamentPlayer {
    private Long id;
    private String name;
    private Boolean hasVoted;
}
