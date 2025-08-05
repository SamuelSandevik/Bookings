use core::fmt;

use actix_web::{body::BoxBody, http::StatusCode, HttpResponse, Responder, ResponseError};
use serde::Serialize;

#[derive(Serialize, Debug)]
#[serde(untagged)]
pub enum ApiResponse<T: Serialize> {
    Success {
        #[serde(skip_serializing)]
        status_code: StatusCode,
        data: T,
    },
    Error(ApiError),
}

#[derive(Serialize, Debug)]
pub struct ApiError {
    #[serde(skip_serializing)]
    pub status_code: StatusCode,
    pub error: ErrorKind,
    pub message: String,
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum ErrorKind {
    NotFound,
    Unauthorized,
    InternalError,
    ValidationError,
    DatabaseError,
    DeserializationError,
    TokenizationError,
    EnvError,
    DecodingError

}

impl<T: Serialize> Responder for ApiResponse<T> {
    type Body = BoxBody;

    fn respond_to(self, _: &actix_web::HttpRequest) -> HttpResponse<Self::Body> {
        match self {
            ApiResponse::Success { status_code, data } => {
                HttpResponse::build(status_code).json(serde_json::json!({ "data": data }))
            }
            ApiResponse::Error(err) => {
                HttpResponse::build(err.status_code).json(err)
            }
        }
    }
}

impl fmt::Display for ApiError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.message)
    }
}

impl ResponseError for ApiError {
    fn error_response(&self) -> HttpResponse {
        HttpResponse::build(self.status_code).json(self)
    }
}