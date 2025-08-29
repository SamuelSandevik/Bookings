use actix_http::StatusCode;
use actix_web::{delete, web, HttpMessage, HttpRequest, Responder};
use uuid::Uuid;

use crate::{blueprints::{bookable_slots::repo, users::repo::UserProfile}, utils::api_response::ApiResponse};

#[delete("/{bookable_slot_uuid}")]
pub async fn route(req: HttpRequest, path: web::Path<(Uuid,)>) -> impl Responder {
    
    let user_profile = req.extensions().get::<UserProfile>().cloned().unwrap();


    match repo::delete_bookable_slot(&user_profile, &path.0).await {
        Ok(up) => ApiResponse::Success { status_code: StatusCode::OK, data: up },
        Err(e) => ApiResponse::Error(e)
    }
}