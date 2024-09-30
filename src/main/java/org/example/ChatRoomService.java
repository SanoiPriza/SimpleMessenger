package org.example;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ChatRoomService {
    private static final Logger logger = LoggerFactory.getLogger(ChatRoomService.class);

    @Autowired
    protected ChatRoomRepository chatRoomRepository;

    public synchronized ChatRoom createChatRoom(String name) {
        try {
            ChatRoom chatRoom = new ChatRoom();
            chatRoom.setName(name);
            chatRoom.setParticipants(new ArrayList<>());
            return chatRoomRepository.save(chatRoom);
        } catch (DuplicateKeyException e) {
            throw new IllegalArgumentException("Chat room with this name already exists");
        }
    }

    public synchronized ChatRoom joinChatRoomByName(String name, String userId) {
        logger.info("Attempting to join chat room with name: {}", name);
        ChatRoom chatRoom = chatRoomRepository.findByName(name);
        if (chatRoom != null) {
            logger.info("Chat room found, adding user");
            chatRoom.getParticipants().add(userId);
            return chatRoomRepository.save(chatRoom);
        }
        logger.warn("Chat room with name: {} not found", name);
        return null;
    }

    public synchronized ChatRoom leaveChatRoomByName(String name, String userId) {
        ChatRoom chatRoom = chatRoomRepository.findByName(name);
        if (chatRoom != null) {
            chatRoom.getParticipants().remove(userId);
            return chatRoomRepository.save(chatRoom);
        }
        return null;
    }

    public boolean chatRoomExists(String name) {
        return chatRoomRepository.findByName(name) != null;
    }
}