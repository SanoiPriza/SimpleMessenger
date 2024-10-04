package org.example;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.async.DeferredResult;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.ConcurrentMap;

@RestController
@RequestMapping("/api/chatrooms")
public class ChatRoomController {

    @Autowired
    private ChatRoomService chatRoomService;

    @Autowired
    private ChatMessageService chatMessageService;

    private final ConcurrentMap<String, ConcurrentLinkedQueue<DeferredResult<ResponseEntity<ChatMessage>>>> messageQueues = new ConcurrentHashMap<>();

    @PostMapping("/create")
    public ChatRoom create(@RequestBody ChatRoom chatRoom) {
        try {
            return chatRoomService.createChatRoom(chatRoom.getName());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        }
    }

    @PostMapping("/join")
    public ResponseEntity<Map<String, Object>> join(@RequestParam("name") String name, @RequestParam("userId") String userId) {
        Map<String, Object> response = new HashMap<>();
        try {
            ChatRoom chatRoom = chatRoomService.joinChatRoomByName(name, userId);
            if (chatRoom == null) {
                response.put("error", "Chat room not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            if (chatRoom.getParticipants().contains(userId)) {
                response.put("message", "User is already a participant in the chat room");
            } else {
                response.put("message", "Joined chat room successfully");
            }
            response.put("roomId", chatRoom.getId());
            response.put("participants", chatRoom.getParticipants());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", "Internal server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/joined")
    public ResponseEntity<List<ChatRoom>> getJoinedRooms(@RequestParam("userId") String userId) {
        try {
            List<ChatRoom> joinedRooms = chatRoomService.getJoinedRooms(userId);
            return ResponseEntity.ok(joinedRooms);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/leave")
    public ChatRoom leave(@RequestParam("name") String name, @RequestParam("userId") String userId) {
        return chatRoomService.leaveChatRoomByName(name, userId);
    }

    @GetMapping("/exists")
    public boolean exists(@RequestParam("name") String name) {
        return chatRoomService.chatRoomExists(name);
    }

    @PostMapping("/send")
    public ResponseEntity<Void> sendMessage(@RequestParam("roomId") String roomId, @RequestParam("userId") String userId, @RequestParam("username") String username, @RequestParam("message") String message, @RequestParam("timestamp") String timestamp) {
        ChatMessage chatMessage = chatMessageService.saveMessage(roomId, userId, username, message, timestamp);

        chatMessageService.saveMessage(chatMessage);

        ConcurrentLinkedQueue<DeferredResult<ResponseEntity<ChatMessage>>> queue = messageQueues.getOrDefault(roomId, new ConcurrentLinkedQueue<>());
        DeferredResult<ResponseEntity<ChatMessage>> result;
        while ((result = queue.poll()) != null) {
            result.setResult(ResponseEntity.ok(chatMessage));
        }

        return ResponseEntity.ok().build();
    }

    @GetMapping("/receive")
    public DeferredResult<ResponseEntity<ChatMessage>> receiveMessage(@RequestParam("roomId") String roomId) {
        DeferredResult<ResponseEntity<ChatMessage>> result = new DeferredResult<>(5000L);
        result.onTimeout(() -> result.setResult(ResponseEntity.noContent().build()));

        messageQueues.computeIfAbsent(roomId, k -> new ConcurrentLinkedQueue<>()).add(result);

        return result;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsersInRoom(@RequestParam("roomName") String roomName) {
        try {
            List<User> users = chatRoomService.getUsersInRoom(roomName);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/last10messages")
    public ResponseEntity<List<ChatMessage>> getLast10Messages(@RequestParam("roomName") String roomName) {
        try {
            List<ChatMessage> messages = chatMessageService.getLatest10Messages(roomName);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
}