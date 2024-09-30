package org.example;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ChatRoomRepository extends MongoRepository<ChatRoom, String> {
    ChatRoom findByName(String name);
    List<ChatRoom> findByParticipantsContaining(String userId);
}