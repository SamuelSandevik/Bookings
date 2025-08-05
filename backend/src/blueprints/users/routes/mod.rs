pub mod auth;
mod get_my_user_profile;
pub mod update_my_user_profile;
use actix_web::web;


pub fn users_config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/users")
            .service(get_my_user_profile::route)
            .service(update_my_user_profile::route)
    );
}