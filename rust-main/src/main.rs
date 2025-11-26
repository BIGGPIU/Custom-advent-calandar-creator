mod database;
mod reviewme;
mod events;
mod misc;

use axum::http::HeaderValue;
use reqwest::{header::ACCESS_CONTROL_ALLOW_ORIGIN, Method};
use tower_http::{cors::{Any, CorsLayer}, set_header::SetResponseHeaderLayer, trace::TraceLayer};

use crate::misc::Fun;


#[derive(Clone)]
pub struct AppState {
    pool: sqlx::Pool<sqlx::Sqlite>
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();
    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST])
        .allow_origin(Any)
    .allow_headers(Any);


    let pool = database::LocalSqlite::make_new_database_connection().await;

    let state: AppState = AppState { pool };

    let app = axum::Router::new()
        .route("/", axum::routing::get(Fun::random_songs_i_want_to_gas()))
        .route("/add-event/unscheduled", axum::routing::post(events::Events::add_event_unscheduled))
        .route("/add-event/scheduled", axum::routing::post(events::Events::add_event_scheduled))
        .route("/get-all-events", axum::routing::get(events::Events::get_all_events))
    .with_state(state)
    .layer(
            SetResponseHeaderLayer::if_not_present(
                ACCESS_CONTROL_ALLOW_ORIGIN,
                HeaderValue::from_static("*"),
            )
        )
    .layer(cors)
    .layer(TraceLayer::new_for_http());

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}



