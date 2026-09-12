package app.controller;

import app.dto.ComplaintRequest;
import app.model.Complaint;
import app.service.ComplaintService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "http://localhost:5173")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(
            ComplaintService complaintService) {

        this.complaintService = complaintService;
    }

    @PostMapping
    public ResponseEntity<Complaint> createComplaint(
            @RequestParam Long userId,
            @RequestBody ComplaintRequest request) {

        return ResponseEntity.ok(
                complaintService.createComplaint(
                        request,
                        userId
                )
        );
    }

    @GetMapping("/my")
    public ResponseEntity<List<Complaint>> getMyComplaints(
            @RequestParam Long userId) {

        return ResponseEntity.ok(
                complaintService.getUserComplaints(userId)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Complaint> getComplaint(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                complaintService.getComplaint(id)
        );
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Complaint> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return ResponseEntity.ok(
                complaintService.updateComplaintStatus(
                        id,
                        status
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteComplaint(
            @PathVariable Long id) {

        complaintService.deleteComplaint(id);

        return ResponseEntity.ok(
                "Complaint deleted successfully"
        );
    }
}