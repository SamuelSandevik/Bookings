use actix_http::StatusCode;
use actix_web::{post, web, Responder};
use crate::{blueprints::users::repo::{create_lpwc, CreateLpwcRequest}, utils::api_response::ApiResponse};


#[post("")]
pub async fn route(req: web::Json<CreateLpwcRequest>) -> impl Responder {
    let res = create_lpwc(req.into_inner()).await;

    if let Err(e) = res {
        return Err(e);
    }

    Ok(ApiResponse::Success { status_code: StatusCode::OK, data: res.unwrap() })
}