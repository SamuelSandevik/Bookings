use actix_http::StatusCode;
use actix_web::{post, web, HttpMessage, HttpRequest, Responder};

use crate::{blueprints::{bookables::repo::{self, NewBookableDTO}, users::repo::UserProfile}, utils::api_response::ApiResponse};

#[post("")]
pub async fn route(req: HttpRequest, body: web::Json<NewBookableDTO>) -> impl Responder {
    
    let user_profile = req.extensions().get::<UserProfile>().cloned().unwrap();

    println!("user: {:?}", user_profile.user.uuid);

    match repo::create_bookable(&user_profile, &body.0).await {
        Ok(up) => ApiResponse::Success { status_code: StatusCode::OK, data: up },
        Err(e) => ApiResponse::Error(e)
    }
}