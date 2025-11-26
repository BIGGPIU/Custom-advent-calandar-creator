use axum::extract::State;
use axum::extract;
use base64::Engine;
use base64::prelude::BASE64_STANDARD;
use json::object;
use sqlx::Sqlite;
use serde::Deserialize;
use sqlx::sqlite::SqliteRow;
use sqlx::Row;


use crate::AppState;


pub struct Events {

}



#[derive(Deserialize)]
#[derive(Debug)]
pub struct AddEventUnscheduled {
    event:String,
    username:String
}


#[derive(Deserialize)]
#[derive(Debug)]
pub struct AddEventScheduled {
    event:String,
    date:i32,
    username:String
}


impl Events {


    
    pub async fn add_event_unscheduled(State(state): State<AppState>, extract::Json(payload): extract::Json<AddEventUnscheduled>) -> String {
        
        
        
        let b64_encoded_event_name = BASE64_STANDARD.encode(payload.event);
        
        let x = match sqlx::query::<Sqlite>
        ("INSERT INTO Events (\"EventNameb64\", \"Username\") VALUES ($1,$2)")
        .bind(b64_encoded_event_name)
        .bind(payload.username)
        .execute(&state.pool).await {
            Ok(x) => x.rows_affected(),
            Err(_) => 0,
        };

        if x == 0 {
            return object! {
                code:0,
                message:"Event not added: Did not change any rows"
            }.dump()
        }
        else {
            return object! {
                code:1,
                message:"successful"
            }.dump()
        }
        

    }



    pub async fn add_event_scheduled(State(state): State<AppState>, extract::Json(payload): extract::Json<AddEventScheduled>) -> String {


        if payload.date > 31 || 0 >= payload.date {
            return object! {
                code:0,
                message:"invalid date."
            }.dump()
        }

        let b64_encoded_event_name = BASE64_STANDARD.encode(payload.event);

        let x = sqlx::query::<Sqlite>
        ("SELECT * FROM LockedDates WHERE Date = $1")
        .bind(&payload.date as &i32)
        .fetch_all(&state.pool).await.expect("");

        if x.len() != 0 {
            return object! {
                code:0,
                message:"Event Already Scheduled on that date"
            }.dump()
        }

        

        let _ = sqlx::query::<Sqlite>
        ("INSERT INTO LockedDates (\"Date\", \"EventNameb64\", \"Username\")  VALUES ( $1 , $2 , $3 )")
        .bind(payload.date as i32)
        .bind(&b64_encoded_event_name)
        .bind(&payload.username)
        .execute(&state.pool).await;
        




        return object! {
            code:1,
            message:"successful"
        }.dump()
    }




    pub async fn get_all_events(State(state): State<AppState>) -> String {



        let all_events_unscheduled: Vec<SqliteRow> = sqlx::query::<Sqlite>
        ("SELECT * FROM Events")
        .fetch_all(&state.pool).await.expect("if this doesnt work I believe it may be time to kill myself");

        let mut json_to_return = object! {
            "unscheduled_events": [],
            "scheduled_events": []
        };


        for i in all_events_unscheduled {

            let event_name:String = match  i.try_get("EventNameb64") {
                Ok(x) => x,
                Err(e) => {println!("{}",e.to_string()); panic!()}
            };
            let suggested_by:String = i.try_get("Username").expect("ditto of the message on line 124");

            json_to_return["unscheduled_events"].push(
                object! {
                    "EventName":event_name,
                    "SuggestedBy":suggested_by
                }
            ).expect("oshow");
        }



        let all_events_scheduled = sqlx::query::<Sqlite>
        ("SELECT * FROM LockedDates ORDER BY Date")
        .fetch_all(&state.pool).await.expect("this should work no reason why it shouldnt");

        for i in all_events_scheduled {
            let event_name:String = i.try_get("EventNameb64").expect("If this doesnt work then please call XXX-XXX-XXXX and I will kms");
            let suggested_by:String = i.try_get("Username").expect("ditto of the message on line 124");
            let date:i32 = i.try_get("Date").expect("");


            json_to_return["scheduled_events"].push(
                object! {
                    "EventName":event_name,
                    "SuggestedBy":suggested_by,
                    "Date":date
                }
            ).expect("oshow");
        }

        json_to_return.insert("unscheduled_events_length", json_to_return["unscheduled_events"].len()).expect("this should work");

        return json_to_return.dump()
    }
}