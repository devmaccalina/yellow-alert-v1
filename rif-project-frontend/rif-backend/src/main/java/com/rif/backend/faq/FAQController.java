package com.rif.backend.faq;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faqs")
public class FAQController {

    @Autowired
    private FAQService faqService;

    @GetMapping
    public List<FAQ> getAllFAQs() {
        return faqService.getAllFAQs();
    }

    @GetMapping("/{id}")
    public ResponseEntity<FAQ> getFAQById(@PathVariable Long id) {
        FAQ faq = faqService.getFAQById(id);
        if (faq != null) {
            return ResponseEntity.ok(faq);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public FAQ createFAQ(@RequestBody FAQ faq) {
        return faqService.createFAQ(faq);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FAQ> updateFAQ(@PathVariable Long id, @RequestBody FAQ faqDetails) {
        FAQ updatedFAQ = faqService.updateFAQ(id, faqDetails);
        if (updatedFAQ != null) {
            return ResponseEntity.ok(updatedFAQ);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFAQ(@PathVariable Long id) {
        faqService.deleteFAQ(id);
        return ResponseEntity.noContent().build();
    }
}
