
/*
This function creates a profile and connects it with a new user which is then returned 
if the email is not yet connected to another account
*/
CREATE OR REPLACE FUNCTION create_user_and_profile_with_credentials(
    p_first_name TEXT,
    p_last_name TEXT,
    p_email TEXT,
    p_password_hash TEXT,
    p_phone TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE 
    v_profile_uuid UUID;
    v_user_uuid UUID;
    v_conflict_exists BOOLEAN;
    v_final_object JSON;
BEGIN
    IF p_first_name IS NULL OR p_last_name IS NULL OR p_email IS NULL OR p_password_hash IS NULL THEN
        RAISE EXCEPTION 'First name, last name, email, and password hash must be provided';
    END IF;

    -- Kontrollera om e-posten är kopplad till en profil som redan har en användare
    SELECT EXISTS (
        SELECT 1
        FROM profiles p
        JOIN users u ON u.profile_uuid = p.uuid
        WHERE p.email = p_email
    ) INTO v_conflict_exists;

    IF v_conflict_exists THEN
        RAISE EXCEPTION 'Email % is already connected to another active user', p_email;
    END IF;

    -- Skapa ny profil
    INSERT INTO profiles (first_name, last_name, email, phone)
    VALUES (p_first_name, p_last_name, p_email, p_phone)
    RETURNING uuid INTO v_profile_uuid;

    -- Skapa användare
    INSERT INTO users (profile_uuid, password_hash, super_user)
    VALUES (v_profile_uuid, p_password_hash, FALSE)
    RETURNING uuid INTO v_user_uuid;

    -- Returnera user + profile som JSON
    SELECT json_build_object (
        'user', u,
        'profile', p
    ) INTO v_final_object
    FROM users u
    JOIN profiles p ON u.profile_uuid = p.uuid
    WHERE u.uuid = v_user_uuid;

    RETURN v_final_object;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_user_profile(
    p_user_uuid UUID,
    p_first_name TEXT,
    p_last_name TEXT,
    p_email TEXT,
    p_phone TEXT
)
RETURNS JSON AS $$
DECLARE
    v_profile_uuid UUID;
    v_conflict_exists BOOLEAN;
    v_result JSON;
BEGIN
    -- Validera obligatoriska fält
    IF p_first_name IS NULL OR p_last_name IS NULL OR p_email IS NULL THEN
        RAISE EXCEPTION 'First name, last name and email must be provided';
    END IF;

    -- Hämta profile_uuid från user_uuid
    SELECT profile_uuid INTO v_profile_uuid
    FROM users
    WHERE uuid = p_user_uuid;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User with UUID % does not exist', p_user_uuid;
    END IF;

    -- Kontrollera om e-posten används i en annan profil som är kopplad till en annan användare
    SELECT EXISTS (
        SELECT 1
        FROM profiles p
        JOIN users u ON u.profile_uuid = p.uuid
        WHERE p.email = p_email
          AND p.uuid <> v_profile_uuid
    ) INTO v_conflict_exists;

    IF v_conflict_exists THEN
        RAISE EXCEPTION 'Email % is already connected to another user account', p_email;
    END IF;

    -- Uppdatera profilen
    UPDATE profiles
    SET 
        first_name = p_first_name,
        last_name = p_last_name,
        email = p_email,
        phone = p_phone
    WHERE uuid = v_profile_uuid;

    -- Returnera både user och profile som JSON
    SELECT json_build_object(
        'user', u,
        'profile', p
    ) INTO v_result
    FROM users u
    JOIN profiles p ON u.profile_uuid = p.uuid
    WHERE u.uuid = p_user_uuid;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

/*
Creates a profile and connects it to a user if the email is not yet connected to another user account
*/
CREATE OR REPLACE FUNCTION create_user_and_profile_with_otc(
    p_first_name TEXT,
    p_last_name TEXT,
    p_email TEXT,
    p_otc TEXT,
    p_phone TEXT DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
    v_profile_uuid UUID;
    v_user_uuid UUID;
    v_existing_user BOOLEAN;
    v_valid_until BIGINT;
BEGIN
    IF p_first_name IS NULL OR p_last_name IS NULL OR p_email IS NULL OR p_otc IS NULL THEN
        RAISE EXCEPTION 'First name, last name, email and otc must be provided';
    END IF;

    -- Kontrollera om användare redan finns
    SELECT EXISTS(
        SELECT 1 FROM users u
        JOIN profiles p ON u.profile_uuid = p.uuid
        WHERE p.email = p_email
    ) INTO v_existing_user;

    IF v_existing_user THEN
        RAISE EXCEPTION 'Email % is already connected to another user account', p_email;
    END IF;

    -- Skapa ny profil
    INSERT INTO profiles (first_name, last_name, email, phone)
    VALUES (p_first_name, p_last_name, p_email, p_phone)
    RETURNING uuid INTO v_profile_uuid;

    -- Skapa ny användare
    INSERT INTO users (profile_uuid, super_user)
    VALUES (v_profile_uuid, FALSE)
    RETURNING uuid INTO v_user_uuid;

    -- Skapa OTC
    INSERT INTO otcs (otc, user_uuid)
    VALUES (p_otc, v_user_uuid) RETURNING valid_until INTO v_valid_until;

    RETURN v_valid_until::BIGINT;

END;
$$ LANGUAGE plpgsql;



/*
Creates a lost password code
*/
CREATE OR REPLACE FUNCTION create_otc_with_email(
    p_email TEXT,
    p_otc TEXT
)
RETURNS BIGINT AS $$
DECLARE
    v_user_uuid UUID;
    v_valid_until BIGINT;
BEGIN
    IF p_email IS NULL OR p_otc IS NULL THEN
        RAISE EXCEPTION 'lpwc and user email must be provided';
    END IF;

    -- Kontrollera om användare redan finns
    SELECT u.uuid FROM users u
    JOIN profiles p ON u.profile_uuid = p.uuid
    WHERE p.email = p_email
    INTO v_user_uuid;
    
    IF v_user_uuid IS NULL THEN
        RAISE EXCEPTION 'Could not create a one time code for this user';
    END IF;

    SELECT create_or_update_otc(v_user_uuid, p_otc) INTO v_valid_until;

    RETURN v_valid_until::BIGINT;

END;
$$ LANGUAGE plpgsql;
/*
Creates a lost password code
*/
CREATE OR REPLACE FUNCTION create_lpwc_with_email(
    p_email TEXT,
    p_lpwc TEXT
)
RETURNS BIGINT AS $$
DECLARE
    v_user_uuid UUID;
    v_valid_until BIGINT;
BEGIN
    IF p_email IS NULL OR p_lpwc IS NULL THEN
        RAISE EXCEPTION 'lpwc and user email must be provided';
    END IF;

    -- Kontrollera om användare redan finns
    SELECT u.uuid FROM users u
    JOIN profiles p ON u.profile_uuid = p.uuid
    WHERE p.email = p_email
    INTO v_user_uuid;
    
    IF v_user_uuid IS NULL THEN
        RAISE EXCEPTION 'Could not create a lost password code for this user';
    END IF;

    SELECT create_or_update_lpwc(v_user_uuid, p_lpwc) INTO v_valid_until;

    RETURN v_valid_until::BIGINT;

END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION create_or_update_otc(
    p_user_uuid UUID,
    p_otc TEXT
) RETURNS BIGINT AS $$
DECLARE
    v_valid_until BIGINT;
BEGIN 
    SELECT ((extract(epoch FROM NOW()) * 1000)::BIGINT + (10 * 60 * 1000)) INTO v_valid_until;

    INSERT INTO otcs (user_uuid, otc, valid_until)
    VALUES (
        p_user_uuid, 
        p_otc, 
        v_valid_until
    )
    ON CONFLICT (user_uuid) DO UPDATE
    SET otc = EXCLUDED.otc,
        valid_until = EXCLUDED.valid_until;
    RETURN v_valid_until::BIGINT;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION create_or_update_lpwc(
    p_user_uuid UUID,
    p_lpwc TEXT
) RETURNS BIGINT AS $$
DECLARE
    v_valid_until BIGINT;
BEGIN 
    SELECT ((extract(epoch FROM NOW()) * 1000)::BIGINT + (10 * 60 * 1000)) INTO v_valid_until;
    INSERT INTO lpwcs (user_uuid, lpwc, valid_until)
    VALUES (
        p_user_uuid, 
        p_lpwc, 
        v_valid_until
    )
    ON CONFLICT (user_uuid) DO UPDATE
    SET lpwc = EXCLUDED.lpwc,
        valid_until = EXCLUDED.valid_until;
    RETURN v_valid_until::BIGINT;
END;
$$ LANGUAGE plpgsql;
