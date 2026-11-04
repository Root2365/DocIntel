package com.docintel.backend.Service;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.docintel.backend.Common.Exception.BadRequestException;
import com.docintel.backend.Common.Exception.ResourceNotFoundException;
import com.docintel.backend.Entity.PdfDocument;
import com.docintel.backend.Entity.Role;
import com.docintel.backend.Entity.User;
import com.docintel.backend.Repository.PdfRepository;
import com.docintel.backend.Repository.UserRepository;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PdfService {

    private static final Path UPLOAD_DIRECTORY =
            Path.of("uploads").toAbsolutePath().normalize();
    private static final byte[] PDF_HEADER = {'%', 'P', 'D', 'F', '-'};

    private final PdfRepository pdfRepository;
    private final UserRepository userRepository;

    @PostConstruct
    public void initializeUploadDirectory() {
        try {
            Files.createDirectories(UPLOAD_DIRECTORY);
        } catch (IOException ex) {
            throw new UncheckedIOException(
                    "Could not create the uploads directory", ex);
        }
    }

    @Transactional
    public PdfDocument upload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("The uploaded file is empty.");
        }

        if (!isPdf(file)) {
            throw new BadRequestException("The uploaded file is not a PDF.");
        }

        User owner = getAuthenticatedUser();
        String storedFileName = UUID.randomUUID() + ".pdf";
        Path destination = UPLOAD_DIRECTORY.resolve(storedFileName);

        try (InputStream input = file.getInputStream()) {
            Files.copy(input, destination);
        } catch (IOException ex) {
            try {
                Files.deleteIfExists(destination);
            } catch (IOException cleanupException) {
                ex.addSuppressed(cleanupException);
            }
            throw new UncheckedIOException("Could not save the uploaded PDF", ex);
        }

        PdfDocument document = PdfDocument.builder()
                .fileName(file.getOriginalFilename() == null
                        ? storedFileName
                        : file.getOriginalFilename())
                .storagePath(destination.toString())
                .contentType("application/pdf")
                .fileSize(file.getSize())
                .status("UPLOADED")
                .owner(owner)
                .build();

        try {
            return pdfRepository.save(document);
        } catch (RuntimeException ex) {
            try {
                Files.deleteIfExists(destination);
            } catch (IOException cleanupException) {
                ex.addSuppressed(cleanupException);
            }
            throw ex;
        }
    }

    @Transactional(readOnly = true)
    public List<PdfDocument> getUserDocuments() {
        User user = getAuthenticatedUser();
        return pdfRepository.findByOwner_IdOrderByUploadedAtDesc(user.getId());
    }

    @Transactional(readOnly = true)
    public List<PdfDocument> getAllDocumentsForAdmin() {
        requireAdmin(getAuthenticatedUser());
        return pdfRepository.findAll(
                Sort.by(Sort.Direction.DESC, "uploadedAt"));
    }

    @Transactional(readOnly = true)
    public PdfDocument getDocumentMetadata(Long documentId) {
        return getAccessibleDocument(documentId);
    }

    @Transactional(readOnly = true)
    public Resource loadFileAsResource(Long documentId) {
        PdfDocument document = getAccessibleDocument(documentId);
        return new FileSystemResource(getStoredFilePath(document));
    }

    @Transactional
    public void delete(Long documentId) {
        PdfDocument document = getAccessibleDocument(documentId);
        Path filePath = getStoredFilePath(document);

        try {
            Files.delete(filePath);
        } catch (IOException ex) {
            throw new UncheckedIOException("Could not delete the PDF file", ex);
        }

        pdfRepository.delete(document);
    }

    private PdfDocument getAccessibleDocument(Long documentId) {
        PdfDocument document = pdfRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "PDF document not found."));
        User requester = getAuthenticatedUser();

        if (requester.getRole() != Role.ADMIN
                && !document.getOwner().getId().equals(requester.getId())) {
            throw new AccessDeniedException(
                    "You do not have permission to access this PDF document.");
        }

        Path filePath = getStoredFilePath(document);
        if (!Files.isRegularFile(filePath)) {
            throw new ResourceNotFoundException(
                    "PDF file not found on disk.");
        }

        return document;
    }

    private Path getStoredFilePath(PdfDocument document) {
        Path filePath = Path.of(document.getStoragePath())
                .toAbsolutePath()
                .normalize();
        if (!filePath.startsWith(UPLOAD_DIRECTORY)) {
            throw new ResourceNotFoundException("PDF file not found.");
        }
        return filePath;
    }

    private User getAuthenticatedUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof String email)) {
            throw new AccessDeniedException("Authentication is required.");
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException(
                        "The authenticated user could not be found."));
    }

    private void requireAdmin(User user) {
        if (user.getRole() != Role.ADMIN) {
            throw new AccessDeniedException(
                    "Only administrators can access all PDF documents.");
        }
    }

    private boolean isPdf(MultipartFile file) {
        try (InputStream input = file.getInputStream()) {
            byte[] header = input.readNBytes(PDF_HEADER.length);
            return java.util.Arrays.equals(header, PDF_HEADER);
        } catch (IOException ex) {
            throw new UncheckedIOException(
                    "Could not read the uploaded file", ex);
        }
    }
}
