package com.docintel.backend.Controller;

import com.docintel.backend.Common.Response;
import com.docintel.backend.Dto.QuestionRequest;
import com.docintel.backend.Dto.QuestionResponse;
import com.docintel.backend.Entity.User;
import com.docintel.backend.Repository.UserRepository;
import com.docintel.backend.Service.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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

        User user = userRepository.findByEmail(
                        authentication.getName()
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Authenticated user not found."
                        ));

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
}