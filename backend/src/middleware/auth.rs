use std::env;
use actix_http::StatusCode;
use actix_web::{
    body::{BoxBody, MessageBody}, dev::{ServiceRequest, ServiceResponse}, http::header::HeaderValue, middleware::Next, Error, HttpMessage, ResponseError
};
use chrono::Utc;
use jsonwebtoken::{errors::Error as JWTError, DecodingKey, TokenData, Validation};

use crate::utils::{api_response::{ApiError, ErrorKind}, hashing::Claims};

pub async fn auth(req: ServiceRequest, next: Next<BoxBody>) -> Result<ServiceResponse<impl MessageBody>, Error> {
    let token: Option<&HeaderValue> = req.headers().get("Authorization"); 
    // Handle if Authorization token exists
    if token.is_none() {
        return Ok(req.into_response(
            (ApiError {status_code: StatusCode::UNAUTHORIZED, error: ErrorKind::Unauthorized, message: "No authorization token was provided".to_string()})
                .error_response()
                .map_into_boxed_body()
        ));
    }

    let jwt_secret = env::var("JWT_SECRET");
    if let Err(_) = &jwt_secret {
        return Ok(req.into_response(
            (ApiError {status_code: StatusCode::INTERNAL_SERVER_ERROR, error: ErrorKind::InternalError, message: "No JWT Secret is set".to_string()})
                .error_response()
                .map_into_boxed_body()
        ));
    }

    let claims: Result<TokenData<Claims>, JWTError> = jsonwebtoken::decode::<Claims>(
        token.unwrap().to_str().expect("ERROR: Could not decode token header value"), 
        &DecodingKey::from_secret(jwt_secret.unwrap().as_ref()), 
        &Validation::default()
    );

    if let Err(_) = &claims {
        return Ok(req.into_response(
            (ApiError {status_code: StatusCode::INTERNAL_SERVER_ERROR, error: ErrorKind::DecodingError, message: "Could not decode JWT claims data".to_string()})
                .error_response()
                .map_into_boxed_body()
        ));
    }

    let claims: Claims = claims.unwrap().claims.clone();
    if &claims.exp < &Utc::now().timestamp_millis() {
        return Ok(req.into_response(
            (ApiError {status_code: StatusCode::UNAUTHORIZED, error: ErrorKind::Unauthorized, message: "Provided token has expired".to_string()})
                .error_response()
                .map_into_boxed_body()
        ));
    }

    req.extensions_mut().insert(claims.user_profile);
    next.call(req).await
}
