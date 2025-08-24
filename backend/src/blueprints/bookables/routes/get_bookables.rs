use actix_http::StatusCode;
use actix_web::{get, HttpMessage, HttpRequest, Responder};

use crate::{blueprints::{bookables::repo, users::repo::UserProfile}, utils::api_response::ApiResponse};

#[get("")]
pub async fn route(req: HttpRequest) -> impl Responder {
    
    let user_profile = req.extensions().get::<UserProfile>().cloned().unwrap();


    match repo::get_bookables(&user_profile).await {
        Ok(up) => ApiResponse::Success { status_code: StatusCode::OK, data: up },
        Err(e) => ApiResponse::Error(e)
    }
}