use actix_http::StatusCode;
use serde::Deserialize;
use serde_json::Value;
use uuid::Uuid;

use crate::{blueprints::users::repo::UserProfile, get_db_pool, utils::api_response::{ApiError, ErrorKind}};

/* pub async fn get_bookings(user_uuid: &Uuid) {
    let res: <Value, sqlx::Error> = sqlx::query_as!(Value, "SELECT * FROM ")
} */


#[derive(Deserialize)]
pub struct NewBookableDTO {
    pub title: String,
    pub price: f64,
    pub desc: Option<String>,
    pub color: Option<String>,
}

// c82609e4-b0a1-4a16-9172-ce5d9b085fe2

pub async fn create_bookable(
    up: &UserProfile,
    new_bookable: &NewBookableDTO,
) -> Result<Value, ApiError> {
    let res: Result<Option<Value>, sqlx::Error> = sqlx::query_scalar!(
        r#"
        INSERT INTO bookables (title, price, "desc", color, belongs_to_user)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING row_to_json(bookables)
        "#,
        new_bookable.title,
        new_bookable.price,
        new_bookable.desc,
        new_bookable.color,
        up.user.uuid
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

pub async fn get_bookables(up: &UserProfile) -> Result<Value, ApiError> {
    let res = sqlx::query_scalar!(r#"
            SELECT COALESCE(json_agg(row_to_json(bookables)), '[]'::json) 
            FROM bookables 
            WHERE belongs_to_user = $1
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

pub async fn update_bookable(up: &UserProfile, bookable_uuid: &Uuid, new_bookable: &NewBookableDTO) -> Result<Value, ApiError> {
    let res = sqlx::query_scalar!(
        // query must be a string literal
        r#"UPDATE bookables SET 
            title = $3,
            price = $4,
            "desc" = $5,
            color = $6
           WHERE belongs_to_user = $1 AND uuid = $2 RETURNING row_to_json(bookables) "#,
        up.user.uuid,
        bookable_uuid,
        new_bookable.title,
        new_bookable.price,
        new_bookable.desc,
        new_bookable.color,
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