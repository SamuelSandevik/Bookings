use actix_web::web;

pub mod create_bookable;
pub mod get_bookables;
pub mod get_bookable;
pub mod update_bookable;
pub mod delete_bookable;

pub fn bookable_config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/bookables")
            .service(create_bookable::route)
            .service(get_bookables::route)
            .service(update_bookable::route)
            .service(delete_bookable::route)
    );
}