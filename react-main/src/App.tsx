
import { useState } from 'react'
// import './App.css'
import "tailwindcss"
import seedrandom, { xor128 } from 'seedrandom'

import { useQuery } from "@tanstack/react-query"


interface Event {
  event_name:String,
  event_date:String // 0 if unscheduled 1-29 if scheduled 
}


function App() {
  // const [count, setCount] = useState(0)
  const [ShowCalandar, SetShowCalandar] = useState(true)
  const [EventsToSend, SetEventsToSend] = useState<Event[]>([])
  const [InProgressEvent, SetInProgressEvent] = useState("")
  const [UserName, SetUserName] = useState("")
  const [TempUserName,SetTempUserName] = useState("")
  const [ScheduledDate,SetScheduledDate] = useState("")
  const [PreviouslyGeneratedKey,SetPreviouslyGeneratedKey] = useState("")


  let display = "";
  let anti_display = "";
  let my_element = <></>;

  if (UserName != "") {
    display = "hidden"
    my_element = (
      <div className='w-full float-left mt-2'>
        <div className='w-fit float-left '>
          Hello, {UserName}
        </div>
      </div>
    )
  }

  if (display == "hidden") {
    anti_display = ""
  }
  else {
    anti_display = "hidden"
  }

  if (ShowCalandar) {

    let key = window.crypto.randomUUID().split("-")[0];

    // console.log(key);
    let my_element_2;
    if (PreviouslyGeneratedKey == "") {
      my_element_2 = <GetAllEventsAndMakeCalandar seed_key={key}></GetAllEventsAndMakeCalandar>
    }
    else {
      my_element_2 = <GetAllEventsAndMakeCalandar seed_key={PreviouslyGeneratedKey}></GetAllEventsAndMakeCalandar>
    }


    return (
    <div className='w-full h-full'>
      <button className='float-left w-full ' onClick={() => {SetShowCalandar(false)}}>Add events</button>
      <div>Your key is <code className='bg-gray-950'>{key}</code><br />copy it if you want to come back later</div>
      <div className='w-full h-fit float-left'>
        <div className='float-left w-fit mr-3'>paste your old key to override the current one </div>
        <input className='float-left border-2  w-1/4 border-gray-700 bg-gray-800' placeholder={key} type="text" onChange={(e) => {SetPreviouslyGeneratedKey(e.target.value)}} />
      </div>
      <div className='h-2 float-left w-full '></div>
      {my_element_2}
      <div className='w-4/7 float-left h-fit pl-2'>all the events for the upcoming days are <a href="https://en.wikipedia.org/wiki/Base64">Base64 Encoded.</a> If you desperately want to see what is happening on that date you can decode the event name with <a href="https://www.base64decode.org/">tools like this.</a></div>
    </div>
    )
  }
  else {
    return (
      <div className='w-full h-full' >
        <button className='float-left w-full' onClick={() => {SetShowCalandar(true)}}>Go to Calandar</button>
        
        {my_element}

        <div className={'w-full float-left mt-2 ' + display}>
          <div className='w-fit float-left mr-2' >Please enter your name: (hit enter to submit) </div>
          <input type="text" className='border-2 float-left w-1/2 border-gray-700 bg-gray-800' onKeyDown={
            (e) => {
              if (e.key == "Enter") {
                SetUserName(TempUserName)
              } 
            }
          }
          
          onChange={(e) => {SetTempUserName(e.target.value)}}
          />
        </div>
        
        <div className='w-full float-left mt-2'>
          <div className='float-left w-fit  '>Add Event:</div>
          <input className='border-2 float-left w-1/4 border-gray-700 bg-gray-800' type="text" value={InProgressEvent} onKeyDown={(e) => { if (e.key == "Enter") {SetEventsToSend(EventsToSend.concat([{event_name:InProgressEvent,event_date:ScheduledDate}]));SetInProgressEvent("");} }} onChange={(e) => {SetInProgressEvent(e.target.value); }}/>
          <div className='float-left w-fit ml-2 mr-2'>type a date or type 0 to not specify a date</div>
          <input type="text" className='border-2 float-left w-1/4 border-gray-700 bg-gray-800' placeholder='0' onChange={(e) => {
            try {
              SetScheduledDate(e.target.value)
            } catch (e) {
              return;
            }
          }}/>
          <button type="button" className='float-left rounded-md ml-2' onClick={() => {
            // console.log(InProgressEvent)
            SetEventsToSend(EventsToSend.concat([{event_name:InProgressEvent,event_date:ScheduledDate}]));
            SetInProgressEvent("");
            // console.log(EventsToSend)
            }}>Add event</button>
        </div>
        {/* <button  onClick={() => {console.log(EventsToSend)}}>print events to send</button> */}
        <div>
          <ul className='list-disc'>
            {EventsToSend.map((irlEvent) => {
              if (irlEvent.event_date == "0") {
                return <li className='list-disc'>- {irlEvent.event_name}</li>
              }
              else {
                return <li className='list-disc'>- {irlEvent.event_name} on Dec {irlEvent.event_date.toString()}</li>
              }
            })}
          </ul>
          <button className={anti_display} onClick={() => {submit_events(EventsToSend,SetEventsToSend,UserName)}}>Submit Events</button>
        </div>
      </div>
    )
  }

  
}


