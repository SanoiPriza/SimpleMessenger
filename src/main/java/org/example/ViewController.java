package org.example;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

    @GetMapping("/register")
    public String register() {
        return "register";
    }

    @GetMapping("/chatroom")
    public String chatRoom() {
        return "chatroom";
    }

    @GetMapping("/chat")
    public String chat() {
        return "chat";
    }
}