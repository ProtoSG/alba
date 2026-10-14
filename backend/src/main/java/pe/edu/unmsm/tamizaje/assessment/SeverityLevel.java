package pe.edu.unmsm.tamizaje.assessment;

public enum SeverityLevel {
    MINIMAL, MILD, MODERATE, MODERATELY_SEVERE, SEVERE;

    /** Standard PHQ-9 cut points: 0-4, 5-9, 10-14, 15-19, 20-27. */
    public static SeverityLevel fromScore(int score) {
        if (score < 0 || score > 27) throw new IllegalArgumentException("PHQ-9 score out of range: " + score);
        if (score <= 4) return MINIMAL;
        if (score <= 9) return MILD;
        if (score <= 14) return MODERATE;
        if (score <= 19) return MODERATELY_SEVERE;
        return SEVERE;
    }
}
