CREATE TABLE IF NOT EXISTS profiles (
    uuid UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,

    /*
    
    Add more relevant data if needed
    
    */

    created_at BIGINT NOT NULL DEFAULT (floor(extract(epoch from now()) * 1000))::BIGINT,
    updated_at BIGINT NOT NULL DEFAULT (floor(extract(epoch from now()) * 1000))::BIGINT
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

CREATE TRIGGER profiles_bu_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION updated_at_trigger();

-- System och Deleted User Profiles
INSERT INTO profiles (uuid, first_name)
VALUES 
    ('00000000-0000-0000-0000-000000000000', 'System'),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Deleted User')
ON CONFLICT (uuid) DO NOTHING;

CREATE TRIGGER trg_aiud_profiles_event_log
AFTER INSERT OR UPDATE OR DELETE ON profiles
FOR EACH ROW
EXECUTE FUNCTION log_event_diff_trigger();