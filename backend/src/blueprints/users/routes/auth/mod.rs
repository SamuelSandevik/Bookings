use actix_web::web;

pub mod sign_in_using_credentials;
pub mod sign_up_with_credentials;
pub mod sign_in_using_otc;
pub mod sign_up_with_otc;
pub mod challenge_otc;
pub mod create_lpwc;
pub mod challenge_lpwc;

pub fn auth_config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/auth")
            .service(
                web::scope("/credentials")
                    .service(sign_in_using_credentials::route)
                    .service(sign_up_with_credentials::route)
            )
            .service(
                web::scope("/otc")
                    .service(sign_in_using_otc::route)
                    .service(sign_up_with_otc::route)
                    .service(challenge_otc::route)
                    
            )
            .service(
                web::scope("/lpwc")
                    .service(create_lpwc::route)
                    .service(challenge_lpwc::route)
                    
            )
    );
}