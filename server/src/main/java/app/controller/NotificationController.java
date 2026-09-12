package app.controller;

import app.model.Notification;
import app.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService) {

        this.notificationService = notificationService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>>
    getNotifications(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                notificationService
                        .getUserNotifications(userId)
        );
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<Notification>>
    getUnreadNotifications(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                notificationService
                        .getUnreadNotifications(userId)
        );
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification>
    markAsRead(@PathVariable Long id) {

        return ResponseEntity.ok(
                notificationService.markAsRead(id)
        );
    }
}