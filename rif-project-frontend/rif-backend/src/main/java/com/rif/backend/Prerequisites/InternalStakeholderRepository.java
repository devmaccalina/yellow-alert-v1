package com.rif.backend.Prerequisites;



import com.rif.backend.Prerequisites.InternalStakeholder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InternalStakeholderRepository extends JpaRepository<InternalStakeholder, Long> {
    // You can add custom query methods here if needed.
}
