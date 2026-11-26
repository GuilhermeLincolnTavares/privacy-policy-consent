-- Records which user accepted which policy version, and when.
-- The unique constraint makes accepting idempotent and prevents duplicate rows.
CREATE TABLE privacy_consents (
    id          BIGSERIAL   PRIMARY KEY,
    user_id     BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    policy_id   BIGINT      NOT NULL REFERENCES privacy_policies (id),
    accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_privacy_consents_user_policy UNIQUE (user_id, policy_id)
);

CREATE INDEX idx_privacy_consents_policy ON privacy_consents (policy_id);
