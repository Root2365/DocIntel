package com.docintel.backend.Dto;

import java.time.LocalDateTime;

import com.docintel.backend.Entity.PdfDocument;

public record PdfResponse(
        Long id,
        String fileName,
        String contentType,
        Long fileSize,
        String status,
        LocalDateTime uploadedAt,
        Long ownerId
) {

    public static PdfResponse from(PdfDocument document) {
        return new PdfResponse(
                document.getId(),
                document.getFileName(),
                document.getContentType(),
                document.getFileSize(),
                document.getStatus(),
                document.getUploadedAt(),
                document.getOwner().getId()
        );
    }
}
