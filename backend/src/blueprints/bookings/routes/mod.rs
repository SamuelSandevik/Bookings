use actix_web::web;

pub mod create_booking;
pub mod get_bookings;
pub mod get_booking;
pub mod update_status_bookings;
pub mod delete_booking;

pub fn bookings_config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/bookings")
            .service(create_booking::route)
            .service(get_bookings::route)
            .service(get_booking::route)
            .service(update_status_bookings::route)
            .service(delete_booking::route)
    );
}