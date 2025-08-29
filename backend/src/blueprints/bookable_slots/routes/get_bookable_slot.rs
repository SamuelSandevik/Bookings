use actix_http::StatusCode;
use actix_web::{get, web, HttpMessage, HttpRequest, Responder};
use serde::Deserialize;
use uuid::Uuid;

use crate::{blueprints::{bookable_slots::repo, users::repo::UserProfile}, utils::api_response::ApiResponse};

#[derive(Deserialize)]
struct PathParams {
    bookable_slot_uuid: Uuid,
    bookable_uuid: Uuid,
}

#[get("/{bookable_uuid}/{bookable_slot_uuid}")]
pub async fn route(req: HttpRequest, path: web::Path<PathParams>) -> impl Responder {
    
    let user_profile = req.extensions().get::<UserProfile>().cloned().unwrap();


    match repo::get_bookable_slot(&user_profile, &path.bookable_slot_uuid, &path.bookable_uuid).await {
        Ok(up) => ApiResponse::Success { status_code: StatusCode::OK, data: up },
        Err(e) => ApiResponse::Error(e)
    }
}