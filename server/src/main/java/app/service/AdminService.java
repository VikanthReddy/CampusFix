package app.service;

import app.model.Complaint;
import app.model.Technician;
import app.repository.ComplaintRepository;
import app.repository.TechnicianRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final ComplaintRepository complaintRepository;
    private final TechnicianRepository technicianRepository;

    public AdminService(
            ComplaintRepository complaintRepository,
            TechnicianRepository technicianRepository) {

        this.complaintRepository = complaintRepository;
        this.technicianRepository = technicianRepository;
    }

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    public Complaint updateStatus(
            Long complaintId,
            String status) {

        Complaint complaint =
                complaintRepository.findById(complaintId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Complaint not found"));

        complaint.setStatus(status);

        return complaintRepository.save(complaint);
    }

    public Complaint assignTechnician(
            Long complaintId,
            Long technicianId) {

        Complaint complaint =
                complaintRepository.findById(complaintId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Complaint not found"));

        Technician technician =
                technicianRepository.findById(technicianId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Technician not found"));

        complaint.setTechnician(technician);
        complaint.setStatus("IN_PROGRESS");

        return complaintRepository.save(complaint);
    }
}