function submit_events(events_to_send:Event[],events_to_send_setter:any,username:String) {


  events_to_send.forEach((x) => {
    if (x.event_date == "0") {
      let body = JSON.stringify({ 
        "event":x.event_name,
        "username":username
      })
      
      fetch("http://127.0.0.1:3000/add-event/unscheduled", {method:'POST',
        body:body,
        headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Methods": "*",
                  "Access-Control-Allow-Origin": "*"
              }
      })
    }
    else {
      let body = JSON.stringify({
        event:x.event_name,
        date:Number(x.event_date),
        username:username
      })

      fetch("http://127.0.0.1:3000/add-event/scheduled", {method:'POST',
        body:body,
        headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Methods": "*",
                  "Access-Control-Allow-Origin": "*"
              }
      })
    }
  })
  events_to_send_setter([])
}

type GetAllEventsAndMakeCalandarProps = {
  seed_key:String
}

interface EventCalandarStruct  {
  event_name:String,
  event_date:Number,
  suggested_by:String
}



function GetAllEventsAndMakeCalandar(props:GetAllEventsAndMakeCalandarProps) {

  let rng = seedrandom(props.seed_key.toString())


  const {isPending, isError, data, error} = useQuery({queryKey: ["make_calandar"], queryFn: async() => {
        
        const url = `http://127.0.0.1:3000/get-all-events`
        const x = (await fetch(url).then()).json().then((z) => { return z;});
        return x;
    }})
    if (isError) {
        console.log(error.message)
        return <></>
    }
    else if (isPending) {
        return (
            <></>
        )
    }
    else {
      let i = 0;
      let dates: EventCalandarStruct[] = Array(28).fill({event_name:"",event_date:-1,suggested_by:""})
      
      while (true) {
        if (data["scheduled_events"][i] == undefined) {
          break;
        }
        if (i == 1024) {
          // so I dont crash the page by being the worst programmer oat
          break;
        }

        dates[data["scheduled_events"][i]["Date"]] = {
          event_name: data["scheduled_events"][i]["EventName"],
          event_date: data["scheduled_events"][i]["Date"],
          suggested_by: data["scheduled_events"][i]["SuggestedBy"]
        }

        i++;
      }

      let unscheduled_events_len = data["unscheduled_events_length"];

      let all_unscheduled_cloned = [];
      for (let index = 0; index < unscheduled_events_len; index++) {
        const element = data["unscheduled_events"][index];
        all_unscheduled_cloned.push(element)
        
      }

      // dates.forEach((x) => { 
      //   if (x.event_name == "") {
      //     let random_number = rng()

      //     random_number = (random_number * 100) % unscheduled_events_len
      //   }
      // })
      for (let index = 0; index < dates.length; index++) {
        const element = dates[index];
        let random_number = rng()


        

        random_number = Math.floor((random_number * 100) % (all_unscheduled_cloned.length  ) )
        // console.log("random number")
        // console.log(random_number)
        // 
        // console.log("unscheduled clones len")
        // console.log(all_unscheduled_cloned.length)

        if (isNaN(random_number)) {
          random_number = 0
        }

        if (element.event_name == "" && unscheduled_events_len != 0) {
          try {
            dates[index] = {event_name: all_unscheduled_cloned[random_number]["EventName"], event_date: index+1, suggested_by: all_unscheduled_cloned[random_number]["SuggestedBy"]}
            all_unscheduled_cloned.splice(random_number,1);
            
          } catch (error) {
            dates[index] = {event_name: "", event_date: index+1, suggested_by: ""}
          }
        }
        
      }

      return (
        <>
        {dates.map((x) => <CalandarDay event_name={x.event_name} event_date={x.event_date.toString()} suggested_by={x.suggested_by} ></CalandarDay>)}
        </>
      )
    }
}

type CalandarDayProps = {
  event_name:String,
  event_date:String,
  suggested_by:String
}

function CalandarDay(props:CalandarDayProps) {


  if (props.event_name == "") {
    return (
      <div className='w-1/7 h-40 border-2 border-white float-left'>
      <div className='p-2'>
        <div className='mb-3'>{props.event_date}</div>
        <div className='w-full h-1/2 truncate text-wrap' >No event scheduled</div>
        <div className='w-full h-1/4'></div>
      </div>
    </div>
    )
  }


  const d = new Date();

  let event_name;

  console.log(d.getDate())

  if (d.getDate() >= Number(props.event_date) && d.getMonth() == 11) {
    event_name = atob(props.event_name.toString())
  }
  else {
    event_name = props.event_name
  }
  
  
  return (
    <div className='w-1/7 h-40 border-2 border-white float-left'>
      <div className='p-2'>
        <div className='mb-3'>{props.event_date}</div>
        <div className='w-full h-1/2 truncate text-wrap' >{event_name}</div>
        <div className='w-full h-1/4'>Suggested by: {props.suggested_by}</div>
      </div>
    </div>
  )

}

export default App
