package com.docintel.backend.Dto;

import java.time.LocalDateTime;

import com.docintel.backend.Entity.PdfDocument;

public record AdminPdfResponse(
        Long id,
        String fileName,
        String contentType,
        Long fileSize,
        String status,
        LocalDateTime uploadedAt,
        Long ownerId,
        String ownerName,
        String ownerEmail
) {

    public static AdminPdfResponse from(PdfDocument document) {
        return new AdminPdfResponse(
                document.getId(),
                document.getFileName(),
                document.getContentType(),
                document.getFileSize(),
                document.getStatus(),
                document.getUploadedAt(),
                document.getOwner().getId(),
                document.getOwner().getName(),
                document.getOwner().getEmail()
        );
    }
}
