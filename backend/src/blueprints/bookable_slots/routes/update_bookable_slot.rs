use actix_http::StatusCode;
use actix_web::{put, web, HttpMessage, HttpRequest, Responder};
use uuid::Uuid;

use crate::{blueprints::{bookable_slots::repo::{self, NewBookableSlotDTO}, users::repo::UserProfile}, utils::api_response::ApiResponse};

#[put("/{bookable_uuid}/{bookable_slot_uuid}")]
pub async fn route(req: HttpRequest, path: web::Path<(Uuid, Uuid)>, body: web::Json<NewBookableSlotDTO>) -> impl Responder {
    
    let user_profile = req.extensions().get::<UserProfile>().cloned().unwrap();


    match repo::update_bookable_slot(&user_profile, &path.1, &body.0).await {
        Ok(up) => ApiResponse::Success { status_code: StatusCode::OK, data: up },
        Err(e) => ApiResponse::Error(e)
    }
}