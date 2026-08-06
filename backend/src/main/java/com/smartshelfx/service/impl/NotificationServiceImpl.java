package com.smartshelfx.service.impl;

import com.smartshelfx.dto.response.AlertResponse;
import com.smartshelfx.entity.Notification;
import com.smartshelfx.entity.User;
import com.smartshelfx.exception.ResourceNotFoundException;
import com.smartshelfx.repository.NotificationRepository;
import com.smartshelfx.repository.UserRepository;
import com.smartshelfx.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    public List<AlertResponse> getNotificationsByUser(Long userId) {
        return notificationRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AlertResponse> getUnreadNotifications(Long userId) {
        return notificationRepository.findUnreadByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public long getUnreadCount(Long userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    @Override
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    @Override
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));
        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    @Override
    public void createNotification(Long userId, String type, String title, String message, String link) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Check if similar notification already exists and is unread
        List<Notification> existing = notificationRepository.findUnreadByUserId(userId)
                .stream()
                .filter(n -> n.getType().equals(type) && n.getTitle().equals(title))
                .collect(Collectors.toList());

        if (!existing.isEmpty()) {
            // Update existing notification instead of creating duplicate
            Notification existingNotification = existing.get(0);
            existingNotification.setMessage(message);
            existingNotification.setCreatedAt(LocalDateTime.now());
            notificationRepository.save(existingNotification);
            return;
        }

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setLink(link);
        notification.setIsRead(false);

        notificationRepository.save(notification);
    }

    private AlertResponse mapToResponse(Notification notification) {
        return AlertResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .link(notification.getLink())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}