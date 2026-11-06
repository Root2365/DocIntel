package com.docintel.backend.Repository;

import com.docintel.backend.Entity.DocumentChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentChunkRepository extends JpaRepository<DocumentChunk, Long> {

    List<DocumentChunk> findByDocument_IdOrderByChunkIndexAsc(Long documentId);

    void deleteByDocument_Id(Long documentId);

    List<DocumentChunk> findByDocument_IdIn(List<Long> documentIds);
}
