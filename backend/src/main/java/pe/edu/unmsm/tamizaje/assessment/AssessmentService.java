package pe.edu.unmsm.tamizaje.assessment;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import pe.edu.unmsm.tamizaje.assessment.AssessmentDtos.*;
import pe.edu.unmsm.tamizaje.ml.MlClient;

@Service
public class AssessmentService {
    static final String ALERT_SUICIDE =
            "Your answer to item 9 indicates thoughts of self-harm. Please contact a mental health professional "
            + "or the UNMSM student wellbeing service as soon as possible. In Peru, call Linea 113 (option 5), 24 hours.";
    static final String ALERT_SEVERE =
            "Your score suggests severe symptoms. We strongly recommend a professional evaluation.";

    private final AssessmentRepository repo;
    private final MlClient ml;
    private final ObjectMapper mapper;

    public AssessmentService(AssessmentRepository repo, MlClient ml, ObjectMapper mapper) {
        this.repo = repo;
        this.ml = ml;
        this.mapper = mapper;
    }

    public AssessmentResponse create(Long userId, CreateAssessmentRequest req) {
        List<Integer> a = req.answers();
        int score = Phq9Scoring.totalScore(a);
        SeverityLevel level = SeverityLevel.fromScore(score);
        boolean suicide = Phq9Scoring.suicideIdeationAlert(a);

        var prediction = ml.predict(new MlClient.PredictRequest(
                a.get(0), a.get(1), a.get(2), a.get(3), a.get(4), a.get(5), a.get(6), a.get(7), a.get(8),
                req.age(), req.sex(), req.semester(), req.sleepHours(), req.weeklyStudyHours(),
                req.worksPartTime(), req.livesWithFamily()));

        Assessment e = new Assessment(userId);
        e.setAnswers(String.join(",", a.stream().map(String::valueOf).toList()));
        e.setTotalScore(score);
        e.setSeverityLevel(level);
        e.setSuicideAlert(suicide);
        e.setReferralRecommended(Phq9Scoring.referralRecommended(level, suicide));
        e.setAge(req.age());
        e.setSex(req.sex());
        e.setSemester(req.semester());
        e.setSleepHours(req.sleepHours());
        e.setWeeklyStudyHours(req.weeklyStudyHours());
        e.setWorksPartTime(req.worksPartTime());
        e.setLivesWithFamily(req.livesWithFamily());
        prediction.ifPresent(p -> {
            e.setMlRiskLevel(p.riskLevel());
            e.setMlModel(p.model());
            try {
                e.setMlProbabilities(mapper.writeValueAsString(p.probabilities()));
            } catch (JsonProcessingException ex) {
                throw new IllegalStateException(ex);
            }
        });
        return toResponse(repo.save(e));
    }

    public List<AssessmentResponse> history(Long userId) {
        return repo.findByUserIdOrderByCreatedAtDesc(userId).stream().map(this::toResponse).toList();
    }

    private AssessmentResponse toResponse(Assessment e) {
        List<Integer> answers = Arrays.stream(e.getAnswers().split(",")).map(Integer::valueOf).toList();
        Map<String, Double> probs = null;
        if (e.getMlProbabilities() != null) {
            try {
                probs = mapper.readValue(e.getMlProbabilities(), new TypeReference<>() {});
            } catch (JsonProcessingException ex) {
                probs = null;
            }
        }
        String msg = e.isSuicideAlert() ? ALERT_SUICIDE
                : e.isReferralRecommended() ? ALERT_SEVERE : null;
        return new AssessmentResponse(e.getId(), e.getCreatedAt(), answers, e.getTotalScore(),
                e.getSeverityLevel(), e.isSuicideAlert(), e.isReferralRecommended(),
                e.getMlRiskLevel() != null, e.getMlRiskLevel(), probs, e.getMlModel(), msg);
    }
}
