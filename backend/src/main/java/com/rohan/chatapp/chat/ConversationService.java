package com.rohan.chatapp.chat;

import com.rohan.chatapp.config.BadRequestException;
import com.rohan.chatapp.config.ResourceNotFoundException;
import com.rohan.chatapp.user.User;
import com.rohan.chatapp.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final ConversationMemberRepository memberRepository;
    private final MessageRepository messageRepository;
    private final MessageStatusRepository messageStatusRepository;
    private final UserRepository userRepository;

    public List<ConversationSummaryDto> listForUser(Long userId) {
        List<ConversationMember> memberships = memberRepository.findByUserId(userId);
        List<ConversationSummaryDto> result = new ArrayList<>();
        for (ConversationMember membership : memberships) {
            conversationRepository.findById(membership.getConversationId())
                    .ifPresent(conv -> result.add(toSummary(conv, userId)));
        }
        result.sort((a, b) -> Long.compare(b.updatedAt(), a.updatedAt()));
        return result;
    }

    ConversationSummaryDto toSummary(Conversation conv, Long userId) {
        List<ConversationMember> members = memberRepository.findByConversationId(conv.getId());
        List<Long> memberIds = members.stream().map(ConversationMember::getUserId).toList();

        String name = conv.getName();
        String avatarUrl = conv.getAvatarUrl();
        if (conv.getType() == ConversationType.DIRECT) {
            Long otherId = memberIds.stream().filter(id -> !id.equals(userId)).findFirst().orElse(null);
            if (otherId != null) {
                User other = userRepository.findById(otherId).orElse(null);
                if (other != null) {
                    name = other.getName();
                    avatarUrl = other.getAvatarUrl();
                }
            }
        }

        Message last = messageRepository.findTopByConversationIdOrderByIdDesc(conv.getId());
        MessageDto lastDto = null;
        if (last != null) {
            String status = last.getSenderId().equals(userId)
                    ? ReceiptStatusCalculator.aggregate(messageStatusRepository.findByMessageId(last.getId()))
                    : null;
            lastDto = MessageDto.from(last, status);
        }

        long unread = messageStatusRepository.countByConversationIdAndUserIdAndStatusNot(
                conv.getId(), userId, DeliveryStatus.READ);

        return new ConversationSummaryDto(
                conv.getId(), conv.getType().name(), name, avatarUrl, memberIds,
                lastDto, unread, conv.getLastActivityAt().toEpochMilli()
        );
    }

    @Transactional
    public ConversationSummaryDto getOrCreateDirect(Long userId, Long otherUserId) {
        if (userId.equals(otherUserId)) {
            throw new BadRequestException("Cannot create a conversation with yourself");
        }
        userRepository.findById(otherUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String key = Conversation.directKey(userId, otherUserId);
        Conversation conv = conversationRepository.findByDirectKey(key).orElseGet(() -> {
            Conversation c = new Conversation();
            c.setType(ConversationType.DIRECT);
            c.setDirectKey(key);
            c.setCreatedBy(userId);
            Conversation saved = conversationRepository.save(c);
            memberRepository.save(new ConversationMember(saved.getId(), userId, MemberRole.MEMBER));
            memberRepository.save(new ConversationMember(saved.getId(), otherUserId, MemberRole.MEMBER));
            return saved;
        });
        return toSummary(conv, userId);
    }

    @Transactional
    public ConversationSummaryDto createGroup(Long creatorId, String name, List<Long> memberIds) {
        Conversation c = new Conversation();
        c.setType(ConversationType.GROUP);
        c.setName(name);
        c.setCreatedBy(creatorId);
        Conversation saved = conversationRepository.save(c);
        memberRepository.save(new ConversationMember(saved.getId(), creatorId, MemberRole.ADMIN));
        for (Long id : memberIds) {
            if (!id.equals(creatorId)) {
                memberRepository.save(new ConversationMember(saved.getId(), id, MemberRole.MEMBER));
            }
        }
        return toSummary(saved, creatorId);
    }

    @Transactional
    public void addMembers(Long conversationId, Long requesterId, List<Long> memberIds) {
        ConversationMember requesterMembership = memberRepository
                .findByConversationIdAndUserId(conversationId, requesterId)
                .orElseThrow(() -> new SecurityException("Not a member of this conversation"));
        if (requesterMembership.getRole() != MemberRole.ADMIN) {
            throw new SecurityException("Only admins can add members");
        }
        for (Long id : memberIds) {
            if (!memberRepository.existsByConversationIdAndUserId(conversationId, id)) {
                memberRepository.save(new ConversationMember(conversationId, id, MemberRole.MEMBER));
            }
        }
    }

    @Transactional
    public void leave(Long conversationId, Long userId) {
        assertMember(conversationId, userId);
        memberRepository.deleteByConversationIdAndUserId(conversationId, userId);
    }

    public void assertMember(Long conversationId, Long userId) {
        if (!memberRepository.existsByConversationIdAndUserId(conversationId, userId)) {
            throw new SecurityException("Not a member of this conversation");
        }
    }

    @Transactional
    public void touchActivity(Long conversationId) {
        conversationRepository.findById(conversationId).ifPresent(c -> {
            c.setLastActivityAt(Instant.now());
            conversationRepository.save(c);
        });
    }
}
