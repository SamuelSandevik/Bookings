use actix_http::StatusCode;
use actix_web::{post, web, Responder};
use crate::blueprints::users::repo::{ChallengeOtcRequest, challenge_otc};
use crate::utils::api_response::ApiResponse;
use crate::utils::hashing::tokenize_user_profile;

#[post("/challenge")]
pub async fn route(req: web::Json<ChallengeOtcRequest>) -> impl Responder {
    let user_result = challenge_otc(req.into_inner()).await;

    match user_result {
        Ok(up) => {
            match tokenize_user_profile(up.clone()) {
                Ok((token, exp)) => {
                    let response_data = serde_json::json!({
                        "token": token,
                        "expires_at": exp,
                        "user": up,
                    });
                    return ApiResponse::Success { status_code: StatusCode::ACCEPTED, data: response_data }
                },
                Err(e) => return ApiResponse::Error(e)
            }
        },
        Err(e) => return ApiResponse::Error(e)
    }
}