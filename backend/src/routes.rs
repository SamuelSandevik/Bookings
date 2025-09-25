use actix_web::{middleware::from_fn, web};
use crate::{blueprints::{/* docs::routes::docs_routes, */ bookings::routes::bookings_config, bookable_slots::routes::bookable_slots_config, bookables::routes::bookable_config, docs::get_api_docs::get_api_docs, users::routes::{auth::auth_config, users_config}}, middleware::auth::auth};


pub fn routes_config(cfg: &mut web::ServiceConfig) {
    cfg.configure(auth_config);
    cfg.service(get_api_docs);
        
    cfg.service(web::scope("")
        .wrap(from_fn(auth))
            .configure(users_config)
            .configure(bookable_config)
            .configure(bookable_slots_config)
            .configure(bookings_config)
        
    );
}
