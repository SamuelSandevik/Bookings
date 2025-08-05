use actix_http::StatusCode;
use actix_web::{put, web, HttpMessage, HttpRequest, Responder};
use serde::Deserialize;
use crate::{blueprints::users::repo::{self, UserProfile}, utils::api_response::{ApiResponse}};

#[derive(Deserialize)]
pub struct UpdateUserProfileDTO {
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub phone: Option<String>
}

#[put("/me")]
pub async fn route(req: HttpRequest, body: web::Json<UpdateUserProfileDTO>) -> impl Responder {
    
    let user_profile = req.extensions().get::<UserProfile>().cloned().unwrap();

    match repo::update_user_profile_by_uuid(&user_profile.user.uuid, body.0).await {
        Ok(up) => ApiResponse::Success { status_code: StatusCode::OK, data: up },
        Err(e) => ApiResponse::Error(e)
    }
}