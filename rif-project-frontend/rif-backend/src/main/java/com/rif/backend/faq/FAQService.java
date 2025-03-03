package com.rif.backend.faq;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FAQService {

    @Autowired
    private FAQRepository faqRepository;

    public List<FAQ> getAllFAQs() {
        return faqRepository.findAll();
    }

    public FAQ getFAQById(Long id) {
        return faqRepository.findById(id).orElse(null);
    }

    public FAQ createFAQ(FAQ faq) {
        return faqRepository.save(faq);
    }

    public FAQ updateFAQ(Long id, FAQ faqDetails) {
        FAQ faq = faqRepository.findById(id).orElse(null);
        if (faq != null) {
            faq.setQuestion(faqDetails.getQuestion());
            faq.setAnswer(faqDetails.getAnswer());
            return faqRepository.save(faq);
        }
        return null;
    }

    public void deleteFAQ(Long id) {
        faqRepository.deleteById(id);
    }
}
