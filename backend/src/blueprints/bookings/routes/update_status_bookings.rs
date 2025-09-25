use actix_http::StatusCode;
use actix_web::{put, web, HttpMessage, HttpRequest, Responder};
use uuid::Uuid;

use serde::Deserialize;

#[derive(Deserialize)]
pub struct UpdateBookingStatusDTO {
    pub status: i16,
}


use crate::{blueprints::{bookings::repo, users::repo::UserProfile}, utils::api_response::ApiResponse};


#[put("/{booking_uuid}")]
pub async fn route(
    req: HttpRequest,
    path: web::Path<Uuid>, 
    body: web::Json<UpdateBookingStatusDTO>, 
) -> impl Responder {
    let user_profile = req.extensions().get::<UserProfile>().cloned().unwrap();
    let booking_uuid = path.into_inner(); 
    let status = body.into_inner().status;

    let booking_uuid_ref: &Uuid = &booking_uuid;

    match repo::update_status_bookings(&user_profile, status, booking_uuid_ref).await {
        Ok(up) => ApiResponse::Success {
            status_code: StatusCode::OK,
            data: up,
        },
        Err(e) => ApiResponse::Error(e),
    }
}
