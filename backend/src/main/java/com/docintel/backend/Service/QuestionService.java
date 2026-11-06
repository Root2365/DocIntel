package com.docintel.backend.Service;

import com.docintel.backend.Dto.QuestionRequest;
import com.docintel.backend.Dto.QuestionResponse;
import com.docintel.backend.Entity.DocumentChunk;
import com.docintel.backend.Entity.PdfDocument;
import com.docintel.backend.Entity.Role;
import com.docintel.backend.Entity.User;
import com.docintel.backend.Repository.DocumentChunkRepository;
import com.docintel.backend.Repository.PdfRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final DocumentChunkRepository chunkRepository;
    private final PdfRepository pdfRepository;
    private final EmbeddingService embeddingService;
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
                .toList();

        List<Long> searchDocIds;

        if (request.getDocumentIds() != null
                && !request.getDocumentIds().isEmpty()) {

            if (currentUser.getRole() != Role.ADMIN) {

                for (Long requestedId :
                        request.getDocumentIds()) {

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

        List<DocumentChunk> chunks =
                chunkRepository.findByDocument_IdIn(
                        searchDocIds
                );

        if (chunks.isEmpty()) {

            return QuestionResponse.builder()
                    .answer("No indexed document content found.")
                    .citations(List.of())
                    .build();
        }

        List<Float> queryEmbedding =
                embeddingService.generateEmbedding(
                        request.getQuestion()
                );

        List<ScoredChunk> scoredChunks =
                chunks.stream()
                        .map(chunk -> new ScoredChunk(
                                chunk,
                                cosineSimilarity(
                                        queryEmbedding,
                                        parseEmbedding(
                                                chunk.getEmbedding()
                                        )
                                )
                        ))
                        .sorted(
                                Comparator.comparingDouble(
                                        ScoredChunk::score
                                ).reversed()
                        )
                        .limit(3)
                        .toList();

        StringBuilder contextBuilder =
                new StringBuilder();

        List<QuestionResponse.Citation> citations =
                new ArrayList<>();

        for (ScoredChunk scored : scoredChunks) {

            DocumentChunk chunk = scored.chunk();

            PdfDocument document =
                    chunk.getDocument();

            contextBuilder.append(
                    "[Source: "
            ).append(
                    document.getFileName()
            ).append(
                    ", Page: "
            ).append(
                    chunk.getPageNumber()
            ).append(
                    "]\n"
            ).append(
                    chunk.getContent()
            ).append(
                    "\n\n"
            );

            String snippet = chunk.getContent();

            if (snippet.length() > 200) {
                snippet = snippet.substring(0, 200) + "...";
            }

            citations.add(
                    new QuestionResponse.Citation(
                            document.getId(),
                            document.getFileName(),
                            chunk.getPageNumber(),
                            snippet
                    )
            );
        }

        String context =
                contextBuilder.toString();

        String answer =
                llmService.generateAnswer(
                        context,
                        request.getQuestion()
                );

        return QuestionResponse.builder()
                .answer(answer)
                .citations(citations)
                .build();
    }

    private List<Float> parseEmbedding(
            String embeddingText
    ) {

        if (embeddingText == null
                || embeddingText.isBlank()) {

            return List.of();
        }

        String cleaned = embeddingText
                .replace("[", "")
                .replace("]", "")
                .trim();

        if (cleaned.isBlank()) {
            return List.of();
        }

        return java.util.Arrays.stream(
                        cleaned.split(","))
                .map(String::trim)
                .map(Float::parseFloat)
                .collect(Collectors.toList());
    }

    private double cosineSimilarity(
            List<Float> vectorA,
            List<Float> vectorB
    ) {

        if (vectorA.isEmpty()
                || vectorB.isEmpty()) {

            return 0.0;
        }

        int dimensions = Math.min(
                vectorA.size(),
                vectorB.size()
        );

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < dimensions; i++) {

            double a = vectorA.get(i);
            double b = vectorB.get(i);

            dotProduct += a * b;
            normA += a * a;
            normB += b * b;
        }

        if (normA == 0 || normB == 0) {
            return 0.0;
        }

        return dotProduct /
                (Math.sqrt(normA)
                        * Math.sqrt(normB));
    }

    private record ScoredChunk(
            DocumentChunk chunk,
            double score
    ) {
    }
}
