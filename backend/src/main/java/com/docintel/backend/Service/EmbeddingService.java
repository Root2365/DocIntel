package com.docintel.backend.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class EmbeddingService {

    private final RestTemplate restTemplate = new RestTemplate();

    public List<Float> generateEmbedding(String text) {

        try {

            Map<String, Object> request = new LinkedHashMap<>();

            request.put("model", "nomic-embed-text");
            request.put("prompt", text);

            @SuppressWarnings("unchecked")
            Map<String, Object> response =
                    restTemplate.postForObject(
                            "http://localhost:11434/api/embeddings",
                            request,
                            Map.class
                    );

            if (response == null) {
                throw new RuntimeException(
                        "Ollama returned an empty response while generating embeddings."
                );
            }

            if (!response.containsKey("embedding")) {
                throw new RuntimeException(
                        "Ollama response does not contain an embedding field."
                );
            }

            List<?> embedding =
                    (List<?>) response.get("embedding");

            if (embedding == null || embedding.isEmpty()) {
                throw new RuntimeException(
                        "Ollama returned an empty embedding vector."
                );
            }

            List<Float> result = new ArrayList<>();

            for (Object value : embedding) {

                result.add(
                        ((Number) value).floatValue()
                );
            }

            return result;

        } catch (Exception ex) {

            throw new RuntimeException(
                    "Failed to generate embedding using Ollama. Ensure Ollama is running on http://localhost:11434 and the model 'nomic-embed-text' is available.",
                    ex
            );
        }
    }
}