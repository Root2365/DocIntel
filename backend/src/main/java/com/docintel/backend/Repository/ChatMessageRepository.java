package com.docintel.backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docintel.backend.Entity.ChatMessage;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findBySession_IdOrderByCreatedAtAsc(Long sessionId);

    List<ChatMessage> findTop4BySession_IdOrderByCreatedAtDescIdDesc(
            Long sessionId
    );

    void deleteBySession_Id(Long sessionId);
}