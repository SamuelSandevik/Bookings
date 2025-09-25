use actix_http::StatusCode;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sqlx::prelude::FromRow;
use uuid::Uuid;

use crate::{blueprints::users::repo::UserProfile, get_db_pool, utils::api_response::{ApiError, ErrorKind}};

/* pub async fn get_bookings(user_uuid: &Uuid) {
    let res: <Value, sqlx::Error> = sqlx::query_as!(Value, "SELECT * FROM ")
} */

#[derive(Debug, FromRow, Serialize)]
pub struct Booking {
    pub uuid: Uuid,
    pub bookable_uuid: Uuid,
    pub profile_uuid: Uuid,
    pub bookable_slots_uuid: Uuid,
    pub created_at: String,
}

#[derive(Deserialize)]
pub struct NewBookingDTO {
    pub bookable_slot_uuid: Uuid,
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub phone: String,
}
pub async fn create_booking(
    _up: &UserProfile,
    new_booking: &NewBookingDTO,
) -> Result<Value, ApiError> {
    let res: Option<Value> = sqlx::query_scalar!(
        r#"
            SELECT json_build_object(
                'uuid', uuid, 
                'bookable_uuid', bookable_uuid, 
               'profile_uuid', profile_uuid,
                'bookable_slots_uuid', bookable_slots_uuid, 
                'created_at', created_at
                )
            FROM create_booking(
                $1,
                $2,
                $3,
                $4,
                $5
            );
        "#,
        new_booking.first_name,
        new_booking.last_name,
        new_booking.email,
        new_booking.phone,
        new_booking.bookable_slot_uuid,
    )
    .fetch_one(get_db_pool())
    .await.map_err(|e| {
        ApiError {
            status_code: StatusCode::BAD_REQUEST,
            error: ErrorKind::DatabaseError,
            message: e.to_string(),
        }
    })?;

    return match res {
        Some(json) => {
            Ok(json)
        },
        None => Err(ApiError {
            status_code: StatusCode::BAD_REQUEST,
            error: ErrorKind::DatabaseError,
            message: "".to_owned(),
        }),
    }
}

pub async fn get_bookings(up: &UserProfile) -> Result<Value, ApiError> {
    let res = sqlx::query_scalar!(r#"
            SELECT COALESCE(json_agg(row_to_json(s.*)), '[]'::json) 
            FROM bookings s 
            JOIN bookables b ON s.bookable_uuid = b.uuid
            JOIN bookable_slots bs ON s.bookable_slots_uuid = bs.uuid
            WHERE b.belongs_to_user = $1 
        "#,
        up.user.uuid
    )
    .fetch_optional(get_db_pool())
    .await;

    match res {
        Ok(Some(val)) => Ok(val.unwrap()),
        Ok(None) => Err(ApiError {
            status_code: StatusCode::NOT_FOUND,
            error: ErrorKind::NotFound,
            message: "No bookables found".into(),
        }),
        Err(e) => Err(ApiError {
            status_code: StatusCode::BAD_REQUEST,
            error: ErrorKind::DatabaseError,
            message: e.to_string(),
        }),
    }
}

pub async fn get_booking(up:  &UserProfile, booking_uuid: &Uuid) -> Result<Value, ApiError> {
    let res = sqlx::query_scalar!(r#"
            SELECT COALESCE(json_agg(row_to_json(s.*)), '[]'::json) 
            FROM bookings s 
            JOIN bookables b ON s.bookable_uuid = b.uuid
            JOIN bookable_slots bs ON s.bookable_slots_uuid = bs.uuid
            WHERE s.uuid = $1 AND b.belongs_to_user = $2 
        "#,
        booking_uuid,
        up.user.uuid
    )
    .fetch_optional(get_db_pool())
    .await;


    match res {
        Ok(Some(val)) => Ok(val.unwrap()),
        Ok(None) => Err(ApiError {
            status_code: StatusCode::NOT_FOUND,
            error: ErrorKind::NotFound,
            message: "No bookables found".into(),
        }),
        Err(e) => Err(ApiError {
            status_code: StatusCode::BAD_REQUEST,
            error: ErrorKind::DatabaseError,
            message: e.to_string(),
        }),
    }
}

pub async fn update_status_bookings(up: &UserProfile, status: i16, booking_uuid: &Uuid, profile_uuid: &Uuid) -> Result<Value, ApiError> {
    let res = sqlx::query_scalar!(r#"
    UPDATE bookings 
    SET 
    status = $1
    FROM bookings s JOIN bookables b ON b.uuid = s.bookable_uuid
        WHERE s.uuid = $2 AND s.profile_uuid = $3 AND b.belongs_to_user = $4 RETURNING row_to_json(s.*)
        "#,
        
        status,
        booking_uuid,
        profile_uuid,
        up.user.uuid
    )
    .fetch_optional(get_db_pool())
    .await;

    match res {
        Ok(Some(val)) => Ok(val.unwrap()),
        Ok(None) => Err(ApiError {
            status_code: StatusCode::NOT_FOUND,
            error: ErrorKind::NotFound,
            message: "No bookables found".into(),
        }),
        Err(e) => Err(ApiError {
            status_code: StatusCode::BAD_REQUEST,
            error: ErrorKind::DatabaseError,
            message: e.to_string(),
        }),
    }
}

pub async fn delete_booking(up: &UserProfile, booking_uuid: &Uuid) -> Result<(), ApiError> {
    let res = sqlx::query!(r#"
        DELETE FROM bookings s
        USING bookables b
        WHERE b.uuid = s.bookable_uuid
          AND b.belongs_to_user = $1
          AND s.uuid = $2
    "#, up.user.uuid, booking_uuid)
    .execute(get_db_pool()).await;
    if let Err(e) = res {
        return Err(ApiError { status_code: StatusCode::BAD_REQUEST, error: ErrorKind::DatabaseError, message: e.to_string() })
    }
    Ok(())
}