use actix_http::StatusCode;
use actix_web::{get, web, HttpMessage, HttpRequest, Responder};
use serde::Deserialize;
use uuid::Uuid;

use crate::{blueprints::{bookings::repo, users::repo::UserProfile}, utils::api_response::ApiResponse};

#[derive(Deserialize)]



struct Body {
    pub bookable_uuid: Uuid
}

#[get("/{profile_uuid}")]
pub async fn route(req: HttpRequest, path: web::Path<Body>) -> impl Responder {
    
    let user_profile = req.extensions().get::<UserProfile>().cloned().unwrap();


    match repo::get_bookings(&user_profile, &path.bookable_uuid).await {
        Ok(up) => ApiResponse::Success { status_code: StatusCode::OK, data: up },
        Err(e) => ApiResponse::Error(e)
    }
}