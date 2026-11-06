package com.docintel.backend.Service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Service
public class PdfExtractorService {

    private static final int CHUNK_SIZE = 500;
    private static final int OVERLAP = 50;

    public record RawChunk(
            int pageNumber,
            int chunkIndex,
            String content
    ) {
    }

    public List<RawChunk> extractAndChunk(Path pdfPath)
            throws IOException {

        List<RawChunk> chunks = new ArrayList<>();

        try (PDDocument document =
                     Loader.loadPDF(pdfPath.toFile())) {

            PDFTextStripper stripper = new PDFTextStripper();

            int globalChunkIndex = 0;

            for (int page = 1;
                 page <= document.getNumberOfPages();
                 page++) {

                stripper.setStartPage(page);
                stripper.setEndPage(page);

                String text =
                        stripper.getText(document);

                if (text == null || text.isBlank()) {
                    continue;
                }

                text = text.trim();

                int start = 0;

                while (start < text.length()) {

                    int end = Math.min(
                            start + CHUNK_SIZE,
                            text.length()
                    );

                    String chunk =
                            text.substring(start, end)
                                    .trim();

                    if (!chunk.isEmpty()) {

                        chunks.add(
                                new RawChunk(
                                        page,
                                        globalChunkIndex++,
                                        chunk
                                )
                        );
                    }

                    if (end >= text.length()) {
                        break;
                    }

                    start = end - OVERLAP;
                }
            }
        }

        return chunks;
    }
}
