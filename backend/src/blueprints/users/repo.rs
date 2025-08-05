use actix_http::StatusCode;
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use uuid::Uuid;

use crate::{blueprints::users::{model::{Profile, User}, routes::update_my_user_profile::UpdateUserProfileDTO}, get_db_pool, utils::{api_response::{ApiError, ErrorKind}, generate_random_string::generate_random_string, hashing::Hasher}};

#[derive(Serialize, Deserialize, FromRow, Clone, Debug)]
pub struct UserProfile {
    pub user: User,
    pub profile: Profile,
}

#[derive(Deserialize)]
pub struct SignUpCredentialsRequest {
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub phone: Option<String>,
    pub password: String,
}

pub async fn sign_up_with_credentials(
    req: SignUpCredentialsRequest
) -> Result<UserProfile, ApiError> {
    let hash = Hasher::hash(&req.password)
        .map_err(|_| ApiError { status_code: StatusCode::INTERNAL_SERVER_ERROR, error: ErrorKind::InternalError, message: "Password could not be hashed".to_string() })?;

    let json_value: serde_json::Value = sqlx::query_scalar!(
        "SELECT create_user_and_profile_with_credentials($1, $2, $3, $4, $5)",
        req.first_name,
        req.last_name,
        req.email,
        hash,
        req.phone,
    )
    .fetch_one(get_db_pool())
    .await
    .map_err(|e| ApiError { status_code: StatusCode::INTERNAL_SERVER_ERROR, error: ErrorKind::DatabaseError, message: e.to_string() })?
    .ok_or_else(|| ApiError {status_code: StatusCode::INTERNAL_SERVER_ERROR, error:ErrorKind::InternalError, message: "User creation request execution failed".to_string()})?;

    let result: UserProfile = serde_json::from_value(json_value)
        .map_err(|e| ApiError { status_code: StatusCode::INTERNAL_SERVER_ERROR, error: ErrorKind::DeserializationError, message: e.to_string()  })?;

    Ok(result)
}

#[derive(Deserialize)]
pub struct SignInCredentialsRequest {
    pub email: String,
    pub password: String,
}

pub async fn sign_in_using_credentials(req: SignInCredentialsRequest) -> Result<UserProfile, ApiError> {
    let user_profile = get_user_profile_by_email(&req.email).await;

    match user_profile {
        Ok(usr) => {
            if let Some(hash) = &usr.user.password_hash {
                if Hasher::verify(&req.password, hash).is_err() {
                    return Err(ApiError { status_code: StatusCode::BAD_REQUEST, error: ErrorKind::ValidationError, message: "Email or password does not match".to_string() } );
                }
                Ok(usr)
            } else {
                Err(ApiError { status_code: StatusCode::NOT_FOUND, error: ErrorKind::NotFound, message: "User was not found".to_string() })
            }
        },
        Err(e) => Err(e)
    }
}

pub async fn get_user_profile_by_email(email: &str) -> Result<UserProfile, ApiError> {
    let json = sqlx::query_scalar!("SELECT json_build_object('user', u.*, 'profile', p.*) FROM users u JOIN profiles p ON u.profile_uuid = p.uuid WHERE p.email = $1", email)
        .fetch_one(get_db_pool())
        .await
        .map_err(|e| ApiError {status_code: StatusCode::NOT_FOUND, error: ErrorKind::NotFound, message: e.to_string()})?;

    if let None = &json {
        return Err(ApiError { status_code: StatusCode::NOT_FOUND, error: ErrorKind::NotFound, message: "No user was found".to_string() })
    }

    let json = serde_json::from_value::<UserProfile>(json.unwrap()).expect("ERROR: DATABASE USER_PROFILE DESERIALIZATION FAILED");

    Ok(json)
}

