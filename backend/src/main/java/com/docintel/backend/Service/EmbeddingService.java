package com.docintel.backend.Service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class EmbeddingService {

    private static final int FALLBACK_DIMENSIONS = 384;

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

            if (response != null &&
                    response.containsKey("embedding")) {

                List<?> embedding =
                        (List<?>) response.get("embedding");

                List<Float> result = new ArrayList<>();

                for (Object value : embedding) {
                    result.add(
                            ((Number) value).floatValue()
                    );
                }

                return result;
            }

        } catch (Exception ex) {

            System.out.println(
                    "Ollama unavailable. Using fallback embedding."
            );
        }

        return generateFallbackEmbedding(text);
    }

    private List<Float> generateFallbackEmbedding(String text) {

        long seed = text.hashCode();

        Random random = new Random(seed);

        List<Float> embedding =
                new ArrayList<>(FALLBACK_DIMENSIONS);

        double magnitude = 0.0;

        for (int i = 0; i < FALLBACK_DIMENSIONS; i++) {

            float value =
                    (random.nextFloat() * 2.0f) - 1.0f;

            embedding.add(value);

            magnitude += value * value;
        }

        magnitude = Math.sqrt(magnitude);

        if (magnitude > 0) {

            for (int i = 0; i < embedding.size(); i++) {

                embedding.set(
                        i,
                        (float) (embedding.get(i) / magnitude)
                );
            }
        }

        return embedding;
    }
}