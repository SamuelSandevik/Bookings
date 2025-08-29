use actix_http::StatusCode;
use actix_web::{put, web, HttpMessage, HttpRequest, Responder};
use uuid::Uuid;

use crate::{blueprints::{bookables::repo::{self, NewBookableDTO}, users::repo::UserProfile}, utils::api_response::ApiResponse};

#[put("/{bookable_uuid}")]
pub async fn route(req: HttpRequest, path: web::Path<(Uuid,)>, body: web::Json<NewBookableDTO>) -> impl Responder {
    
    let user_profile = req.extensions().get::<UserProfile>().cloned().unwrap();


    match repo::update_bookable(&user_profile, &path.0, &body.0).await {
        Ok(up) => ApiResponse::Success { status_code: StatusCode::OK, data: up },
        Err(e) => ApiResponse::Error(e)
    }
}