pub async fn update_user_profile_by_uuid(uuid: &Uuid, profile: UpdateUserProfileDTO) -> Result<UserProfile, ApiError> {
    let json = sqlx::query_scalar!(
        "SELECT update_user_profile($1, $2, $3, $4, $5)", 
        uuid, 
        profile.first_name, 
        profile.last_name, 
        profile.email, 
        profile.phone
        )
        .fetch_one(get_db_pool())
        .await
        .map_err(|e| ApiError {status_code: StatusCode::INTERNAL_SERVER_ERROR, error: ErrorKind::InternalError, message: e.to_string()})?;

    if let None = &json {
        return Err(ApiError { status_code: StatusCode::INTERNAL_SERVER_ERROR, error: ErrorKind::InternalError, message: "Creation failed".to_string() })
    }

    let json = serde_json::from_value::<UserProfile>(json.unwrap()).expect("ERROR: DATABASE USER_PROFILE DESERIALIZATION FAILED");

    Ok(json)
}

#[derive(Deserialize)]
pub struct ChallengeOtcRequest {
    pub email: String,
    pub otc: String,
}

pub async fn challenge_otc(req: ChallengeOtcRequest) -> Result<UserProfile, ApiError> {

    #[derive(FromRow)]
    struct Otc {
        otc: String,
        user_uuid: Uuid,
    }

    let otc: Result<Option<Otc>, sqlx::Error> = sqlx::query_as!(Otc, "SELECT o.user_uuid, o.otc FROM otcs o JOIN users u ON o.user_uuid = u.uuid JOIN profiles p ON p.uuid = u.profile_uuid WHERE p.email = $1", req.email)
        .fetch_optional(get_db_pool())
        .await;

    match otc {
        Ok(otc_opt) => { match otc_opt {
            Some(otc) => {
                if Hasher::verify(&req.otc, &otc.otc).is_err() {
                    return Err(ApiError { status_code: StatusCode::BAD_REQUEST, error: ErrorKind::ValidationError, message: "Email or password does not match".to_string() } );
                }
                let user_profile = get_user_profile_by_email(&req.email).await;
                
                let _ = sqlx::query!("DELETE FROM otcs WHERE user_uuid = $1", otc.user_uuid).execute(get_db_pool()).await;


                return user_profile
            },
            None => return Err(ApiError {status_code: StatusCode::INTERNAL_SERVER_ERROR, error: ErrorKind::DatabaseError, message: "No otc was found".to_string()})
        }},
        Err(e) => return Err(ApiError {status_code: StatusCode::INTERNAL_SERVER_ERROR, error: ErrorKind::DatabaseError, message: e.to_string()})
    }
}


#[derive(Deserialize)]
pub struct ChallengeLpwcRequest {
    pub email: String,
    pub new_password: String,
    pub lpwc: String,
}

pub async fn challenge_lpwc(req: ChallengeLpwcRequest) -> Result<(), ApiError> {

    #[derive(FromRow)]
    struct Lpwc {
        lpwc: String,
        user_uuid: Uuid,
    }

    let lpwc: Result<Option<Lpwc>, sqlx::Error> = sqlx::query_as!(Lpwc, "SELECT l.user_uuid, l.lpwc FROM lpwcs l JOIN users u ON l.user_uuid = u.uuid JOIN profiles p ON p.uuid = u.profile_uuid WHERE p.email = $1", req.email)
        .fetch_optional(get_db_pool())
        .await;

    match lpwc {
        Ok(lpwc_opt) => { match lpwc_opt {
            Some(lpwc) => {
                if Hasher::verify(&req.lpwc, &lpwc.lpwc).is_err() {
                    return Err(ApiError { status_code: StatusCode::BAD_REQUEST, error: ErrorKind::ValidationError, message: "Email or password does not match".to_string() } );
                }
                
                let new_hash = Hasher::hash(&req.new_password);
                if new_hash.is_err() {
                    return Err(ApiError { status_code: StatusCode::INTERNAL_SERVER_ERROR, error: ErrorKind::InternalError, message: "Could not scramble new password before continuing".to_string() })
                }

                let _ = sqlx::query!("UPDATE users SET password_hash = $1 WHERE uuid = $2", new_hash.unwrap(), lpwc.user_uuid).execute(get_db_pool()).await;
                let _ = sqlx::query!("DELETE FROM lpwcs WHERE user_uuid = $1", lpwc.user_uuid).execute(get_db_pool()).await;
                
                Ok(())

            },
            None => return Err(ApiError {status_code: StatusCode::INTERNAL_SERVER_ERROR, error: ErrorKind::DatabaseError, message: "No lpwc was found".to_string()})
        }},
        Err(e) => return Err(ApiError {status_code: StatusCode::INTERNAL_SERVER_ERROR, error: ErrorKind::DatabaseError, message: e.to_string()})
    }
}


