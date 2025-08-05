use actix_web::{post, web, Responder};
use crate::{blueprints::users::repo::{challenge_lpwc, ChallengeLpwcRequest}, utils::api_response::ApiResponse};


#[post("/challenge")]
pub async fn route(req: web::Json<ChallengeLpwcRequest>) -> impl Responder {
    let res = challenge_lpwc(req.into_inner()).await;

    match res {
        Err(e) => ApiResponse::<()>::Error(e),
        Ok(up) => {
            todo!();
        }
    }
}