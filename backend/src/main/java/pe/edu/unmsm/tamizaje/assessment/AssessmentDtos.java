package pe.edu.unmsm.tamizaje.assessment;

import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.List;
import java.util.Map;

public final class AssessmentDtos {
    private AssessmentDtos() {}

    public record CreateAssessmentRequest(
            @NotNull @Size(min = 9, max = 9, message = "exactly 9 answers required")
            List<@NotNull @Min(0) @Max(3) Integer> answers,
            @Min(15) @Max(80) int age,
            @NotNull @Pattern(regexp = "[FM]", message = "sex must be F or M") String sex,
            @Min(1) @Max(14) int semester,
            @DecimalMin("0") @DecimalMax("24") double sleepHours,
            @DecimalMin("0") @DecimalMax("100") double weeklyStudyHours,
            boolean worksPartTime,
            boolean livesWithFamily) {}

    /** mlAvailable=false means the ML service was down: mlRiskLevel is null and only PHQ-9 scoring applies. */
    public record AssessmentResponse(
            Long id,
            Instant createdAt,
            List<Integer> answers,
            int totalScore,
            SeverityLevel severityLevel,
            boolean suicideAlert,
            boolean referralRecommended,
            boolean mlAvailable,
            String mlRiskLevel,
            Map<String, Double> mlProbabilities,
            String mlModel,
            String alertMessage) {}
}
