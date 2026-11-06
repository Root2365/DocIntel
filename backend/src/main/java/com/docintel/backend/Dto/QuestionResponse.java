package com.docintel.backend.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponse {

    private String answer;

    private List<Citation> citations;

    public record Citation(
            Long documentId,
            String fileName,
            int pageNumber,
            String snippet
    ) {
    }
}