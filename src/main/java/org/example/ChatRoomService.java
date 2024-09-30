package org.example;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ChatRoomService {
    private static final Logger logger = LoggerFactory.getLogger(ChatRoomService.class);

    @Autowired
    protected ChatRoomRepository chatRoomRepository;

    @Autowired
    private UserRepository userRepository;

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

    public List<ChatRoom> getJoinedRooms(String userId) {
        return chatRoomRepository.findByParticipantsContaining(userId);
    }

    public List<User> getUsersInRoom(String roomName) {
        ChatRoom chatRoom = findChatRoomByName(roomName);
        if (chatRoom != null) {
            return chatRoom.getParticipants().stream()
                    .map(userId -> userRepository.findById(userId).orElse(null))
                    .collect(Collectors.toList());
        } else {
            throw new IllegalArgumentException("Chat room not found");
        }
    }

    private ChatRoom findChatRoomByName(String roomName) {
        return chatRoomRepository.findByName(roomName);
    }
}