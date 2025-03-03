package com.rif.backend.textcontent;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TextContentService {

    @Autowired
    private TextContentRepository textContentRepository;

    public List<TextContent> getAllTextContents() {
        return textContentRepository.findAll();
    }

    public Optional<TextContent> getTextContentByComponent(String component) {
        return textContentRepository.findByComponent(component);
    }

    public TextContent saveTextContent(TextContent textContent) {
        return textContentRepository.save(textContent);
    }

    public void deleteTextContent(Long id) {
        textContentRepository.deleteById(id);
    }
}
