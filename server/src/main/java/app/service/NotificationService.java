package app.service;

import app.model.Notification;
import app.model.User;
import app.repository.NotificationRepository;
import app.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository) {

        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public Notification createNotification(
            Long userId,
            String message,
            String type) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Notification notification = new Notification();

        notification.setUser(user);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRead(false);

        return notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(
            Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return notificationRepository
                .findByUserOrderByCreatedAtDesc(user);
    }

    public List<Notification> getUnreadNotifications(
            Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return notificationRepository
                .findByUserAndReadFalseOrderByCreatedAtDesc(user);
    }

    public Notification markAsRead(Long id) {

        Notification notification =
                notificationRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Notification not found"));

        notification.setRead(true);

        return notificationRepository.save(notification);
    }
}