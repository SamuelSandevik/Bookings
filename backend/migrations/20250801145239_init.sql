CREATE EXTENSION IF NOT EXISTS pg_cron;

-- updated_at trigger
CREATE OR REPLACE FUNCTION updated_at_trigger()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := floor(extract(epoch FROM now()) * 1000)::BIGINT;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Skapa eller uppdatera enum-typ
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type') THEN
        CREATE TYPE event_type AS ENUM ('INSERT', 'UPDATE', 'DELETE');
    ELSIF NOT EXISTS (
        SELECT 1 FROM unnest(enum_range(NULL::event_type)) val WHERE val = 'DELETE'
    ) THEN
        ALTER TYPE event_type ADD VALUE 'DELETE';
    END IF;
END$$;

-- event_logs tabellen
CREATE TABLE IF NOT EXISTS event_logs (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    row_uuid UUID NOT NULL,
    event event_type NOT NULL,
    diff JSON,
    timestamp BIGINT NOT NULL DEFAULT floor(extract(epoch FROM now()) * 1000)::BIGINT
);

-- Trigger-funktion för att logga diffs
CREATE OR REPLACE FUNCTION log_event_diff_trigger()
RETURNS trigger AS $$
DECLARE
    diff_data JSON := '{}'::json;
    key TEXT;
    v_row_uuid UUID;
BEGIN
    IF TG_OP = 'INSERT' THEN
        FOR key IN SELECT json_object_keys(to_json(NEW)) LOOP
            IF key NOT IN ('created_at', 'updated_at', 'uuid') THEN
                diff_data := diff_data || json_build_object(key, to_json(NEW)->key);
            END IF;
        END LOOP;

        -- För INSERT finns NEW.uuid
        v_row_uuid := NEW.uuid;

        INSERT INTO event_logs (table_name, row_uuid, event, diff)
        VALUES (TG_TABLE_NAME, v_row_uuid, 'INSERT', diff_data);

    ELSIF TG_OP = 'UPDATE' THEN
        FOR key IN SELECT json_object_keys(to_json(NEW)) LOOP
            IF key NOT IN ('created_at', 'updated_at', 'uuid') THEN
                IF to_json(NEW)->key IS DISTINCT FROM to_json(OLD)->key THEN
                    diff_data := diff_data || json_build_object(
                        key,
                        json_build_array(to_json(OLD)->key, to_json(NEW)->key)
                    );
                END IF;
            END IF;
        END LOOP;

        IF json_object_length(diff_data) > 0 THEN
            v_row_uuid := COALESCE(NEW.uuid, OLD.uuid);
            INSERT INTO event_logs (table_name, row_uuid, event, diff)
            VALUES (TG_TABLE_NAME, v_row_uuid, 'UPDATE', diff_data);
        END IF;

    ELSIF TG_OP = 'DELETE' THEN
        -- Kolla om OLD har kolumnen uuid
        BEGIN
            v_row_uuid := OLD.uuid;
        EXCEPTION WHEN undefined_column THEN
            v_row_uuid := NULL;
        END;

        INSERT INTO event_logs (table_name, row_uuid, event, diff)
        VALUES (TG_TABLE_NAME, v_row_uuid, 'DELETE', to_json(OLD));
    END IF;

    RETURN CASE TG_OP
        WHEN 'DELETE' THEN OLD
        ELSE NEW
    END;
END;
$$ LANGUAGE plpgsql;

-- Index på timestamp
CREATE INDEX IF NOT EXISTS idx_event_logs_timestamp ON event_logs(timestamp);

-- Radera gammalt cron-jobb om det finns
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup_event_logs_daily') THEN
        PERFORM cron.unschedule('cleanup_event_logs_daily');
    END IF;
END;
$$;

-- Skapa nytt cron-jobb, tar bort event logs äldre än 30 dagar varje dag kl 03.00
SELECT cron.schedule(
  'cleanup_event_logs_daily',
  '0 3 * * *',
  $$DELETE FROM event_logs WHERE timestamp < (extract(epoch FROM now() - interval '30 days') * 1000)::BIGINT;$$
);