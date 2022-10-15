package com.choicify.backend.helpers;

import com.choicify.backend.model.Match;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TournamentForResponse {
    private Long id;
    private String question;
    private Boolean isPrimary;
    private Match currentMatch;
    private Long playerCount;
    private Boolean hasVoted;
    private List<TournamentPlayer> haveVoted;
    private List<TournamentPlayer> haveNotVoted;
}
