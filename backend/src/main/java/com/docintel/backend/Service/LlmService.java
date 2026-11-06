package com.docintel.backend.Service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class LlmService {

    private static final String OLLAMA_URL =
            "http://localhost:11434/api/generate";

    private final RestTemplate restTemplate =
            new RestTemplate();

    public String generateAnswer(
            String context,
            String question
    ) {

        String prompt =
                """
                You are DocIntel AI assistant. Answer the user question based strictly on the provided context below. If the information is not present in the context, reply: I cannot find information regarding this in the uploaded documents. Do not hallucinate.

                Context:
                """
                + context
                + """

                Question:
                """
                + question;

        try {

            Map<String, Object> request =
                    new LinkedHashMap<>();

            request.put("model", "llama3.2");
            request.put("prompt", prompt);
            request.put("stream", false);

            @SuppressWarnings("unchecked")
            Map<String, Object> response =
                    restTemplate.postForObject(
                            OLLAMA_URL,
                            request,
                            Map.class
                    );

            if (response != null
                    && response.containsKey("response")) {

                return response.get("response")
                        .toString()
                        .trim();
            }

        } catch (Exception ex) {

            System.err.println(
                    "Ollama unavailable. Using fallback answer."
            );

            return buildFallbackAnswer(
                    context,
                    question
            );
        }

        return buildFallbackAnswer(
                context,
                question
        );
    }

    private String buildFallbackAnswer(
            String context,
            String question
    ) {

        if (context == null || context.isBlank()) {

            return """
                    Ollama is currently unavailable and no relevant document content was found.

                    Question:
                    """
                    + question
                    + """

                    Answer:
                    I cannot find information regarding this in the uploaded documents.
                    """;
        }

        String summary = context.length() > 500
                ? context.substring(0, 500) + "..."
                : context;

        return """
                Ollama is currently unavailable, so this is a fallback response based on the most relevant document passage:

                """
                + summary;
    }
}
