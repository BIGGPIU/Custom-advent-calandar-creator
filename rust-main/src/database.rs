
use sqlx::{Connection, SqlitePool, sqlite::{self, SqliteConnectOptions}};

use crate::reviewme::Constants;

pub struct LocalSqlite {

}



impl LocalSqlite {



    pub async fn make_new_database_connection() -> sqlx::Pool<sqlx::Sqlite> {
        // let options = SqliteConnectOptions::new()
        //     .filenam

        let consts = Constants::default();

        let pool = match SqlitePool::connect(&consts.sqlite_path).await {
            Ok(x) => x,
            Err(_) => {panic!("unable to get pool for database. is the file path wrong?")},
        };


        return pool
    }

}