CREATE TABLE IF NOT EXISTS bookable_slots (
    bookable_uuid UUID NOT NULL REFERENCES bookables(uuid) ON DELETE CASCADE,
    uuid UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    date BIGINT NOT NULL,
    time_from BIGINT,
    time_to BIGINT,
    min_capacity INT,
    max_capacity INT
);

CREATE TRIGGER bookable_slots_bu_updated_at
BEFORE UPDATE ON bookable_slots
FOR EACH ROW
EXECUTE FUNCTION updated_at_trigger();

-- Eventlogg-trigger
CREATE TRIGGER trg_aiud_bookable_slots_event_log
AFTER INSERT OR UPDATE OR DELETE ON bookable_slots
FOR EACH ROW
EXECUTE FUNCTION log_event_diff_trigger();