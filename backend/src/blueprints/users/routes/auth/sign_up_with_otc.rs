use actix_http::StatusCode;
use actix_web::{post, web, Responder};
use crate::blueprints::users::repo::{sign_up_with_otc, SignUpOtcRequest};
use crate::utils::api_response::{ApiResponse};

#[post("/sign-up")]
pub async fn route(req: web::Json<SignUpOtcRequest>) -> impl Responder {
    let res = sign_up_with_otc(req.into_inner()).await;
    
    if let Err(e) = res {
        return Err(e);
    }

    Ok(ApiResponse::Success { status_code: StatusCode::CREATED, data: res.unwrap() })
}