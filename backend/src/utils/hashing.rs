
use std::env;

use actix_http::StatusCode;
use chrono::{Days, Utc};
use jsonwebtoken::{EncodingKey, Header};
use serde::{Deserialize, Serialize};
use pbkdf2::{
    password_hash::{
        self, rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString
    },
    Pbkdf2
};

use crate::{blueprints::users::{repo::UserProfile}, utils::api_response::{ApiError, ErrorKind}};


#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Claims {
    pub user_profile: UserProfile,
    pub exp: i64,
}
pub struct Hasher;

impl Hasher {

    pub fn hash<'a>(value: &'a str) -> Result<String, password_hash::Error> {
        let salt = SaltString::generate(&mut OsRng);
        let hash = Pbkdf2.hash_password(value.as_bytes(), &salt);
        if let Err(err) = hash {
            return Err(err)
        }
        return Ok(hash.unwrap().to_string())
    }

    pub fn verify(value: &str, hashed_value: &str) -> Result<(), password_hash::Error> {
        let parsed_hash = PasswordHash::new(&hashed_value);
        if let Err(err) = parsed_hash {
            return Err(err);
        }
        Pbkdf2::verify_password(&Pbkdf2, value.as_bytes(), &parsed_hash.unwrap())
    }
}

pub fn tokenize_user_profile(up: UserProfile) -> Result<(String, i64), ApiError> {
    let jwt_secret = env::var("JWT_SECRET")
        .map_err(|_| ApiError { status_code: StatusCode::INTERNAL_SERVER_ERROR, error: ErrorKind::EnvError, message: "Enviorment variable for JWT_SECRET was not found".to_string() })?;
    
    let claims: Claims = Claims { user_profile: up, exp: Utc::now().checked_add_days(Days::new(14)).unwrap().timestamp_millis() };
    let token = jsonwebtoken::encode(&Header::default(), &claims, &EncodingKey::from_secret(&jwt_secret.as_ref()))
        .map_err(|_| ApiError { status_code: StatusCode::INTERNAL_SERVER_ERROR, error: ErrorKind::TokenizationError, message: "Could not create token".to_string() })?;
    
    Ok((token, claims.exp))
}