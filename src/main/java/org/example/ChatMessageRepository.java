package org.example;

import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    List<ChatMessage> findByRoomId(String roomId);

    @Query(value = "{ 'roomId': ?0 }", sort = "{ 'timestamp': -1 }")
    List<ChatMessage> findByRoomIdOrderByTimestampDesc(String roomId, Pageable pageable);
}