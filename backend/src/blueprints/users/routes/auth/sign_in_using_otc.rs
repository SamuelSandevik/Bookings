use actix_http::StatusCode;
use actix_web::{post, web, Responder};
use crate::blueprints::users::repo::{SignInOtcRequest, sign_in_using_otc};
use crate::utils::api_response::ApiResponse;

#[post("/sign-in")]
pub async fn route(req: web::Json<SignInOtcRequest>) -> impl Responder {
    let res = sign_in_using_otc(req.into_inner()).await;
    
    if let Err(e) = res {
        return Err(e);
    }

    Ok(ApiResponse::Success { status_code: StatusCode::OK, data: res.unwrap() })
    
}