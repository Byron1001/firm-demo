package com.lexiconlegal.controller;

import com.lexiconlegal.model.ContactRequest;
import com.lexiconlegal.model.ContactResponse;
import com.lexiconlegal.repository.ContactRequestRepository;
import com.lexiconlegal.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final ContactRequestRepository repository;
    private final EmailService emailService;

    public ContactController(ContactRequestRepository repository, EmailService emailService) {
        this.repository = repository;
        this.emailService = emailService;
    }

    @PostMapping
    public ResponseEntity<ContactResponse> submitContact(@Valid @RequestBody ContactRequest request) {
        ContactRequest saved = repository.save(request);

        try {
            emailService.sendContactNotification(saved);
        } catch (Exception e) {
            // Email failure shouldn't block the response
            // Log it in production
        }

        return ResponseEntity.ok(new ContactResponse(
                "Thank you, " + saved.getName() + "! We have received your message and will respond within 24 hours.",
                true
        ));
    }
}
