CREATE OR REPLACE FUNCTION create_booking(
    p_profile_first_name TEXT,
    p_profile_last_name TEXT,
    p_profile_email TEXT,
    p_profile_phone TEXT,
    p_booking_slots_uuid UUID
)
RETURNS bookings AS $$
DECLARE
    v_profile_uuid UUID;
    v_is_within_capacity BOOLEAN;
    v_res bookings;
    v_bookable_uuid UUID;
BEGIN
    -- Hämta profil om den finns
    SELECT uuid INTO v_profile_uuid
    FROM profiles
    WHERE email = p_profile_email;

    -- Kolla kapacitet
    SELECT 
        (SELECT count(*) 
         FROM bookings 
         WHERE bookable_slots_uuid = p_booking_slots_uuid
        ) < bt.max_capacity,
        bt.bookable_uuid
    INTO v_is_within_capacity, v_bookable_uuid
    FROM bookable_slots bt
    WHERE bt.uuid = p_booking_slots_uuid;

    IF NOT v_is_within_capacity THEN
        RAISE EXCEPTION 'This bookable is currently full';
    END IF;

    -- Skapa profil om den inte finns
    IF v_profile_uuid IS NULL THEN
        INSERT INTO profiles (first_name, last_name, email, phone)
        VALUES (p_profile_first_name, p_profile_last_name, p_profile_email, p_profile_phone)
        RETURNING uuid INTO v_profile_uuid;
    END IF;

    -- Skapa bokning
    INSERT INTO bookings (bookable_uuid, profile_uuid, bookable_slots_uuid)
    VALUES (v_bookable_uuid, v_profile_uuid, p_booking_slots_uuid)
    RETURNING * INTO v_res;

    RETURN v_res;
END;
$$ LANGUAGE plpgsql;