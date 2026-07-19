package com.rohan.chatapp.media;

public record MediaUploadResponse(String url, String publicId, String resourceType, long bytes) {
}
