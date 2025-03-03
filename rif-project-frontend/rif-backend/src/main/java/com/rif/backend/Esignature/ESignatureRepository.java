package com.rif.backend.Esignature;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ESignatureRepository extends JpaRepository<ESignature, Long> {
    Optional<ESignature> findByUserEmail(String email);

    Optional<ESignature> findByUserId(Long userId);
}
