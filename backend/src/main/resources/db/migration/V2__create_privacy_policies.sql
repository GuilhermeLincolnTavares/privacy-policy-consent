-- One row per published version of the privacy policy.
CREATE TABLE privacy_policies (
    id         BIGSERIAL    PRIMARY KEY,
    version    INTEGER      NOT NULL UNIQUE,
    title      VARCHAR(160) NOT NULL,
    content    TEXT         NOT NULL,
    is_current BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Guarantees at most one current policy.
CREATE UNIQUE INDEX uq_privacy_policies_single_current
    ON privacy_policies (is_current) WHERE is_current;
