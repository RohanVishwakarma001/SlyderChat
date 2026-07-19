package com.rohan.chatapp.user;

public record UserDto(
        Long id,
        String phone,
        String name,
        String about,
        String avatarUrl,
        Long lastSeen,
        boolean online
) {
    public static UserDto from(User user, boolean online) {
        return new UserDto(
                user.getId(),
                user.getPhone(),
                user.getName(),
                user.getAbout(),
                user.getAvatarUrl(),
                user.getLastSeen() == null ? null : user.getLastSeen().toEpochMilli(),
                online
        );
    }
}
