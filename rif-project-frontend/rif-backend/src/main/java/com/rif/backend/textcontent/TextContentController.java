package com.rif.backend.textcontent;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/textcontent")
public class TextContentController {

    @Autowired
    private TextContentService textContentService;

    @GetMapping
    public ResponseEntity<List<TextContent>> getAllTextContents() {
        List<TextContent> textContents = textContentService.getAllTextContents();
        return ResponseEntity.ok(textContents);
    }

    @GetMapping("/{component}")
    public ResponseEntity<TextContent> getTextContentByComponent(@PathVariable String component) {
        Optional<TextContent> textContent = textContentService.getTextContentByComponent(component);
        return textContent.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<TextContent> saveTextContent(@RequestBody TextContent textContent) {
        TextContent savedTextContent = textContentService.saveTextContent(textContent);
        return ResponseEntity.ok(savedTextContent);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TextContent> updateTextContent(@PathVariable Long id, @RequestBody TextContent textContent) {
        textContent.setId(id);
        TextContent updatedTextContent = textContentService.saveTextContent(textContent);
        return ResponseEntity.ok(updatedTextContent);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTextContent(@PathVariable Long id) {
        textContentService.deleteTextContent(id);
        return ResponseEntity.noContent().build();
    }
}
