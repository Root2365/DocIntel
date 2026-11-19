package com.docintel.backend.Service;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;

class LlmServiceTest {

    @Test
    void reportsMissingGeminiApiKeyInsteadOfFallingBackToOllama() {
        LlmService llmService = new LlmService();
        ReflectionTestUtils.setField(llmService, "provider", "GEMINI");
        ReflectionTestUtils.setField(llmService, "geminiApiKey", "");

        String answer = llmService.generateAnswer("document context", "question");

        assertEquals(
                "The AI service is not configured. Set GEMINI_API_KEY on the backend and try again.",
                answer
        );
    }
}
