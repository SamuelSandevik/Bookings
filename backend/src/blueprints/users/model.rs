use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use uuid::Uuid;



#[derive(Serialize, Deserialize, FromRow, Clone, Debug)]
pub struct User {
    pub uuid: Uuid,
    pub profile_uuid: Uuid,
    #[serde(skip_serializing)]
    pub password_hash: Option<String>,
    pub super_user: bool,
    pub created_at: i64,
    pub updated_at: i64,
}



#[derive(Serialize, Deserialize, FromRow, Clone, Debug)]
pub struct Profile {
    pub uuid: Uuid,
    pub first_name: String,
    pub last_name: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
}
