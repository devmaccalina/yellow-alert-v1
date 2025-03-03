package com.rif.backend.RiskFormsUser;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RevisionCommentHistoryRepository extends JpaRepository<RevisionCommentHistory, Long> {
    List<RevisionCommentHistory> findByReportId(Long reportId);
}
