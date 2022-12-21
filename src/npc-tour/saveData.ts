import { signedFetch } from "@decentraland/SignedFetch"
import { CONFIG } from "src/config"
import { REGISTRY } from "src/registry"
import { getAndSetUserData, getUserDataFromLocal } from "src/userData"
import { DayPathData } from "./tourTypes"

export type StoreDataDay={
  day:number
  completedOn:number
}
export type StoredPlayerData={
  activeDay:number
  finalDayComplete:boolean //if ready to tour of babel
  daysCompleted:StoreDataDay[]
}

const PLAYER_DATA_KEY = "mvmf_followWhiteRabbitProgress"


export function completedAnyEventDayOnce(){
  const tourManager = REGISTRY.tourManager
  for(const p in tourManager.dayPaths){
    const dayPath = tourManager.dayPaths[p]
    if(dayPath.isEventDay && completedOnce(dayPath)){
      log("completedAnyDayOnce","found completed day",dayPath)
      return true
    }
  }
  log("completedAnyDayOnce","no completed days found",tourManager.dayPaths)
  return
}
export function completedOnce(curDayData:DayPathData|undefined){
  return curDayData !== undefined && curDayData.completedOn !== undefined && curDayData.completedOn > 0
}
export async function  updateRemotePlayerData(data:{finalDayCompleted:boolean}){
  const METHOD_NAME = "updateRemotePlayerData"
  //TODO write player segement status to DB

  let userData = getUserDataFromLocal()
  if(userData===undefined){
    userData = await getAndSetUserData()
  }
  //address=me&key=test4&value=testxx
  let url = CONFIG.PLAYER_DATA_ENDPOINT + "/player/data/put" 
    + "?" + CONFIG.PLAYER_DATA_ENDPOINT_STATIC_PARAMS 
    + "&address="+userData?.userId+"&key="+PLAYER_DATA_KEY


  const daysCompletedData:StoreDataDay[] = []  
  for(const p in REGISTRY.tourManager.dayPaths){
    const dayPath = REGISTRY.tourManager.dayPaths[p]
    daysCompletedData.push( {day:dayPath.day,completedOn: dayPath.completedOn!== undefined ? dayPath.completedOn : -1 } )
  }


  const valToSave:StoredPlayerData = {
    activeDay: REGISTRY.tourManager.day,
    daysCompleted: daysCompletedData,
    finalDayComplete: data.finalDayCompleted
  }

  try {
    url += "&value=" + encodeURIComponent(JSON.stringify(valToSave))

    let response = await signedFetch(url, {
      headers: { "Content-Type": "application/json" },
      method: "GET"/*,
      body: JSON.stringify(myBody),*/
    })

    if (!response.text) {
      throw new Error("Invalid response")
    }

    let json = await JSON.parse(response.text)
    if(json.valid !== undefined && json.valid){

    }else{
      //not sure what to do
    }
    log(METHOD_NAME,"Response received: ",url, json)
  } catch (e){
    log(METHOD_NAME,"failed to reach URL",url,e)
  }
}
export async function fetchRemotePlayerData(){
  const METHOD_NAME = "fetchRemotePlayerData"
  //TODO get player segement status to DB

  let userData = getUserDataFromLocal()
  if(userData===undefined){
    userData = await getAndSetUserData()
  }
  //address=me&key=test4&value=testxx
  const url = CONFIG.PLAYER_DATA_ENDPOINT + "/player/data/get" 
    + "?" + CONFIG.PLAYER_DATA_ENDPOINT_STATIC_PARAMS 
    + "&address="+userData?.userId+"&key="+PLAYER_DATA_KEY
  
  const daysCompletedData:StoreDataDay[] = []  
  for(const p in REGISTRY.tourManager.dayPaths){
    const dayPath = REGISTRY.tourManager.dayPaths[p]
    daysCompletedData.push( {day:dayPath.day,completedOn: dayPath.completedOn!== undefined ? dayPath.completedOn : -1 } )
  }
 
  const defaultReturn:StoredPlayerData = {
    daysCompleted: daysCompletedData,
    finalDayComplete: false,
    activeDay: CONFIG.TOUR_DEFAULT_NON_EVENT_DAY//fallback
  }

  let retVal:StoredPlayerData = defaultReturn

  try {
    log(METHOD_NAME,"calling ",url)
    let response = await signedFetch(url, {
      headers: { "Content-Type": "application/json" },
      method: "GET"/*,
      body: JSON.stringify(myBody),*/
    })

    if (!response.text) {
      throw new Error("Invalid response")
    }

    let json = await JSON.parse(response.text)

    log(METHOD_NAME,"Response received: ",url, json)

    if(json.valid !== undefined && json.valid && json.data !== undefined ){
      for(const p in json.data){
        const data = json.data[p]
        if(data !== undefined && data.data_key !== undefined && data.data_key == PLAYER_DATA_KEY && data.value !== undefined){
          const jsonData = JSON.parse(data.value)
          if(jsonData.daysCompleted !== undefined){
            retVal = jsonData
            log(METHOD_NAME,"Response found match to key: ",PLAYER_DATA_KEY,url, json,"will return",retVal)
            break;
          }else{
            log(METHOD_NAME,"Response received not recognized format. missing data.daysCompleted, returning default value: ",url, json,"will return",retVal)
          }
        }
      }
      
    }else{
      //not sure what to do
      log(METHOD_NAME,"Response received not recognized format. missing valid = true,, returning default value ",url, json,"will return",retVal)
    }

    
  } catch (e){
    log(METHOD_NAME,"failed to reach URL",url,e,"will return",retVal)
  }
  log(METHOD_NAME,"RETURN",retVal)
  return retVal
}