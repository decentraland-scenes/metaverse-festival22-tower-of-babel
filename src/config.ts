import { isPreviewMode } from "@decentraland/EnvironmentAPI"
import { DispenserPos } from "./claiming-dropin/claiming/claimTypes"

export const ENV = "prd"

const DEBUG_FLAGS:Record<string,boolean>={
  "local":true,
  "prd-demo":false,
  "prd":false
}
const CLAIM_TESTING_ENABLED:Record<string,boolean>={
  "local":true,
  "prd-demo":false,
  "prd":false
}

const TOUR_DEFAULT_NON_EVENT_DAY = 4

const ADMIN_RIGHTS_ANYONE:Record<string,string[]>={
    "local":["PROVIDE_ADMIN_ADDRESS","any"],
    "prd-demo": ["PROVIDE_ADMIN_ADDRESS"],
    "prd": ["PROVIDE_ADMIN_ADDRESS"]
}
const TOUR_DEFAULT_DAY_VALS:Record<string,number>={
  "local":0,
  "prd-demo":4,//4 is non event day
  "prd":4
}


const TOUR_SCHEDULER_INTERVAL_CHECK_VALS:Record<string,number>={
  "local":1,
  "prd-demo":15,//4 is non event day
  "prd":15
}

const PLAYER_DATA_ENDPOINT_VALS: Record<string, string> = {
    "local": "PROVIDE_PLAYER_DATA_ENDPOINT",//TODO get io 
    "stg": "PROVIDE_PLAYER_DATA_ENDPOINT",
    "prd-demo": "PROVIDE_PLAYER_DATA_ENDPOINT",
    "prd": "PROVIDE_PLAYER_DATA_ENDPOINT",
};
//ONLY PASS VALUES THAT ARE NOT SECURE HERE
const PLAYER_DATA_ENDPOINT_STATIC_PARAMS_VALS: Record<string, string> = {
  "local": "",//TODO get io
  "stg": "",
  "prd-demo": "",
  "prd": "",
};
//ONLY PASS VALUES THAT ARE NOT SECURE HERE
//""

const ParcelCountX:number = 3
const ParcelCountZ:number = 4

const lootSpawnPos = new Vector3(22.5 ,46 ,42.7)

export class Config{
  sizeXParcels:number=ParcelCountX
  sizeZParcels:number=ParcelCountZ
  sizeX!:number
  sizeY!:number
  sizeZ!:number
  TEST_CONTROLS_ENABLE:boolean  = true

  ADMINS = ADMIN_RIGHTS_ANYONE[ENV]
  
  IN_PREVIEW = false
  FORCE_PREVIEW_ENABLED = true
  
  //do has check, maybe dont do it so always feel like won
  //reward server will enforce if u got it
  CLAIM_DO_HAS_WEARABLE_CHECK = false
  
  //puts a small bubble around the npc, so cannot be hidden by players
  NPC_HIDE_PLAYER_MODIFIER_ENABLED = true
  NPC_HIDE_PLAYER_WIDTH = .2

  TOUR_DATE_TESTING_ENABLED = false 
  TOUR_SCHEDULER_ENABLED = false
  TOUR_SCHEDULER_INTERVAL_CHECK = TOUR_SCHEDULER_INTERVAL_CHECK_VALS[ENV]
  TOUR_DEFAULT_DAY = TOUR_DEFAULT_DAY_VALS[ENV]//4 testing
  TOUR_DEFAULT_NON_EVENT_DAY = TOUR_DEFAULT_NON_EVENT_DAY
  TOUR_DEFAULT_NON_EVENT_DAY_AFTER = 5
  TOUR_NPC_POS = new Vector3(37, 0.1, 4)

  TOUR_LOOT_SPAWN = lootSpawnPos //new Vector3(25,46 ,21)-when facing north
  TOUR_LOOT_POS = new Vector3(17,46 ,lootSpawnPos.z)     

  PLAYER_DATA_ENDPOINT = PLAYER_DATA_ENDPOINT_VALS[ENV]
  PLAYER_DATA_ENDPOINT_STATIC_PARAMS = PLAYER_DATA_ENDPOINT_STATIC_PARAMS_VALS[ENV]

  DEBUG_ACTIVE_SCENE_TRIGGER_ENABLED = DEBUG_FLAGS[ENV]
  DEBUG_PORTAL_TRIGGER_ENABLED = DEBUG_FLAGS[ENV]

  DEBUG_2D_PANEL_ENABLED = DEBUG_FLAGS[ENV]
  DEBUG_UI_ANNOUNCE_ENABLED = DEBUG_FLAGS[ENV]
  
  DEBUG_SHOW_NPC_PATH = DEBUG_FLAGS[ENV] //if npc path is lit up
  DEBUG_SHOW_ASTAR_OBSTICLES = DEBUG_FLAGS[ENV]

  //START claiming/dispensers
  CLAIM_TESTING_ENABLED = CLAIM_TESTING_ENABLED[ENV]
  CLAIM_DATE_TESTING_ENABLED = false
  DISPENSER_POSITIONS:DispenserPos[] = [] 
  //END claiming/dispensers
  
  center!:Vector3
  centerGround!:Vector3
  init(){
    this.sizeX = ParcelCountX*16
    this.sizeZ = ParcelCountZ*16 
    this.sizeY = (Math.log((ParcelCountX*ParcelCountZ) + 1) * Math.LOG2E) * 20// log2(n+1) x 20 //Math.log2( ParcelScale + 1 ) * 20
    this.center = new Vector3(this.sizeX/2,this.sizeY/2,this.sizeZ/2)
    this.centerGround = new Vector3(this.sizeX/2,0,this.sizeZ/2)
  }
}

export const CONFIG = new Config()

export function initConfig(){
  log('stage',CONFIG,"initConfig() with ")// + DEFAULT_ENV)
  CONFIG.init()

  isPreviewMode().then( (val:boolean) =>{
    log("IN_PREVIEW",CONFIG.IN_PREVIEW,val)
    CONFIG.IN_PREVIEW = val || CONFIG.FORCE_PREVIEW_ENABLED
  })
  return CONFIG
}
