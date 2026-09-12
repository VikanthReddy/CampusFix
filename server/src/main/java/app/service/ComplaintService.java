package app.service;

import app.dto.ComplaintRequest;
import app.model.Complaint;
import app.model.User;
import app.repository.ComplaintRepository;
import app.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final AIComplaintService aiComplaintService;

    public ComplaintService(
            ComplaintRepository complaintRepository,
            UserRepository userRepository,
            AIComplaintService aiComplaintService) {

        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.aiComplaintService = aiComplaintService;
    }

    public Complaint createComplaint(
            ComplaintRequest request,
            Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Complaint complaint = new Complaint();

        complaint.setTitle(request.getTitle());
        complaint.setDescription(request.getDescription());
        complaint.setLocation(request.getLocation());
        complaint.setUser(user);

        // AI-based category and priority
        String category =
                aiComplaintService.categorizeComplaint(
                        request.getTitle(),
                        request.getDescription());

        String priority =
                aiComplaintService.determinePriority(
                        request.getTitle(),
                        request.getDescription());

        complaint.setCategory(category);
        complaint.setPriority(priority);

        return complaintRepository.save(complaint);
    }

    public List<Complaint> getUserComplaints(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return complaintRepository.findByUser(user);
    }

    public Complaint getComplaint(Long id) {

        return complaintRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Complaint not found"));
    }

    public Complaint updateComplaintStatus(
            Long id,
            String status) {

        Complaint complaint = getComplaint(id);

        complaint.setStatus(status);

        return complaintRepository.save(complaint);
    }

    public void deleteComplaint(Long id) {

        if (!complaintRepository.existsById(id)) {
            throw new RuntimeException("Complaint not found");
        }

        complaintRepository.deleteById(id);
    }
}