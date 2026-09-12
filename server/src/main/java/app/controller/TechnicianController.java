package app.controller;

import app.model.Complaint;
import app.model.Technician;
import app.service.TechnicianService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/technicians")
@CrossOrigin(origins = "http://localhost:5173")
public class TechnicianController {

    private final TechnicianService technicianService;

    public TechnicianController(
            TechnicianService technicianService) {

        this.technicianService = technicianService;
    }

    @GetMapping
    public ResponseEntity<List<Technician>>
    getAllTechnicians() {

        return ResponseEntity.ok(
                technicianService.getAllTechnicians()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Technician> getTechnician(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                technicianService.getTechnician(id)
        );
    }

    @GetMapping("/{id}/complaints")
    public ResponseEntity<List<Complaint>>
    getAssignedComplaints(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                technicianService
                        .getAssignedComplaints(id)
        );
    }

    @PutMapping("/{technicianId}/complaints/{complaintId}/status")
    public ResponseEntity<Complaint> updateComplaintStatus(
            @PathVariable Long technicianId,
            @PathVariable Long complaintId,
            @RequestParam String status) {

        return ResponseEntity.ok(
                technicianService.updateComplaintStatus(
                        technicianId,
                        complaintId,
                        status
                )
        );
    }
}