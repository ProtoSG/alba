CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(255) NOT NULL,
    consent_at    TIMESTAMPTZ NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE assessments (
    id                   BIGSERIAL PRIMARY KEY,
    user_id              BIGINT NOT NULL REFERENCES users(id),
    answers              VARCHAR(40) NOT NULL,          -- 9 comma-separated values 0-3
    total_score          INT NOT NULL CHECK (total_score BETWEEN 0 AND 27),
    severity_level       VARCHAR(30) NOT NULL,
    suicide_alert        BOOLEAN NOT NULL,
    referral_recommended BOOLEAN NOT NULL,
    ml_risk_level        VARCHAR(20),
    ml_probabilities     VARCHAR(255),
    ml_model             VARCHAR(60),
    age                  INT NOT NULL,
    sex                  VARCHAR(1) NOT NULL,
    semester             INT NOT NULL,
    sleep_hours          DOUBLE PRECISION NOT NULL,
    weekly_study_hours   DOUBLE PRECISION NOT NULL,
    works_part_time      BOOLEAN NOT NULL,
    lives_with_family    BOOLEAN NOT NULL,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_assessments_user ON assessments(user_id, created_at DESC);
