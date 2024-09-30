package org.example;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.async.DeferredResult;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.HashMap;
import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@RestController
@RequestMapping("/api/chatrooms")
public class ChatRoomController {
    @Autowired
    private ChatRoomService chatRoomService;

    @Autowired
    private ChatMessageService chatMessageService;

    private final Map<String, Queue<DeferredResult<ResponseEntity<ChatMessage>>>> messageQueues = new ConcurrentHashMap<>();

    @PostMapping("/create")
    public ChatRoom create(@RequestBody ChatRoom chatRoom) {
        try {
            return chatRoomService.createChatRoom(chatRoom.getName());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        }
    }

    @PostMapping("/join")
    public ResponseEntity<Map<String, Object>> join(@RequestParam String name, @RequestParam String userId) {
        Map<String, Object> response = new HashMap<>();
        try {
            ChatRoom chatRoom = chatRoomService.joinChatRoomByName(name, userId);
            if (chatRoom == null) {
                response.put("error", "Chat room not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            response.put("message", "Joined chat room successfully");
            response.put("roomId", chatRoom.getId());
            response.put("participants", chatRoom.getParticipants());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", "Internal server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/leave")
    public ChatRoom leave(@RequestParam String name, @RequestParam String userId) {
        return chatRoomService.leaveChatRoomByName(name, userId);
    }

    @GetMapping("/exists")
    public boolean exists(@RequestParam String name) {
        return chatRoomService.chatRoomExists(name);
    }

    @PostMapping("/send")
    public ResponseEntity<Void> sendMessage(@RequestParam String roomId, @RequestParam String userId, @RequestParam String username, @RequestParam String message) {
        ChatMessage chatMessage = new ChatMessage(userId, username, roomId, message);
        chatMessageService.saveMessage(roomId, userId, message);

        Queue<DeferredResult<ResponseEntity<ChatMessage>>> queue = messageQueues.getOrDefault(roomId, new ConcurrentLinkedQueue<>());
        DeferredResult<ResponseEntity<ChatMessage>> result;
        while ((result = queue.poll()) != null) {
            result.setResult(ResponseEntity.ok(chatMessage));
        }

        return ResponseEntity.ok().build();
    }

    @GetMapping("/receive")
    public DeferredResult<ResponseEntity<ChatMessage>> receiveMessage(@RequestParam String roomId) {
        DeferredResult<ResponseEntity<ChatMessage>> result = new DeferredResult<>(5000L);
        result.onTimeout(() -> result.setResult(ResponseEntity.noContent().build()));

        messageQueues.computeIfAbsent(roomId, k -> new ConcurrentLinkedQueue<>()).add(result);

        return result;
    }
}