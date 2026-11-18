package com.docintel.backend.Service;

import com.docintel.backend.Common.Exception.ResourceNotFoundException;
import com.docintel.backend.Dto.QuestionRequest;
import com.docintel.backend.Dto.QuestionResponse;
import com.docintel.backend.Entity.ChatMessage;
import com.docintel.backend.Entity.ChatSession;
import com.docintel.backend.Entity.PdfDocument;
import com.docintel.backend.Entity.Role;
import com.docintel.backend.Entity.User;
import com.docintel.backend.Repository.ChatMessageRepository;
import com.docintel.backend.Repository.ChatSessionRepository;
import com.docintel.backend.Repository.PdfRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final PdfRepository pdfRepository;
    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final VectorStore vectorStore;
    private final LlmService llmService;

    public ChatSession createSession(User currentUser) {
        return createSession(currentUser, "New Chat");
    }

    public ChatSession createSession(User currentUser, String title) {
        return chatSessionRepository.save(
                ChatSession.builder()
                        .user(currentUser)
                        .title(title == null || title.isBlank()
                                ? "New Chat"
                                : title.trim())
                        .build()
        );
    }

    public List<ChatSession> getUserSessions(User currentUser) {
        return chatSessionRepository.findByUser_IdOrderByCreatedAtDesc(
                currentUser.getId()
        );
    }

    public List<ChatMessage> getSessionMessages(
            Long sessionId,
            User currentUser
    ) {
        getOwnedSession(sessionId, currentUser);
        return chatMessageRepository.findBySession_IdOrderByCreatedAtAsc(
                sessionId
        );
    }

    public QuestionResponse askQuestion(
            QuestionRequest request,
            User currentUser
    ) {

        ChatSession session = request.getSessionId() == null
                ? null
                : getOwnedSession(request.getSessionId(), currentUser);

        List<ChatMessage> conversationHistory = session == null
                ? List.of()
                : getLastMessages(session.getId());

        if (session != null) {
            chatMessageRepository.save(
                    ChatMessage.builder()
                            .session(session)
                            .role("user")
                            .content(request.getQuestion())
                            .build()
            );
        }

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

            return createResponse(
                    session,
                    "No uploaded documents found.",
                    List.of()
            );
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

            return createResponse(
                    session,
                    "No relevant information was found in the selected documents.",
                    List.of()
            );
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

        String answer = conversationHistory.isEmpty()
                ? llmService.generateAnswer(
                        contextBuilder.toString(),
                        request.getQuestion()
                )
                : llmService.generateAnswer(
                        contextBuilder.toString(),
                        request.getQuestion(),
                        formatConversationHistory(conversationHistory)
                );

        return createResponse(session, answer, citations);
    }

    private QuestionResponse createResponse(
            ChatSession session,
            String answer,
            List<QuestionResponse.Citation> citations
    ) {
        if (session != null) {
            chatMessageRepository.save(
                    ChatMessage.builder()
                            .session(session)
                            .role("assistant")
                            .content(answer)
                            .citations(serializeCitations(citations))
                            .build()
            );
        }

        return QuestionResponse.builder()
                .answer(answer)
                .citations(citations)
                .build();
    }

    private ChatSession getOwnedSession(Long sessionId, User currentUser) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Chat session not found."
                ));

        if (!Objects.equals(session.getUser().getId(), currentUser.getId())) {
            throw new AccessDeniedException(
                    "You do not have permission to access this chat session."
            );
        }

        return session;
    }

    private List<ChatMessage> getLastMessages(Long sessionId) {
        List<ChatMessage> messages =
                chatMessageRepository.findTop4BySession_IdOrderByCreatedAtDescIdDesc(
                        sessionId
                );

        List<ChatMessage> chronologicalMessages =
                new ArrayList<>(messages);
        Collections.reverse(chronologicalMessages);
        return chronologicalMessages;
    }

    private String formatConversationHistory(List<ChatMessage> messages) {
        return messages.stream()
                .map(message -> message.getRole() + ": " + message.getContent())
                .collect(Collectors.joining("\n"));
    }

    private String serializeCitations(
            List<QuestionResponse.Citation> citations
    ) {
        return citations.stream()
                .map(citation -> "{\"documentId\":" + citation.documentId()
                        + ",\"fileName\":" + quoteJson(citation.fileName())
                        + ",\"pageNumber\":" + citation.pageNumber()
                        + ",\"snippet\":" + quoteJson(citation.snippet())
                        + "}")
                .collect(Collectors.joining(",", "[", "]"));
    }

    private String quoteJson(String value) {
        StringBuilder escaped = new StringBuilder("\"");

        for (char character : value.toCharArray()) {
            switch (character) {
                case '"' -> escaped.append("\\\"");
                case '\\' -> escaped.append("\\\\");
                case '\b' -> escaped.append("\\b");
                case '\f' -> escaped.append("\\f");
                case '\n' -> escaped.append("\\n");
                case '\r' -> escaped.append("\\r");
                case '\t' -> escaped.append("\\t");
                default -> {
                    if (character < 0x20) {
                        escaped.append(String.format("\\u%04x", (int) character));
                    } else {
                        escaped.append(character);
                    }
                }
            }
        }

        return escaped.append('"').toString();
    }
}