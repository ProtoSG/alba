package pe.edu.unmsm.tamizaje.assessment;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import pe.edu.unmsm.tamizaje.assessment.AssessmentDtos.*;

@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {
    private final AssessmentService service;

    public AssessmentController(AssessmentService service) { this.service = service; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AssessmentResponse create(Authentication auth, @Valid @RequestBody CreateAssessmentRequest req) {
        return service.create((Long) auth.getPrincipal(), req);
    }

    @GetMapping
    public List<AssessmentResponse> history(Authentication auth) {
        return service.history((Long) auth.getPrincipal());
    }
}
