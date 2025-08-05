use actix_http::StatusCode;
use actix_web::{get, HttpMessage, HttpRequest, Responder};
use crate::{blueprints::users::repo::{self, UserProfile}, utils::api_response::{ApiError, ApiResponse, ErrorKind}};

#[get("/me")]
pub async fn route(req: HttpRequest) -> impl Responder {
    
    let user_profile = req.extensions().get::<UserProfile>().cloned().unwrap();

    if let None = &user_profile.profile.email {
        return ApiResponse::Error(ApiError { status_code: StatusCode::NOT_FOUND, error: ErrorKind::NotFound, message: "You do not have an email registered on to your account".to_string() })
    }

    match repo::get_user_profile_by_email(&user_profile.profile.email.unwrap()).await {
        Ok(up) => ApiResponse::Success { status_code: StatusCode::OK, data: up },
        Err(e) => ApiResponse::Error(e)
    }
}