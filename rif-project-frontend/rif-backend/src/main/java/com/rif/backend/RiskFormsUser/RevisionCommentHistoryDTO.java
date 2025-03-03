package com.rif.backend.RiskFormsUser;

import java.time.LocalDateTime;

public class RevisionCommentHistoryDTO {

    private Long id;
    private String comment;
    private LocalDateTime timestamp;

    public RevisionCommentHistoryDTO() {}

    public RevisionCommentHistoryDTO(Long id, String comment, LocalDateTime timestamp) {
        this.id = id;
        this.comment = comment;
        this.timestamp = timestamp;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
