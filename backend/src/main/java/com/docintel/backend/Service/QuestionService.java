package com.docintel.backend.Service;

import com.docintel.backend.Dto.QuestionRequest;
import com.docintel.backend.Dto.QuestionResponse;
import com.docintel.backend.Entity.PdfDocument;
import com.docintel.backend.Entity.Role;
import com.docintel.backend.Entity.User;
import com.docintel.backend.Repository.PdfRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final PdfRepository pdfRepository;
    private final VectorStore vectorStore;
    private final LlmService llmService;

    public QuestionResponse askQuestion(
            QuestionRequest request,
            User currentUser
    ) {

        List<PdfDocument> userDocuments =
                pdfRepository.findByOwner_IdOrderByUploadedAtDesc(
                        currentUser.getId()
                );

        List<Long> userOwnedDocIds = userDocuments.stream()
                .map(PdfDocument::getId)
                .collect(Collectors.toList());

        List<Long> searchDocIds;

        if (request.getDocumentIds() != null
                && !request.getDocumentIds().isEmpty()) {

            if (currentUser.getRole() != Role.ADMIN) {

                for (Long requestedId : request.getDocumentIds()) {

                    if (!userOwnedDocIds.contains(requestedId)) {

                        throw new AccessDeniedException(
                                "You do not have permission to access document ID: "
                                        + requestedId
                        );
                    }
                }
            }

            searchDocIds = request.getDocumentIds();

        } else {

            searchDocIds = userOwnedDocIds;
        }

        if (searchDocIds.isEmpty()) {

            return QuestionResponse.builder()
                    .answer("No uploaded documents found.")
                    .citations(List.of())
                    .build();
        }

        String filterExpression =
                "documentId in [" +
                        searchDocIds.stream()
                                .map(String::valueOf)
                                .collect(Collectors.joining(",")) +
                        "]";

        List<Document> matches =
                vectorStore.similaritySearch(
                        SearchRequest.builder()
                                .query(request.getQuestion())
                                .topK(3)
                                .filterExpression(filterExpression)
                                .build()
                );

        if (matches == null || matches.isEmpty()) {

            return QuestionResponse.builder()
                    .answer(
                            "No relevant information was found in the selected documents."
                    )
                    .citations(List.of())
                    .build();
        }

        StringBuilder contextBuilder =
                new StringBuilder();

        List<QuestionResponse.Citation> citations =
                new ArrayList<>();

        for (Document match : matches) {

            String content = match.getText();

            Long documentId =
                    Long.parseLong(
                            match.getMetadata()
                                    .get("documentId")
                                    .toString()
                    );

            String fileName =
                    match.getMetadata()
                            .get("fileName")
                            .toString();

            int pageNumber =
                    Integer.parseInt(
                            match.getMetadata()
                                    .get("pageNumber")
                                    .toString()
                    );

            contextBuilder.append("[Source: ")
                    .append(fileName)
                    .append(", Page: ")
                    .append(pageNumber)
                    .append("]\n")
                    .append(content)
                    .append("\n\n");

            String snippet = content;

            if (snippet.length() > 200) {
                snippet = snippet.substring(0, 200) + "...";
            }

            citations.add(
                    new QuestionResponse.Citation(
                            documentId,
                            fileName,
                            pageNumber,
                            snippet
                    )
            );
        }

        String answer =
                llmService.generateAnswer(
                        contextBuilder.toString(),
                        request.getQuestion()
                );

        return QuestionResponse.builder()
                .answer(answer)
                .citations(citations)
                .build();
    }
}