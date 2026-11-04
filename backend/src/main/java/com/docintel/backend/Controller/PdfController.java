package com.docintel.backend.Controller;

import java.nio.charset.StandardCharsets;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.docintel.backend.Common.Response;
import com.docintel.backend.Dto.PdfResponse;
import com.docintel.backend.Entity.PdfDocument;
import com.docintel.backend.Service.PdfService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pdf")
@RequiredArgsConstructor
public class PdfController {

    private final PdfService pdfService;

    @PostMapping("/upload")
    public ResponseEntity<Response<PdfResponse>> upload(
            @RequestParam("file") MultipartFile file) {
        PdfDocument document = pdfService.upload(file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Response.success(
                        "PDF uploaded successfully",
                        PdfResponse.from(document)));
    }

    @GetMapping
    public ResponseEntity<Response<List<PdfResponse>>> getUserDocuments() {
        List<PdfResponse> documents = pdfService.getUserDocuments().stream()
                .map(PdfResponse::from)
                .toList();
        return ResponseEntity.ok(
                Response.success("PDF documents retrieved successfully", documents));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Response<List<PdfResponse>>> getAllDocumentsForAdmin() {
        List<PdfResponse> documents = pdfService.getAllDocumentsForAdmin().stream()
                .map(PdfResponse::from)
                .toList();
        return ResponseEntity.ok(
                Response.success("PDF documents retrieved successfully", documents));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Response<PdfResponse>> getDocumentMetadata(
            @PathVariable Long id) {
        return ResponseEntity.ok(Response.success(
                "PDF metadata retrieved successfully",
                PdfResponse.from(pdfService.getDocumentMetadata(id))));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        PdfDocument document = pdfService.getDocumentMetadata(id);
        Resource resource = pdfService.loadFileAsResource(id);
        ContentDisposition contentDisposition = ContentDisposition.inline()
                .filename(document.getFileName(), StandardCharsets.UTF_8)
                .build();

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        contentDisposition.toString())
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Response<Void>> delete(@PathVariable Long id) {
        pdfService.delete(id);
        return ResponseEntity.ok(
                Response.success("PDF deleted successfully"));
    }
}
