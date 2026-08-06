package com.smartshelfx.repository;

import com.smartshelfx.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // Unread notifications for user
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.isRead = false ORDER BY n.createdAt DESC")
    List<Notification> findUnreadByUserId(@Param("userId") Long userId);
    
    // All notifications for user (latest first)
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId ORDER BY n.createdAt DESC")
    List<Notification> findByUserId(@Param("userId") Long userId);
    
    // Count unread notifications for user
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.id = :userId AND n.isRead = false")
    long countUnreadByUserId(@Param("userId") Long userId);
    
    // Mark all as read for user
    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP WHERE n.user.id = :userId AND n.isRead = false")
    void markAllAsReadByUserId(@Param("userId") Long userId);
    
    // Notifications by type
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.type = :type ORDER BY n.createdAt DESC")
    List<Notification> findByUserIdAndType(@Param("userId") Long userId, @Param("type") String type);
}