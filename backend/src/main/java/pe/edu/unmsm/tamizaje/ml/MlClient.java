package pe.edu.unmsm.tamizaje.ml;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Duration;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.ClientHttpRequestFactories;
import org.springframework.boot.web.client.ClientHttpRequestFactorySettings;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/** Calls the FastAPI ML service. Never throws: returns empty when the service is unavailable. */
@Component
public class MlClient {
    private static final Logger log = LoggerFactory.getLogger(MlClient.class);
    private final RestClient client;

    public MlClient(@Value("${app.ml.url}") String url, @Value("${app.ml.timeout-ms}") long timeoutMs) {
        var settings = ClientHttpRequestFactorySettings.DEFAULTS
                .withConnectTimeout(Duration.ofMillis(timeoutMs))
                .withReadTimeout(Duration.ofMillis(timeoutMs));
        this.client = RestClient.builder()
                .baseUrl(url)
                .requestFactory(ClientHttpRequestFactories.get(settings))
                .build();
    }

    public record PredictRequest(
            int phq1, int phq2, int phq3, int phq4, int phq5, int phq6, int phq7, int phq8, int phq9,
            int age, String sex, int semester,
            @JsonProperty("sleep_hours") double sleepHours,
            @JsonProperty("weekly_study_hours") double weeklyStudyHours,
            @JsonProperty("works_part_time") boolean worksPartTime,
            @JsonProperty("lives_with_family") boolean livesWithFamily) {}

    public record Prediction(
            @JsonProperty("risk_level") String riskLevel,
            Map<String, Double> probabilities,
            String model) {}

    public Optional<Prediction> predict(PredictRequest req) {
        try {
            return Optional.ofNullable(client.post().uri("/predict").body(req).retrieve().body(Prediction.class));
        } catch (Exception e) {
            log.warn("ML service unavailable, using fallback: {}", e.getMessage());
            return Optional.empty();
        }
    }
}
