mod routes;
mod utils;
mod middleware;
mod blueprints;


use std::env;
use actix_cors::Cors;
use actix_web::{App, HttpServer};
use sqlx::{postgres::PgPoolOptions, PgPool};
use std::sync::OnceLock;
use log::{info, error};

use crate::{routes::routes_config, utils::logger::init_logger};

static DB_POOL: OnceLock<PgPool> = OnceLock::new();

pub async fn init_db_pool() {
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL is not set");
    let pool = PgPoolOptions::new()
        .max_connections(10)
        .connect(&database_url)
        .await
        .expect("Failed to create pool");
    
    DB_POOL.set(pool).expect("Failed to set DB_POOL");
}

pub fn get_db_pool() -> &'static PgPool {
    DB_POOL.get().expect("DB_POOL is not initialized")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    init_logger();
    info!("Initializing application...");
    
    dotenvy::dotenv().ok();
    info!("Environment variables loaded");
    
    info!("Initializing database pool...");
    init_db_pool().await;
    info!("Database pool initialized successfully");
    
    let backend_host = env::var("BACKEND_HOST").expect("ERROR: BACKEND_HOST must be set");
    let backend_port: u16 = env::var("BACKEND_PORT").expect("ERROR: BACKEND_PORT must be set").parse::<u16>().expect("ERROR: BACKEND_PORT could not be parsed as a u16");
    
    info!("Running database migrations...");
    match sqlx::migrate!().run(get_db_pool()).await {
        Ok(_) => info!("Database migrations completed successfully"),
        Err(err) => {
            error!("Migration Error: {}", err);
            panic!("Migration Error: {}", err);
        }
    };

    info!("Starting backend server on {}:{}", backend_host, backend_port);
    HttpServer::new(move||{
        App::new()
            .wrap(Cors::permissive())
            .configure(routes_config)
    })
    .bind((backend_host, backend_port))?
    .run().await
}
