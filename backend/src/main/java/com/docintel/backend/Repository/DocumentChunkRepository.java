package com.docintel.backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docintel.backend.Entity.DocumentChunk;

@Repository
public interface DocumentChunkRepository extends JpaRepository<DocumentChunk, Long> {

    /**
     * Retrieve all chunks belonging to a document,
     * ordered by chunk index in ascending order.
     */
    List<DocumentChunk> findByDocument_IdOrderByChunkIndexAsc(Long documentId);

    /**
     * Delete all chunks associated with a document.
     */
    void deleteByDocument_Id(Long documentId);
}