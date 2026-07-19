package com.rohan.chatapp.chat;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;
    private final MessageService messageService;

    @GetMapping
    public List<ConversationSummaryDto> list(@AuthenticationPrincipal Long userId) {
        return conversationService.listForUser(userId);
    }

    @PostMapping("/direct")
    public ConversationSummaryDto createDirect(@AuthenticationPrincipal Long userId,
                                                @Valid @RequestBody CreateDirectRequest request) {
        return conversationService.getOrCreateDirect(userId, request.userId());
    }

    @PostMapping("/group")
    public ConversationSummaryDto createGroup(@AuthenticationPrincipal Long userId,
                                               @Valid @RequestBody CreateGroupRequest request) {
        return conversationService.createGroup(userId, request.name(), request.memberIds());
    }

    @PostMapping("/{id}/members")
    public void addMembers(@AuthenticationPrincipal Long userId,
                            @PathVariable("id") Long conversationId,
                            @Valid @RequestBody AddMembersRequest request) {
        conversationService.addMembers(conversationId, userId, request.memberIds());
    }

    @DeleteMapping("/{id}/members/me")
    public void leave(@AuthenticationPrincipal Long userId, @PathVariable("id") Long conversationId) {
        conversationService.leave(conversationId, userId);
    }

    @GetMapping("/{id}/messages")
    public List<MessageDto> messages(@AuthenticationPrincipal Long userId,
                                      @PathVariable("id") Long conversationId,
                                      @org.springframework.web.bind.annotation.RequestParam(required = false) Long beforeId,
                                      @org.springframework.web.bind.annotation.RequestParam(required = false, defaultValue = "50") int limit) {
        return messageService.getMessages(userId, conversationId, beforeId, limit);
    }

    @PostMapping("/{id}/read")
    public void markRead(@AuthenticationPrincipal Long userId, @PathVariable("id") Long conversationId) {
        messageService.markConversationRead(conversationId, userId);
    }

    @DeleteMapping("/messages/{messageId}")
    public void deleteMessage(@AuthenticationPrincipal Long userId, @PathVariable Long messageId) {
        messageService.deleteForEveryone(messageId, userId);
    }
}
