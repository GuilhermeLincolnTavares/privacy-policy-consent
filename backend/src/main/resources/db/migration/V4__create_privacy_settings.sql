-- Single-row table holding the global switch for the consent notification.
CREATE TABLE privacy_settings (
    id                   INTEGER     PRIMARY KEY CHECK (id = 1),
    notification_enabled BOOLEAN     NOT NULL DEFAULT TRUE,
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO privacy_settings (id, notification_enabled) VALUES (1, TRUE);
