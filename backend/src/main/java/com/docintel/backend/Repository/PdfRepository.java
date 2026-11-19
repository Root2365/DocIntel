package com.docintel.backend.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

import com.docintel.backend.Entity.PdfDocument;

public interface PdfRepository extends JpaRepository<PdfDocument, Long> {

    List<PdfDocument> findByOwner_IdOrderByUploadedAtDesc(Long ownerId);

    @EntityGraph(attributePaths = "owner")
    List<PdfDocument> findAllByOrderByUploadedAtDesc();

    Optional<PdfDocument> findByIdAndOwner_Id(Long id, Long ownerId);
}
