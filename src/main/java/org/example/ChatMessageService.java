package org.example;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
public class ChatMessageService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    public ChatMessage saveMessage(String roomId, String senderId, String username, String message, String timestamp) {
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setId(UUID.randomUUID().toString());
        chatMessage.setRoomId(roomId);
        chatMessage.setUserId(senderId);
        chatMessage.setUsername(username);
        chatMessage.setMessage(message);
        chatMessage.setTimestamp(timestamp);

        try {
            chatMessageRepository.save(chatMessage);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return chatMessage;
    }

    public List<ChatMessage> getMessages(String roomId) {
        return chatMessageRepository.findByRoomId(roomId);
    }

    public List<ChatMessage> getLatest10Messages(String roomId) {
        Pageable pageable = PageRequest.of(0, 10);
        List<ChatMessage> messages = chatMessageRepository.findByRoomIdOrderByTimestampDesc(roomId, pageable);
        Collections.reverse(messages);
        return messages;
    }

    public void saveMessage(ChatMessage chatMessage) {
        try {
            chatMessageRepository.save(chatMessage);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}