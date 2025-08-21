CREATE TABLE IF NOT EXISTS bookings (
    bookable_uuid UUID NOT NULL REFERENCES bookables(uuid) ON DELETE CASCADE,
    uuid UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_uuid UUID NOT NULL REFERENCES profiles(uuid),
    bookable_slots_uuid UUID NOT NULL REFERENCES bookable_slots(uuid) ON DELETE CASCADE,
    confirmed BOOLEAN NOT NULL DEFAULT FALSE,

    created_at BIGINT NOT NULL DEFAULT ((extract(epoch FROM NOW()) * 1000)::BIGINT),
    updated_at BIGINT NOT NULL DEFAULT ((extract(epoch FROM NOW()) * 1000)::BIGINT)
);

CREATE TRIGGER bookings_bu_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION updated_at_trigger();

-- Event log trigger
CREATE TRIGGER trg_aiud_bookings_event_log
AFTER INSERT OR UPDATE OR DELETE ON bookings
FOR EACH ROW
EXECUTE FUNCTION log_event_diff_trigger();