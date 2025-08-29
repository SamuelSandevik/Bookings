use actix_web::web;

pub mod create_bookable_slot;
pub mod get_bookable_slots;
pub mod get_bookable_slot;
pub mod update_bookable_slot;
pub mod delete_bookable_slot;

pub fn bookable_slots_config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/bookable-slots")
            .service(create_bookable_slot::route)
            .service(get_bookable_slots::route)
            .service(get_bookable_slot::route)
            .service(update_bookable_slot::route)
            .service(delete_bookable_slot::route)
    );
}