package com.rif.backend.RiskFormsUser;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "revision_comment_history")
public class RevisionCommentHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id")
    private Report report;

    @Column(name = "comment", length = 1000)
    private String comment;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    public RevisionCommentHistory() {}

    public RevisionCommentHistory(Report report, String comment) {
        this.report = report;
        this.comment = comment;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Report getReport() {
        return report;
    }

    public void setReport(Report report) {
        this.report = report;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
