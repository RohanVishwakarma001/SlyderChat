package com.rohan.chatapp.media;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.rohan.chatapp.config.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MediaService {

    private final Cloudinary cloudinary;

    @Value("${app.cloudinary.folder}")
    private String folder;

    @SuppressWarnings("unchecked")
    public MediaUploadResponse upload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No file provided");
        }
        try {
            Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "auto"
            ));
            String url = (String) result.get("secure_url");
            String publicId = (String) result.get("public_id");
            String resourceType = (String) result.get("resource_type");
            Number bytes = (Number) result.get("bytes");
            return new MediaUploadResponse(url, publicId, resourceType, bytes == null ? 0L : bytes.longValue());
        } catch (IOException e) {
            throw new BadRequestException("Failed to upload media: " + e.getMessage());
        }
    }
}
