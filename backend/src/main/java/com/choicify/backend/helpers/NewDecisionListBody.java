package com.choicify.backend.helpers;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@RequiredArgsConstructor
@AllArgsConstructor
public class NewDecisionListBody {
    private String question;
    private boolean is_deleted;
}
