package pe.edu.unmsm.tamizaje.assessment;

import java.util.List;

/** Pure PHQ-9 scoring rules. */
public final class Phq9Scoring {
    private Phq9Scoring() {}

    public static int totalScore(List<Integer> answers) {
        if (answers == null || answers.size() != 9) {
            throw new IllegalArgumentException("PHQ-9 requires exactly 9 answers");
        }
        int sum = 0;
        for (Integer a : answers) {
            if (a == null || a < 0 || a > 3) throw new IllegalArgumentException("answers must be 0-3");
            sum += a;
        }
        return sum;
    }

    /** Any non-zero answer to item 9 triggers the alert, regardless of the total score. */
    public static boolean suicideIdeationAlert(List<Integer> answers) {
        return answers.get(8) > 0;
    }

    public static boolean referralRecommended(SeverityLevel level, boolean suicideAlert) {
        return suicideAlert || level == SeverityLevel.SEVERE;
    }
}
