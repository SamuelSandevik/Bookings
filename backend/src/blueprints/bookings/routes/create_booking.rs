use actix_http::StatusCode;
use actix_web::{post, web, HttpMessage, HttpRequest, Responder};

use crate::{blueprints::{bookings::repo::{self, NewBookingDTO}, users::repo::UserProfile}, utils::api_response::ApiResponse};


#[post("")]
pub async fn route(req: HttpRequest, body: web::Json<NewBookingDTO>) -> impl Responder {
    
    let user_profile = req.extensions().get::<UserProfile>().cloned().unwrap();


    match repo::create_booking(&user_profile, &body.0).await {
        Ok(up) => ApiResponse::Success { status_code: StatusCode::OK, data: up },
        Err(e) => ApiResponse::Error(e)
    }
}