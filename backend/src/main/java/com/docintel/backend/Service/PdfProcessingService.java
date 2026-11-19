package com.docintel.backend.Service;

import com.docintel.backend.Entity.DocumentChunk;
import com.docintel.backend.Entity.PdfDocument;
import com.docintel.backend.Repository.DocumentChunkRepository;
import com.docintel.backend.Repository.PdfRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PdfProcessingService {

    private final PdfRepository pdfRepository;
    private final DocumentChunkRepository chunkRepository;
    private final PdfExtractorService pdfExtractorService;
    private final VectorStore vectorStore;

    @Async("taskExecutor")
    public void processPdfAsync(Long documentId) {

        PdfDocument document = pdfRepository.findById(documentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Document not found: " + documentId
                        ));

        try {

            document.setStatus("PROCESSING");
            pdfRepository.save(document);

            List<PdfExtractorService.RawChunk> rawChunks =
                    pdfExtractorService.extractAndChunk(
                            Path.of(document.getStoragePath())
                    );

            List<DocumentChunk> chunks = new ArrayList<>();

            for (PdfExtractorService.RawChunk rawChunk : rawChunks) {
                DocumentChunk chunk = DocumentChunk.builder()
                        .document(document)
                        .pageNumber(rawChunk.pageNumber())
                        .chunkIndex(rawChunk.chunkIndex())
                        .content(rawChunk.content())
                        .build();

                chunks.add(chunk);
            }

            List<DocumentChunk> savedChunks =
                    chunkRepository.saveAll(chunks);

            List<Document> vectorDocuments = savedChunks.stream()
                    .map(chunk -> Document.builder()
                            .id(VectorStoreDocumentId.fromChunkId(chunk.getId()))
                            .text(chunk.getContent())
                            .metadata(Map.of(
                                    "documentId", documentId,
                                    "fileName", document.getFileName(),
                                    "pageNumber", chunk.getPageNumber()
                            ))
                            .build())
                    .collect(Collectors.toList());

            if (!vectorDocuments.isEmpty()) {
                vectorStore.add(vectorDocuments);
            }

            document.setStatus("READY");
            pdfRepository.save(document);

            log.info(
                    "Successfully processed document {} with {} chunks",
                    documentId,
                    chunks.size()
            );

        } catch (Exception ex) {

            log.error(
                    "Failed processing document {}",
                    documentId,
                    ex
            );

            document.setStatus("FAILED");

            pdfRepository.save(document);
        }
    }
}
