CREATE TABLE IF NOT EXISTS profile_notes (
    uuid UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_uuid UUID NOT NULL REFERENCES profiles(uuid),
    text TEXT,

    created_at BIGINT NOT NULL DEFAULT ((extract(epoch FROM NOW()) * 1000)::BIGINT),
    updated_at BIGINT NOT NULL DEFAULT ((extract(epoch FROM NOW()) * 1000)::BIGINT)
);

CREATE TRIGGER profile_notes_bu_updated_at
BEFORE UPDATE ON profile_notes
FOR EACH ROW
EXECUTE FUNCTION updated_at_trigger();

-- Event log trigger
CREATE TRIGGER trg_aiud_profile_notes_event_log
AFTER INSERT OR UPDATE OR DELETE ON profile_notes
FOR EACH ROW
EXECUTE FUNCTION log_event_diff_trigger();