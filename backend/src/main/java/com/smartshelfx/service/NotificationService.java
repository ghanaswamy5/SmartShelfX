package com.smartshelfx.service;

import com.smartshelfx.dto.response.AlertResponse;

import java.util.List;

public interface NotificationService {
    List<AlertResponse> getNotificationsByUser(Long userId);
    List<AlertResponse> getUnreadNotifications(Long userId);
    long getUnreadCount(Long userId);
    void markAllAsRead(Long userId);
    void markAsRead(Long notificationId);
    void createNotification(Long userId, String type, String title, String message, String link);
}