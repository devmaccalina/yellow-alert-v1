package com.rif.backend.Esignature;

import com.rif.backend.Auth.User;
import com.rif.backend.Auth.UserRepository;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ESignatureService {
    private final ESignatureRepository repository;
    private final UserRepository userRepository;

    @Autowired
    public ESignatureService(ESignatureRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ESignature saveOrUpdateESignature(ESignature eSignature, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        eSignature.setUser(user);

        return repository.findByUserEmail(email)
                .map(existingESignature -> {
                    existingESignature.setProfessionalTitle(eSignature.getProfessionalTitle());
                    existingESignature.setPostNominalTitle(eSignature.getPostNominalTitle());
                    if (eSignature.getESignaturePhoto() != null) {
                        existingESignature.setESignaturePhoto(eSignature.getESignaturePhoto());
                    }
                    return repository.save(existingESignature);
                })
                .orElseGet(() -> repository.save(eSignature));
    }

    @Transactional(readOnly = true)
    public ESignature getESignatureByEmail(String email) {
        return repository.findByUserEmail(email).orElse(null);
    }

    @Transactional(readOnly = true)
    public ESignature findById(Long id) {
        return repository.findById(id).orElse(null);
    }

    @Transactional(readOnly = true)
    public Optional<ESignature> getESignatureByUserId(Long userId) {
        return repository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public boolean isEsignatureComplete(String email) {
        Optional<ESignature> eSignature = repository.findByUserEmail(email);
        return eSignature.isPresent() && eSignature.get().getESignaturePhoto() != null;
    }
}
