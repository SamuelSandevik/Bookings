-- Skapa tabellen users
CREATE TABLE IF NOT EXISTS users (
    uuid UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    profile_uuid UUID UNIQUE NOT NULL REFERENCES profiles(uuid) ON DELETE CASCADE,
    password_hash TEXT CHECK (char_length(password_hash) <= 95),
    super_user BOOLEAN NOT NULL DEFAULT FALSE,

    -- Tidsstämplar
    created_at BIGINT NOT NULL DEFAULT (floor(extract(epoch from now()) * 1000))::BIGINT,
    updated_at BIGINT NOT NULL DEFAULT (floor(extract(epoch from now()) * 1000))::BIGINT
);

-- Trigger för updated_at
CREATE TRIGGER users_bu_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION updated_at_trigger();

-- Funktion: säkerställ unik email
CREATE OR REPLACE FUNCTION enforce_unique_email_on_users()
RETURNS TRIGGER AS $$
DECLARE
    email_to_check TEXT;
BEGIN
    SELECT email INTO email_to_check FROM profiles WHERE uuid = NEW.profile_uuid;

    IF email_to_check IS NOT NULL AND EXISTS (
        SELECT 1 FROM users u
        JOIN profiles p ON u.profile_uuid = p.uuid
        WHERE p.email = email_to_check
          AND u.profile_uuid <> NEW.profile_uuid
    ) THEN
        RAISE EXCEPTION 'Email is already connected to another user account.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: kontroll av unik email
CREATE TRIGGER users_biu_enforce_unique_email
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION enforce_unique_email_on_users();

-- Funktion: förhindra svartlistade UUID:er
CREATE OR REPLACE FUNCTION prevent_blacklisted_generated_uuid()
RETURNS trigger AS $$
BEGIN
    -- Sätt UUID om det inte redan finns
    IF NEW.uuid IS NULL THEN
        NEW.uuid := gen_random_uuid();
    END IF;

    -- Undvik förbjudna UUID:er
    IF NEW.uuid IN (
        '00000000-0000-0000-0000-000000000000',
        'ffffffff-ffff-ffff-ffff-ffffffffffff'
    ) THEN
        NEW.uuid := gen_random_uuid();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER users_bi_prevent_blacklist_uuid
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION prevent_blacklisted_generated_uuid();

-- Infoga system- och deleted-user poster
INSERT INTO users (uuid, profile_uuid)
VALUES 
    ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000'),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'ffffffff-ffff-ffff-ffff-ffffffffffff')
ON CONFLICT (uuid) DO NOTHING;

-- Eventlogg-trigger
CREATE TRIGGER trg_aiud_users_event_log
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW
EXECUTE FUNCTION log_event_diff_trigger();