#[derive(Deserialize)]
pub struct SignUpOtcRequest {
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub phone: Option<String>,
}

pub async fn sign_up_with_otc(req: SignUpOtcRequest) -> Result<ValidUntilResponse, ApiError> {
    let otc = generate_random_string(9);
    
    #[derive(FromRow)]
    struct Res {
        valid_until: Option<i64>,
    }

    let hashed_otc = Hasher::hash(&otc);
    if hashed_otc.is_err() {
        return Err(ApiError {status_code: StatusCode::INTERNAL_SERVER_ERROR, error: ErrorKind::InternalError, message: "Could not scramble otc before continuing".to_string()});
    }

    let res: Result<Res, sqlx::Error> = sqlx::query_as!(Res,"SELECT create_user_and_profile_with_otc($1, $2, $3, $4, $5) as valid_until", req.first_name, req.last_name, req.email, hashed_otc.unwrap(), req.phone)
        .fetch_one(get_db_pool())
        .await;

    /* Configure sending otc with email or phone below */

    match res {
        Err(e) => return Err(ApiError { status_code: StatusCode::INTERNAL_SERVER_ERROR, error: ErrorKind::DatabaseError, message: e.to_string() }),
        Ok(res) => Ok(ValidUntilResponse { valid_until: res.valid_until.unwrap_or(0) })
    }
}


#[derive(Deserialize)]
pub struct SignInOtcRequest {
    email: String
}

#[derive(Serialize)]
pub struct ValidUntilResponse {
    valid_until: i64,
}

pub async fn sign_in_using_otc(req: SignInOtcRequest) -> Result<ValidUntilResponse, ApiError> {
    let otc = generate_random_string(9);

    #[derive(FromRow, Clone)]
    struct Res {
        valid_until: Option<i64>,
    }

    let hashed_otc = Hasher::hash(&otc);
    if hashed_otc.is_err() {
        return Err(ApiError {status_code: StatusCode::INTERNAL_SERVER_ERROR, error: ErrorKind::InternalError, message: "Could not scramble otc before continuing".to_string()});
    }

    let res: Result<Res, sqlx::Error> = sqlx::query_as!(Res, "SELECT create_otc_with_email($1, $2) as valid_until", req.email, hashed_otc.unwrap())
        .fetch_one(get_db_pool())
        .await;

    /* Configure sending otc with email or phone here */

    match res {
        Err(e) => return Err(ApiError { status_code: StatusCode::INTERNAL_SERVER_ERROR, error: ErrorKind::DatabaseError, message: e.to_string() }),
        Ok(res) => Ok(ValidUntilResponse { valid_until: res.valid_until.unwrap_or(0) })
    }
}


#[derive(Deserialize)]
pub struct CreateLpwcRequest {
    email: String,
}

pub async fn create_lpwc(req: CreateLpwcRequest) -> Result<ValidUntilResponse, ApiError> {
    let lpwc = generate_random_string(9);
    
    #[derive(FromRow, Clone)]
    struct Res {
        valid_until: Option<i64>,
    }

    let hashed_lpwc = Hasher::hash(&lpwc);
    if hashed_lpwc.is_err() {
        return Err(ApiError {status_code: StatusCode::INTERNAL_SERVER_ERROR, error: ErrorKind::InternalError, message: "Could not scramble lpwc before continuing".to_string()});
    }

    let res: Result<Res, sqlx::Error> = sqlx::query_as!(Res, "SELECT create_lpwc_with_email($1, $2) as valid_until", req.email, hashed_lpwc.unwrap())
        .fetch_one(get_db_pool())
        .await;

    match res {
        Err(e) => return Err(ApiError { status_code: StatusCode::INTERNAL_SERVER_ERROR, error: ErrorKind::DatabaseError, message: e.to_string() }),
        Ok(res) => Ok(ValidUntilResponse { valid_until: res.valid_until.unwrap_or(0) })
    }
}

