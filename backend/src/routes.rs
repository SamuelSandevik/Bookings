use actix_web::{middleware::from_fn, web};
use crate::{blueprints::{/* docs::routes::docs_routes, */ docs::get_api_docs::get_api_docs, users::routes::{auth::auth_config, users_config}}, middleware::auth::auth};


pub fn routes_config(cfg: &mut web::ServiceConfig) {
    cfg.configure(auth_config);
    cfg.service(get_api_docs);
        
    cfg.service(web::scope("")
        .wrap(from_fn(auth))
            .configure(users_config)
        /*

            Configure more routes here

        */
    );
}
