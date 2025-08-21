CREATE TABLE IF NOT EXISTS bookables (
    uuid UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    price DECIMAL(9, 2) NOT NULL,
    "desc" TEXT,
    type TEXT,
    

    created_at BIGINT NOT NULL DEFAULT ((extract(epoch FROM NOW()) * 1000)::BIGINT),
    updated_at BIGINT NOT NULL DEFAULT ((extract(epoch FROM NOW()) * 1000)::BIGINT)
);



CREATE TRIGGER bookables_bu_updated_at
BEFORE UPDATE ON bookables
FOR EACH ROW
EXECUTE FUNCTION updated_at_trigger();

-- Eventlogg-trigger
CREATE TRIGGER trg_aiud_bookables_event_log
AFTER INSERT OR UPDATE OR DELETE ON bookables
FOR EACH ROW
EXECUTE FUNCTION log_event_diff_trigger();