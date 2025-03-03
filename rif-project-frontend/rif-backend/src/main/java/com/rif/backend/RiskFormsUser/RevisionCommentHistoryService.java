package com.rif.backend.RiskFormsUser;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RevisionCommentHistoryService {

    @Autowired
    private RevisionCommentHistoryRepository revisionCommentHistoryRepository;

    @Transactional
    public void addRevisionComment(Report report, String comment) {
        RevisionCommentHistory revisionCommentHistory = new RevisionCommentHistory(report, comment);
        revisionCommentHistoryRepository.save(revisionCommentHistory);
    }

    @Transactional(readOnly = true)
    public List<RevisionCommentHistoryDTO> getRevisionCommentsByReportId(Long reportId) {
        return revisionCommentHistoryRepository.findByReportId(reportId).stream()
                .map(revision -> new RevisionCommentHistoryDTO(revision.getId(), revision.getComment(), revision.getTimestamp()))
                .collect(Collectors.toList());
    }
}
