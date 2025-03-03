package com.rif.backend.Approver;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApproverRepository extends JpaRepository<Approver, Long> {
    Optional<Approver> findByUserEmail(String email);
    Optional<Approver> findByUserId(Long userId);
    Optional<Approver> findByApproverUnit(String approverUnit);

}
