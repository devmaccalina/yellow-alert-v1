package com.rif.backend.Approver;

import com.rif.backend.Auth.User;
import com.rif.backend.Auth.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ApproverService {
    private final ApproverRepository repository;
    private final UserRepository userRepository;

    @Autowired
    public ApproverService(ApproverRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Approver saveOrUpdateApprover(Approver approver, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        approver.setUser(user);

        return repository.findByUserEmail(email)
                .map(existingApprover -> {
                    existingApprover.setProfessionalTitle(approver.getProfessionalTitle());
                    existingApprover.setPostNominalTitle(approver.getPostNominalTitle());
                    existingApprover.setApproverUnit(approver.getApproverUnit());
                    if (approver.getApproverPhoto() != null) {
                        existingApprover.setApproverPhoto(approver.getApproverPhoto());
                    }
                    return repository.save(existingApprover);
                })
                .orElseGet(() -> repository.save(approver));
    }

    @Transactional(readOnly = true)
    public Approver getApproverByEmail(String email) {
        return repository.findByUserEmail(email).orElse(null);
    }

    @Transactional(readOnly = true)
    public Approver findById(Long id) {
        return repository.findById(id).orElse(null);
    }

    @Transactional(readOnly = true)
    public Approver getApproverByUserId(Long userId) {
        return repository.findByUserId(userId).orElse(null);
    }
}
