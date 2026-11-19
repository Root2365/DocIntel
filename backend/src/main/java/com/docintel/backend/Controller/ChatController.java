package com.docintel.backend.Controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.docintel.backend.Common.Response;
import com.docintel.backend.Dto.QuestionRequest;
import com.docintel.backend.Dto.QuestionResponse;
import com.docintel.backend.Entity.ChatMessage;
import com.docintel.backend.Entity.ChatSession;
import com.docintel.backend.Entity.User;
import com.docintel.backend.Repository.UserRepository;
import com.docintel.backend.Service.QuestionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final QuestionService questionService;
    private final UserRepository userRepository;

    @PostMapping("/ask")
    public ResponseEntity<Response<QuestionResponse>> askQuestion(
            @Valid @RequestBody QuestionRequest request,
            Authentication authentication
    ) {

        User user = getCurrentUser(authentication);

        QuestionResponse response =
                questionService.askQuestion(
                        request,
                        user
                );

        return ResponseEntity.ok(
                Response.success(
                        "Answer generated successfully",
                        response
                )
        );
    }

    @PostMapping("/sessions")
    public ResponseEntity<Response<ChatSessionView>> createSession(
            @RequestBody(required = false)
            Map<String, String> payload,
            Authentication authentication
    ) {

        User user = getCurrentUser(authentication);

        String title = "New Chat";

        if (payload != null
                && payload.containsKey("title")
                && payload.get("title") != null
                && !payload.get("title").isBlank()) {

            title = payload.get("title");
        }

        ChatSession session =
                questionService.createSession(
                        user,
                        title
                );

        return ResponseEntity.ok(
                Response.success(
                        "Chat session created successfully",
                        toChatSessionView(session)
                )
        );
    }

    @GetMapping("/sessions")
    public ResponseEntity<Response<List<ChatSessionView>>> getSessions(
            Authentication authentication
    ) {

        User user = getCurrentUser(authentication);

        List<ChatSessionView> sessions =
                questionService.getUserSessions(user).stream()
                        .map(this::toChatSessionView)
                        .toList();

        return ResponseEntity.ok(
                Response.success(
                        "Chat sessions retrieved successfully",
                        sessions
                )
        );
    }

    @GetMapping("/sessions/{id}/messages")
    public ResponseEntity<Response<List<ChatMessageView>>> getSessionMessages(
            @PathVariable Long id,
            Authentication authentication
    ) {

        User user = getCurrentUser(authentication);

        List<ChatMessageView> messages =
                questionService.getSessionMessages(
                        id,
                        user
                ).stream()
                .map(this::toChatMessageView)
                .toList();

        return ResponseEntity.ok(
                Response.success(
                        "Chat messages retrieved successfully",
                        messages
                )
        );
    }

    @PutMapping("/sessions/{id}")
    public ResponseEntity<Response<ChatSessionView>> renameSession(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> payload,
            Authentication authentication
    ) {
        User user = getCurrentUser(authentication);
        String title = "Untitled Chat";
        if (payload != null && payload.containsKey("title") && payload.get("title") != null && !payload.get("title").isBlank()) {
            title = payload.get("title").trim();
        }
        ChatSession session = questionService.renameSession(id, title, user);
        return ResponseEntity.ok(
                Response.success(
                        "Chat session renamed successfully",
                        toChatSessionView(session)
                )
        );
    }

    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<Response<Void>> deleteSession(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User user = getCurrentUser(authentication);
        questionService.deleteSession(id, user);
        return ResponseEntity.ok(
                Response.success("Chat session deleted successfully")
        );
    }

    private ChatSessionView toChatSessionView(ChatSession session) {
        return new ChatSessionView(
                session.getId(),
                session.getTitle(),
                session.getCreatedAt()
        );
    }

    private ChatMessageView toChatMessageView(ChatMessage message) {
        return new ChatMessageView(
                message.getId(),
                message.getRole(),
                message.getContent(),
                message.getCitations(),
                message.getCreatedAt()
        );
    }

    private User getCurrentUser(
            Authentication authentication
    ) {

        return userRepository.findByEmail(
                        authentication.getName()
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Authenticated user not found."
                        ));
    }

    private record ChatSessionView(
            Long id,
            String title,
            LocalDateTime createdAt
    ) {
    }

    private record ChatMessageView(
            Long id,
            String role,
            String content,
            String citations,
            LocalDateTime createdAt
    ) {
    }
}