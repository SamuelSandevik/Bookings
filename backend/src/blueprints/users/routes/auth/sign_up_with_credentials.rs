use actix_http::StatusCode;
use actix_web::{post, web, Responder};
use crate::blueprints::users::repo::{sign_up_with_credentials, SignUpCredentialsRequest};
use crate::utils::api_response::{ApiResponse};
use crate::utils::hashing::tokenize_user_profile;

#[post("/sign-up")]
pub async fn route(req: web::Json<SignUpCredentialsRequest>) -> impl Responder {
    let user_result = sign_up_with_credentials(req.into_inner()).await;
    match user_result {
        Ok(user) => {
            match tokenize_user_profile(user.clone()) {
                Ok((token, exp)) => {
                    let response_data = serde_json::json!({
                        "token": token,
                        "expires_at": exp,
                        "user": user,
                    });
                    ApiResponse::Success { status_code: StatusCode::CREATED, data: response_data }
                },
                Err(e) => return ApiResponse::Error(e)
            }
        },
        Err(e) => return ApiResponse::Error(e)
    }
}