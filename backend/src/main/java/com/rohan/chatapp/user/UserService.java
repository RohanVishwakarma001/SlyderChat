package com.rohan.chatapp.user;

import com.rohan.chatapp.config.ResourceNotFoundException;
import com.rohan.chatapp.presence.PresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PresenceService presenceService;

    public User findOrCreateByPhone(String phone, String name) {
        return userRepository.findByPhone(phone).orElseGet(() -> {
            User user = new User();
            user.setPhone(phone);
            user.setName(StringUtils.hasText(name) ? name : phone);
            return userRepository.save(user);
        });
    }

    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserDto getDto(Long id) {
        User user = getById(id);
        return UserDto.from(user, presenceService.isOnline(id));
    }

    public UserDto updateProfile(Long id, UpdateProfileRequest request) {
        User user = getById(id);
        if (StringUtils.hasText(request.name())) {
            user.setName(request.name());
        }
        if (request.about() != null) {
            user.setAbout(request.about());
        }
        if (StringUtils.hasText(request.avatarUrl())) {
            user.setAvatarUrl(request.avatarUrl());
        }
        User saved = userRepository.save(user);
        return UserDto.from(saved, presenceService.isOnline(id));
    }

    public List<UserDto> syncContacts(List<String> phones) {
        if (phones == null || phones.isEmpty()) {
            return List.of();
        }
        return userRepository.findByPhoneIn(phones).stream()
                .map(u -> UserDto.from(u, presenceService.isOnline(u.getId())))
                .toList();
    }
}
