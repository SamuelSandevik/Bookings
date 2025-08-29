use actix_http::StatusCode;
use serde::Deserialize;
use serde_json::Value;
use uuid::Uuid;

use crate::{blueprints::users::repo::UserProfile, get_db_pool, utils::api_response::{ApiError, ErrorKind}};

/* pub async fn get_bookings(user_uuid: &Uuid) {
    let res: <Value, sqlx::Error> = sqlx::query_as!(Value, "SELECT * FROM ")
} */


#[derive(Deserialize)]
pub struct NewBookableSlotDTO {
    pub bookable_uuid: Uuid,
    pub date: i64,
    pub time_from: Option<i64>,
    pub time_to: Option<i64>,
    pub min_capacity: Option<i32>,
    pub max_capacity: Option<i32>
}

pub async fn create_bookable_slot(
    up: &UserProfile,
    new_bookable_slot: &NewBookableSlotDTO,
) -> Result<Value, ApiError> {
    let res: Result<Option<Value>, sqlx::Error> = sqlx::query_scalar!(
        r#"
        INSERT INTO bookable_slots (bookable_uuid, date, time_from, time_to, min_capacity, max_capacity)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING row_to_json(bookable_slots)
        "#,
        new_bookable_slot.bookable_uuid,
        new_bookable_slot.date,
        new_bookable_slot.time_from,
        new_bookable_slot.time_to,
        new_bookable_slot.min_capacity,
        new_bookable_slot.max_capacity,
    )
    .fetch_one(get_db_pool())
    .await;

    match res {
        Ok(val) => Ok(val.expect("Could not deserialize new bookable")),
        Err(e) => Err(ApiError {
            status_code: StatusCode::BAD_REQUEST,
            error: ErrorKind::DatabaseError,
            message: e.to_string(),
        }),
    }
}

pub async fn get_bookable_slots(up: &UserProfile, bookable_slot_uuid: &Uuid) -> Result<Value, ApiError> {
    let res = sqlx::query_scalar!(r#"
            SELECT COALESCE(json_agg(row_to_json(s.*)), '[]'::json) 
            FROM bookable_slots s 
            JOIN bookables b ON s.bookable_uuid = b.uuid
            WHERE s.uuid = $1 AND b.belongs_to_user = $2 
        "#,
        bookable_slot_uuid,
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

pub async fn get_bookable(up:  &UserProfile, uuid: &Uuid) -> Result<Value, ApiError> {
    let res = sqlx::query_scalar!(r#"
            SELECT row_to_json(bookables)
            FROM bookables 
            WHERE belongs_to_user = $1 AND uuid = $2
        "#,
        up.user.uuid,
        uuid
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

pub async fn update_bookable(up: &UserProfile, bookable_slot_uuid: &Uuid, new_bookable_slot: &NewBookableSlotDTO) -> Result<Value, ApiError> {
    let res = sqlx::query_scalar!(
        // query must be a string literal
        r#"UPDATE bookable_slots SET 
            date = $3,
            time_from = $4,
            time_to = $5,
            min_capacity = $6,
            max_capacity = $7
           WHERE bookable_uuid = $1 AND uuid = $2 RETURNING row_to_json(bookable_slots) "#,
        new_bookable_slot.bookable_uuid,
        bookable_slot_uuid,
        new_bookable_slot.date,
        new_bookable_slot.time_from,
        new_bookable_slot.time_to,
        new_bookable_slot.min_capacity,
        new_bookable_slot.max_capacity
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

pub async fn delete_bookable(up: &UserProfile, bookable_uuid: &Uuid) -> Result<(), ApiError> {
    let res = sqlx::query!("DELETE FROM bookables WHERE belongs_to_user = $1 AND uuid = $2", up.user.uuid, bookable_uuid)
    .execute(get_db_pool()).await;
    if let Err(e) = res {
        return Err(ApiError { status_code: StatusCode::BAD_REQUEST, error: ErrorKind::DatabaseError, message: e.to_string() })
    }
    Ok(())
}