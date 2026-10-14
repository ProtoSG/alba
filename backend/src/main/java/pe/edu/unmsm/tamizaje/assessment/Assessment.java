package pe.edu.unmsm.tamizaje.assessment;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "assessments")
public class Assessment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id", nullable = false)
    private Long userId;
    @Column(nullable = false)
    private String answers; // "0,1,2,..."
    @Column(name = "total_score", nullable = false)
    private int totalScore;
    @Enumerated(EnumType.STRING)
    @Column(name = "severity_level", nullable = false)
    private SeverityLevel severityLevel;
    @Column(name = "suicide_alert", nullable = false)
    private boolean suicideAlert;
    @Column(name = "referral_recommended", nullable = false)
    private boolean referralRecommended;
    @Column(name = "ml_risk_level")
    private String mlRiskLevel;
    @Column(name = "ml_probabilities")
    private String mlProbabilities;
    @Column(name = "ml_model")
    private String mlModel;
    @Column(nullable = false) private int age;
    @Column(nullable = false) private String sex;
    @Column(nullable = false) private int semester;
    @Column(name = "sleep_hours", nullable = false) private double sleepHours;
    @Column(name = "weekly_study_hours", nullable = false) private double weeklyStudyHours;
    @Column(name = "works_part_time", nullable = false) private boolean worksPartTime;
    @Column(name = "lives_with_family", nullable = false) private boolean livesWithFamily;
    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected Assessment() {}

    public Assessment(Long userId) { this.userId = userId; }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getAnswers() { return answers; }
    public void setAnswers(String v) { this.answers = v; }
    public int getTotalScore() { return totalScore; }
    public void setTotalScore(int v) { this.totalScore = v; }
    public SeverityLevel getSeverityLevel() { return severityLevel; }
    public void setSeverityLevel(SeverityLevel v) { this.severityLevel = v; }
    public boolean isSuicideAlert() { return suicideAlert; }
    public void setSuicideAlert(boolean v) { this.suicideAlert = v; }
    public boolean isReferralRecommended() { return referralRecommended; }
    public void setReferralRecommended(boolean v) { this.referralRecommended = v; }
    public String getMlRiskLevel() { return mlRiskLevel; }
    public void setMlRiskLevel(String v) { this.mlRiskLevel = v; }
    public String getMlProbabilities() { return mlProbabilities; }
    public void setMlProbabilities(String v) { this.mlProbabilities = v; }
    public String getMlModel() { return mlModel; }
    public void setMlModel(String v) { this.mlModel = v; }
    public int getAge() { return age; }
    public void setAge(int v) { this.age = v; }
    public String getSex() { return sex; }
    public void setSex(String v) { this.sex = v; }
    public int getSemester() { return semester; }
    public void setSemester(int v) { this.semester = v; }
    public double getSleepHours() { return sleepHours; }
    public void setSleepHours(double v) { this.sleepHours = v; }
    public double getWeeklyStudyHours() { return weeklyStudyHours; }
    public void setWeeklyStudyHours(double v) { this.weeklyStudyHours = v; }
    public boolean isWorksPartTime() { return worksPartTime; }
    public void setWorksPartTime(boolean v) { this.worksPartTime = v; }
    public boolean isLivesWithFamily() { return livesWithFamily; }
    public void setLivesWithFamily(boolean v) { this.livesWithFamily = v; }
    public Instant getCreatedAt() { return createdAt; }
}
