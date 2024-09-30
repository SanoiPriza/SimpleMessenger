package org.example;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@Service
public class ChatMessageService {
    @Autowired
    private ChatMessageRepository chatMessageRepository;

    public ChatMessage saveMessage(String roomId, String senderId, String username, String message) {
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setRoomId(roomId);
        chatMessage.setUserId(senderId);
        chatMessage.setUsername(username);
        chatMessage.setMessage(message);
        chatMessage.setTimestamp(System.currentTimeMillis());
        return chatMessageRepository.save(chatMessage);
    }

    public List<ChatMessage> getMessages(String roomId) {
        return chatMessageRepository.findByRoomId(roomId);
    }

    public List<ChatMessage> getLast10Messages(String roomId) {
        return chatMessageRepository.findByRoomId(
                roomId,
                PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "timestamp"))
        ).getContent();
    }
}