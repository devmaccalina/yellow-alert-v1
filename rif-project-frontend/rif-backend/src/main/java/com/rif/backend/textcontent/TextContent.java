package com.rif.backend.textcontent;

import javax.persistence.*;

@Entity
@Table(name = "text_content")
public class TextContent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String component;

    @Column(nullable = false)
    private String content;

    // Default constructor
    public TextContent() {}

    // Constructor with all fields
    public TextContent(String component, String content) {
        this.component = component;
        this.content = content;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getComponent() {
        return component;
    }

    public void setComponent(String component) {
        this.component = component;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
