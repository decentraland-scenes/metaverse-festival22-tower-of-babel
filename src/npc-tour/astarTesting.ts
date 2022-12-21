import * as utils from '@dcl/ecs-scene-utils'
import * as npc from '@dcl/npc-scene-utils'
import * as ui from '@dcl/ui-scene-utils'

//import {Grid,Astar} from "fast-astar";
import { CONFIG } from 'src/config';
import { FollowPathData,NPCLerpData } from '@dcl/npc-scene-utils';
import { IntervalUtil } from 'src/interval-util';
import { NpcAnimationNameDef, REGISTRY } from 'src/registry';
import { RESOURCES } from 'src/resources'
import { pickRandom } from 'src/utils/utils'
import resources, { setSection } from 'src/dcl-scene-ui-workaround/resources'
import { GrandGiftBox, SceneItem, SceneItemDef } from 'src/present'
import { DayPathData, GridPosition } from './tourTypes'
import * as TOUR_CONSTANTS from './tourConstants'
import { pathTo3D, placeAtEndOfSegment, realDistance, showAtEndOfSegment, toAbsGridPos } from './tourUtils'
import { movePlayerTo } from '@decentraland/RestrictedActions'
import { checkIfPlayerHasAnyWearableByUrn, ClaimTokenRequest, ClaimTokenResult, ClaimUI, HandleClaimTokenCallbacks } from 'src/claiming-dropin/claiming/loot'
import { ClaimConfig, ClaimConfigInstType, WearableEnum } from 'src/claiming-dropin/claiming/loot-config'
import { getUserDataFromLocal } from 'src/userData'
import { ClaimCodes, ClaimUiType, DispenserPos } from 'src/claiming-dropin/claiming/claimTypes'
import { customResolveSourceImageSize, testForWearable } from 'src/claiming-dropin/claiming/utils'
import { sharedClaimBgTexture } from 'src/claiming-dropin/claiming/claimResources'
import { updateDebugTourInfo } from './debugUI'
import { completedAnyEventDayOnce, completedOnce, fetchRemotePlayerData, StoredPlayerData, updateRemotePlayerData } from './saveData';
import { Portal } from './portal';
import { SceneActiveUtil } from 'src/sceneActiveUtil';


const COMPLETED_ON_EPOC = 1667174400000 //Monday, October 31, 2022 12:00:00 AM


//(24*16)^2=147,456 !!!, maybe a little smaller?
//(24*4)^2=9216!!!, reasonable?
//(24*3)^2=5184!!!, reasonable?

//rc = 3 = row,colum = 2 ints + 1 array
//coord * rc * 32bit
//(9216*3)*32 = .11 MB does not seem bad
//(5184*3)*32 = .06 MB does not seem bad

 
const roadsArray = [
  [-65,52],[-64,52],[-59,52],[-58,52],[-57,52],[-56,52],[-55,52],[-54,52],[-53,52],[-52,52],
  [-65,53],[-64,53],[-59,53],[-58,53],[-52,53],
  [-65,54],[-64,54],[-59,54],[-58,54],[-52,54],
  [-65,55],[-64,55],[-59,55],[-58,55],[-52,55],
  [-65,56],[-64,56],[-59,56],[-58,56],[-52,56],
  [-65,57],[-64,57],[-59,57],[-58,57],[-57,57],[-56,57],[-55,57],[-54,57],[-53,57],[-52,57],
  [-71,58],[-70,58],[-69,58],[-68,58],[-67,58],[-66,58],[-65,58],[-64,58],[-63,58],[-62,58],[-61,58],[-60,58],[-59,58],[-58,58],[-57,58],[-56,58],[-55,58],
  [-68,59],[-55,59],
  [-68,60],[-55,60],
  [-68,61],[-55,61],
  [-68,62],[-55,62],
  [-68,63],[-55,63],
  [-68,64],[-55,64],
  [-68,65],[-55,65],
  [-68,66],[-55,66],
  [-68,67],[-67,67],[-66,67],[-65,67],[-64,67],[-63,67],[-62,67],[-61,67],[-60,67],[-59,67],[-58,67],[-57,67],[-56,67],[-55,67],[-54,67],[-53,67],[-52,67],
  [-71,68],[-70,68],[-69,68],[-68,68],[-67,68],[-66,68],[-65,68],[-64,68],[-60,68],[-55,68],
  [-68,69],[-64,69],[-60,69],[-55,69],
  [-68,70],[-64,70],[-60,70],[-55,70],
  [-68,71],[-64,71],[-60,71],[-55,71]
]
 
//points to walk, bottom left to top left to top right to bottom right
//let astar connect them into a curve
const pathSeedPointsAbs = [
  [-65,51],
  [-65,58],
  [-68,58],
  [-68,67],
  [-64,67],
  [-64,72],
  [-60,72],
  [-60,67],
  [-55,67],
  [-55,58],
  [-58,57],
  [-58,51]
] 




const DAY_PATHS:DayPathData[] = [
  {
    day:0,
    isEventDay:true,
    currSegment:0,
    segmentsAbs:[
      [
        [-57,58] //start at mainstage south east side (lower right)
        ,[-54,57],[-52,57],[-52,57],[-52,52],[-58,52],[-58,58]//around ozzfest 
        ,[-65,58],[-68,58],[-68,67],[-60,67],[-53,67]//all the way to top
      ], //run to/from
      //[] //run to/from
    ],
    segmentsRel:[

    ],
    completed:false,
    dropLootBox: true,
    portals:{},
    claimConfig:{    
      //name to match campaign ref if you want scheduler to work
      name: ClaimConfig.campaign.WHITE_RABBIT_D1.refId, //clickable object
      model: 'boxshape' ,  //put model path when we have one 
      claimConfig: ClaimConfig.campaign.WHITE_RABBIT_D1,
      claimData:{claimServer: ClaimConfig.rewardsServer , campaign:ClaimConfig.campaign.WHITE_RABBIT_D1.campaign,campaign_key:ClaimConfig.campaign.WHITE_RABBIT_D1.campaignKeys.key1},
      dispenserUI:{
          boothModel:'src/claiming-dropin/models/poap/POAP_dispenser.glb',boothModelButton:'src/claiming-dropin/models/poap/POAP_button.glb'
          ,hoverText:"Claim" }, 
      wearableUrnsToCheck: ClaimConfig.campaign.WHITE_RABBIT_D1.wearableUrnsToCheck,
      claimUIConfig: {bgTexture:sharedClaimBgTexture,claimServer:ClaimConfig.rewardsServer,resolveSourceImageSize:customResolveSourceImageSize},
      transform: {position: new Vector3(2,1,1),scale:new Vector3(1.2,1.2,1.2)  ,rotation:Quaternion.Euler(0,135,0) }
    }
  },
  {
    day:1,
    isEventDay:true,
    currSegment:0,
    segmentsAbs:[
      [
        [-68,71],[-68,67],[-60,67],[-53,67]//upper left corner to far right
      ],
      [
        [-71,58],[-70,58],[-65,58],[-58,58]//lower left corner
        ,[-58,52],[-57,52],[-52,52],[-52,57],[-55,57],[-55,71]//around ozzfest then up to top
      ] 
      //[] //run to/from 
    ],
    segmentsRel:[

    ],
    completed:false,
    isLastDay: false,
    dropLootBox: true,
    portals:{},
    claimConfig:{    
      //name to match campaign ref if you want scheduler to work
      name: ClaimConfig.campaign.WHITE_RABBIT_D2.refId, //clickable object
      model: 'boxshape' ,  //put model path when we have one 
      claimConfig: ClaimConfig.campaign.WHITE_RABBIT_D2,
      claimData:{claimServer: ClaimConfig.rewardsServer , campaign:ClaimConfig.campaign.WHITE_RABBIT_D2.campaign,campaign_key:ClaimConfig.campaign.WHITE_RABBIT_D2.campaignKeys.key1},
      dispenserUI:{
          boothModel:'src/claiming-dropin/models/poap/POAP_dispenser.glb',boothModelButton:'src/claiming-dropin/models/poap/POAP_button.glb'
          ,hoverText:"Claim" }, 
      wearableUrnsToCheck: ClaimConfig.campaign.WHITE_RABBIT_D2.wearableUrnsToCheck,
      claimUIConfig: {bgTexture:sharedClaimBgTexture,claimServer:ClaimConfig.rewardsServer,resolveSourceImageSize:customResolveSourceImageSize},
      transform: {position: new Vector3(2,1,1),scale:new Vector3(1.2,1.2,1.2)  ,rotation:Quaternion.Euler(0,135,0) }
    }
  },
  {
    day:2,
    isEventDay:true,
    currSegment:0,
    segmentsAbs:[
      //run the humps at tome
      [
        [-52,67],[-55,67],[-55,71]//upper left
      ],
      [
        [-60,71],[-60,70],[-60,67],[-64,67],[-64,71]
      ] ,
      [
        [-68,71],[-68,70],[-68,68],[-70,68]
      ] 
      //[] //run to/from
    ],
    segmentsRel:[

    ],
    completed:false,
    isLastDay: false,
    dropLootBox: true,
    portals:{},
    claimConfig:{    
      //name to match campaign ref if you want scheduler to work
      name: ClaimConfig.campaign.WHITE_RABBIT_D3.refId, //clickable object
      model: 'boxshape' ,  //put model path when we have one 
      claimConfig: ClaimConfig.campaign.WHITE_RABBIT_D3,
      claimData:{claimServer: ClaimConfig.rewardsServer , campaign:ClaimConfig.campaign.WHITE_RABBIT_D3.campaign,campaign_key:ClaimConfig.campaign.WHITE_RABBIT_D3.campaignKeys.key1},
      dispenserUI:{
          boothModel:'src/claiming-dropin/models/poap/POAP_dispenser.glb',boothModelButton:'src/claiming-dropin/models/poap/POAP_button.glb'
          ,hoverText:"Claim" }, 
      wearableUrnsToCheck: ClaimConfig.campaign.WHITE_RABBIT_D3.wearableUrnsToCheck,
      claimUIConfig: {bgTexture:sharedClaimBgTexture,claimServer:ClaimConfig.rewardsServer,resolveSourceImageSize:customResolveSourceImageSize},
      transform: {position: new Vector3(2,1,1),scale:new Vector3(1.2,1.2,1.2)  ,rotation:Quaternion.Euler(0,135,0) }
    }
  },

  {
    day:3,
    isEventDay:true,
    currSegment:0,
    segmentsAbs:[
      /*
      [
        [-55,71],[-55,58],[-59,57],[-58,52] ,[-52,52]
      ], 
      [  
        [-52,57],[-53,57],[-56,57]
      ],     
      [ 
        [-65,52],[-65,53],[-65,58],[-68,58],[-68,68],[-65,68],[-64,68],[-64,71]
      ]*/
    ],
    segmentsRel:[

    ],
    completed:false,
    isLastDay: true,
    dropLootBox: true,//for tower     
    portals:{},
    claimConfig:{     //UPDATE ME WITH LATEST
      //name to match campaign ref if you want scheduler to work
      name: ClaimConfig.campaign.WHITE_RABBIT_D4.refId, //clickable object
      model: 'boxshape' ,  //put model path when we have one 
      claimConfig: ClaimConfig.campaign.WHITE_RABBIT_D4,
      claimData:{claimServer: ClaimConfig.rewardsServer , campaign:ClaimConfig.campaign.WHITE_RABBIT_D4.campaign,campaign_key:ClaimConfig.campaign.WHITE_RABBIT_D4.campaignKeys.key1},
      dispenserUI:{
          boothModel:'src/claiming-dropin/models/poap/POAP_dispenser.glb',boothModelButton:'src/claiming-dropin/models/poap/POAP_button.glb'
          ,hoverText:"Claim" }, 
      wearableUrnsToCheck: ClaimConfig.campaign.WHITE_RABBIT_D4.wearableUrnsToCheck,
      claimUIConfig: {bgTexture:sharedClaimBgTexture,claimServer:ClaimConfig.rewardsServer,resolveSourceImageSize:customResolveSourceImageSize},
      transform: {position: new Vector3(2,1,1),scale:new Vector3(1.2,1.2,1.2)  ,rotation:Quaternion.Euler(0,135,0) }
    }
  },
  {
    day:4,//test da
    isEventDay: false,
    currSegment:0,
    segmentsAbs:[
      [
        [-55,71],[-55,58],[-59,57],[-58,52] ,[-52,52]
      ],  
      [  
        [-52,57],[-53,57],[-56,57]
      ],     
      [ 
        [-65,52],[-65,53],[-65,58],[-68,58],[-68,68],[-65,68],[-64,68],[-64,71]
      ]
      //[] //run to/from
    ],
    segmentsRel:[

    ],
    completed:false,
    isLastDay: true,
    dropLootBox: true,
    portals:{},
    claimConfig:{    
      //name to match campaign ref if you want scheduler to work
      name: ClaimConfig.campaign.TEST_STAGE1.refId, //clickable object
      model: 'boxshape' ,  //put model path when we have one 
      claimConfig: ClaimConfig.campaign.TEST_STAGE1,
      claimData:{claimServer: ClaimConfig.rewardsServer , campaign:ClaimConfig.campaign.TEST_STAGE1.campaign,campaign_key:ClaimConfig.campaign.TEST_STAGE1.campaignKeys.key1},
      dispenserUI:{
          boothModel:'src/claiming-dropin/models/poap/POAP_dispenser.glb',boothModelButton:'src/claiming-dropin/models/poap/POAP_button.glb'
          ,hoverText:"Claim" }, 
      wearableUrnsToCheck: ClaimConfig.campaign.TEST_STAGE1.wearableUrnsToCheck,
      claimUIConfig: {bgTexture:sharedClaimBgTexture,claimServer:ClaimConfig.rewardsServer,resolveSourceImageSize:customResolveSourceImageSize},
      transform: {position: new Vector3(2,1,1),scale:new Vector3(1.2,1.2,1.2)  ,rotation:Quaternion.Euler(0,135,0) }
    }
  },
  {
    day:5,//non event, after day
    isEventDay: false,
    currSegment:0,
    segmentsAbs:[
      [
        [-55,71],[-55,58],[-59,57],[-58,52] ,[-52,52]
      ],  
      [  
        [-52,57],[-53,57],[-56,57]
      ],     
      [ 
        [-65,52],[-65,53],[-65,58],[-68,58],[-68,68],[-65,68],[-64,68],[-64,71]
      ]
      //[] //run to/from
    ],
    segmentsRel:[

    ],
    completed:false,
    isLastDay: true,
    dropLootBox: false,
    portals:{},
    claimConfig:{    
      //name to match campaign ref if you want scheduler to work
      name: ClaimConfig.campaign.TEST_STAGE1.refId, //clickable object
      model: 'boxshape' ,  //put model path when we have one 
      claimConfig: ClaimConfig.campaign.TEST_STAGE1,
      claimData:{claimServer: ClaimConfig.rewardsServer , campaign:ClaimConfig.campaign.TEST_STAGE1.campaign,campaign_key:ClaimConfig.campaign.TEST_STAGE1.campaignKeys.key1},
      dispenserUI:{
          boothModel:'src/claiming-dropin/models/poap/POAP_dispenser.glb',boothModelButton:'src/claiming-dropin/models/poap/POAP_button.glb'
          ,hoverText:"Claim" }, 
      wearableUrnsToCheck: ClaimConfig.campaign.TEST_STAGE1.wearableUrnsToCheck,
      claimUIConfig: {bgTexture:sharedClaimBgTexture,claimServer:ClaimConfig.rewardsServer,resolveSourceImageSize:customResolveSourceImageSize},
      transform: {position: new Vector3(2,1,1),scale:new Vector3(1.2,1.2,1.2)  ,rotation:Quaternion.Euler(0,135,0) }
    }
  },
] 

/*
//when including surrounding boards
const xOffset = -73
const yOffset = 50
*/
const xOffset = -73
const yOffset = 50


const _PATH_SEED_POINT_REL:GridPosition[] = [
]

for(const p in pathSeedPointsAbs){
  const itm = pathSeedPointsAbs[p]
  _PATH_SEED_POINT_REL.push( [itm[0]-xOffset,itm[1]-yOffset]  )
}
for(const p in DAY_PATHS){
  const dayP = DAY_PATHS[p]
  
  for(const x in dayP.segmentsAbs){
    const itm = dayP.segmentsAbs[x]
    
    const arr:GridPosition[]=[]
    dayP.segmentsRel.push( arr )

    for(const y in itm){
      arr.push( [itm[y][0]-xOffset,itm[y][1]-yOffset]  )
    }

  }
}


const camera = Camera.instance

let followThing:Entity



class LeavingQuestAreaUI{
  //counter:ui.UICounter
  tooltipContainer:UIContainerRect
  directionTipText:UIText
  visible:boolean=false

  constructor(){
    //this.counter = new ui.UICounter( 0,0,0,Color4.Red(),10,false,0 )
    //this.hide()
    const tooltipContainer = this.tooltipContainer = new UIContainerRect(ui.canvas)
    tooltipContainer.width = "100%"
    tooltipContainer.height = "100%"
    tooltipContainer.visible = this.visible
    
    const bgImage = new UIImage(tooltipContainer, RESOURCES.textures.dialogAtlas)
    setSection( bgImage, resources.backgrounds.NPCDialog )

    bgImage.opacity = .9

    bgImage.vAlign = "top" 
    bgImage.hAlign = "center" 

    bgImage.positionX = 0
    bgImage.positionY = 0

    bgImage.width = 420
    bgImage.height = 100

    const text = this.directionTipText =  new UIText(tooltipContainer)
    text.value =  "You are too far away.  Catch up!  \nFollow the White Rabbit Quest will end in\n 000 "
    text.color = Color4.White()
    text.fontSize = 18
    text.vAlign = bgImage.vAlign
    text.vTextAlign = "center"
    text.hAlign = "center" 
    text.height = 100
    text.hTextAlign = "center"
    text.positionX = 0
    text.positionY = 0
  }


  show(force?:boolean){
    const _force = force !== undefined && force
    if(_force || !this.visible){
      this.visible = true
      this.tooltipContainer.visible = this.visible
      this.directionTipText.visible = this.visible
    }
  }
  hide(){
    //this.counter.hide()
    this.visible = false
    this.tooltipContainer.visible = this.visible
    this.directionTipText.visible = this.visible
  }
  updateText(text:string){
    if(this.directionTipText.value != text) this.directionTipText.value = text
  }
}

const leavingQuestAreaUI = new LeavingQuestAreaUI();
//leavingQuestAreaUI.show()


function getFollowThing():Entity{
  if(REGISTRY.myNPC === undefined){
    throw new Error("npc not inistalized")
  }
  if(TOUR_CONSTANTS.USE_NPC_FOLLOW){
    followThing = REGISTRY.myNPC
  } 
  return followThing;
}
function getAbsCurrentPlayerPosition():GridPosition{
  return [Math.floor(camera.position.x),Math.floor(camera.position.z)]
}
function _getCurrentPlayerPositionAtarRel2D():GridPosition{
  return [camera.position.x/TOUR_CONSTANTS.CELL_WIDTH,camera.position.z/TOUR_CONSTANTS.CELL_WIDTH]
}/*
function getNpcPositionAtarRel2D():GridPosition{
  const pos = getNpcTransform().position
  return [Math.floor(pos.x/TOUR_CONSTANTS.CELL_WIDTH),Math.floor(pos.z/TOUR_CONSTANTS.CELL_WIDTH)]
  return [pos.x/TOUR_CONSTANTS.CELL_WIDTH,pos.z/TOUR_CONSTANTS.CELL_WIDTH]
}*/

export function getAstarCurrentPlayerPosition():GridPosition{
  const pos = [
    Math.max(0,Math.floor(camera.position.x/TOUR_CONSTANTS.CELL_WIDTH) + TOUR_CONSTANTS.REL_CAMERA_SHIFT_X)   
    ,Math.max(0,Math.floor(camera.position.z/TOUR_CONSTANTS.CELL_WIDTH)+ TOUR_CONSTANTS.REL_CAMERA_SHIFT_Z) //+ TOUR_CONSTANTS.ABS_SHIFT_Z
  ]
  //log("getAstarCurrentPlayerPosition()",pos)
  return pos
}
function getNpcTransform():Transform{
  return getFollowThing().getComponent(Transform)
}
export function getAstarNpcPosition():GridPosition{
  const pos = getNpcTransform().position
  const _pos = [
    Math.floor(pos.x/TOUR_CONSTANTS.CELL_WIDTH + TOUR_CONSTANTS.REL_CAMERA_SHIFT_X)
    ,Math.floor(pos.z/TOUR_CONSTANTS.CELL_WIDTH +TOUR_CONSTANTS.REL_CAMERA_SHIFT_Z )]
  //log("getAstarNpcPosition()",_pos)
  return _pos
}

type AstarResult={
  reachable:boolean
  path:number[][]
}
function findPath(startPos:GridPosition, destPos:GridPosition ){
  log("start",startPos, "dest",destPos)

}
//TODO manage better
let debugCubeEnt:Entity[]=[]
let crumbCubeEnt:Entity[]=[]

  
type VanishInPortalParams={
  delayTillNpcEnterPortal:number
  closeSpeed:number
  closePortal:boolean
  playerCanEnter:boolean
  onNpcEnterPortalCallback:()=>void
  onPortalCloseCallback:()=>void
  onPlayerEnterPortalCallback:()=>void
}


const claimCallbacks:HandleClaimTokenCallbacks = {
  onOpenUI:(type:ClaimUiType,claimResult?:ClaimTokenResult)=>{
    log("on open",type,claimResult)
  },
  onAcknowledge:(type:ClaimUiType,claimResult?:ClaimTokenResult)=>{
    log("on ack",type,claimResult)
  },
  onCloseUI:(type:ClaimUiType,claimResult?:ClaimTokenResult)=>{
    log("on close",type,claimResult)
  }
}

export class TourManager{
  claimDayDispenserConfig?:DispenserPos
  //claimDayCampaign:ClaimConfigInstType=ClaimConfig.campaign.mvfw
  //claimDayCampaignKey:string=""
  claimCallbacks:HandleClaimTokenCallbacks = claimCallbacks

  day:number=0
  npc:npc.NPC
  tourState:TourState = TourState.NOT_INIT
  enabled:boolean = false
  npcBreadcrumbEnabled:boolean = false
  stoppedWalkingTime:number=-1
  leavingQuestWarningActive:boolean=false
  leavingQuestDeadline:number=Number.MAX_VALUE
  dayPaths:DayPathData[]
  constructor(npc:npc.NPC,dayPaths:DayPathData[]){
    this.npc = npc
    this.dayPaths = dayPaths
    this.disableTour()
  }

  initRewardForDay(){
    this.claimDayDispenserConfig = this.dayPaths[this.day].claimConfig
  }
  movePlayerToTower(){
    const lootSpawnPos = CONFIG.TOUR_LOOT_SPAWN //= new Vector3(22.5 ,46 ,42.5) //new Vector3(25,46 ,21)-when facing north
    const lootPos = CONFIG.TOUR_LOOT_POS// = new Vector3(17,46 ,lootSpawnPos.z)     
  
    //executeTask( 
    //  async ()=>{ 
        movePlayerTo(lootSpawnPos, lootPos).then(()=>{
          //debugger 
        }) 
    //  } )
      
  }
  getNPCAskForTourDialog() {
    const METHOD_NAME = "getNPCAskForTourDialog"
    const day = this.day
    //const dayTries = this.triesToday
    let dialogName = ""

    const curDayData = this.getCurrentDayData()

    const completedAtLeastOnce = completedOnce(curDayData)
    const completedAnyEventDayAtLeastOnce = completedAnyEventDayOnce()
    log(METHOD_NAME,"day",day,"this.getCurrentDayData().isEventDay",curDayData !== undefined ? curDayData.isEventDay : "???"
      ,"completedAnyEventDayAtLeastOnce",completedAnyEventDayAtLeastOnce,"dayCompleted",completedAtLeastOnce,"on", completedOnce(curDayData) && curDayData!.completedOn !== undefined ? new Date(curDayData!.completedOn).toLocaleString():"n/a")
    
    if(curDayData !== undefined && curDayData.isEventDay !== undefined && !curDayData.isEventDay){
      if(curDayData.day === CONFIG.TOUR_DEFAULT_NON_EVENT_DAY){
        dialogName = "ask-follow-white-rabbit-training"
      }else{
        dialogName = "ask-follow-white-rabbit-over"
      }
    }else if(completedAnyEventDayAtLeastOnce){
      dialogName = "ask-follow-white-rabbit-next-day"
    }else{
      dialogName = "ask-follow-white-rabbit-first"
    }
    return dialogName
  }

  initPortals() {
    
    for(const p in this.dayPaths){
      const dayP = this.dayPaths[p]
      //log("initPortals",Object.keys(dayP.portals))
      //debugger
      //DOES NOT HELP with flicker :(), MAKES IT WORSE 
      
      //const startPortal = this.getSegmentPortal(dayP.day,0,"start")
      
      
      //const endPortal = this.getSegmentPortal(dayP.day,0,"end")

      
    
      log("initPortals",Object.keys(dayP.portals))
    } 
    
  }  
  
  closePortals() {  
    for(const p in this.dayPaths){
      const dayP = this.dayPaths[p]
      
      for(const x in dayP.portals){ 
        const itm = dayP.portals[x]
        itm.close(true,0,false)
      }
    }
  }
  
  getOrCreatePortal(dayPath:DayPathData,key:string){
    let portal:Portal
    if(dayPath.portals[key] !== undefined){
      portal = dayPath.portals[key]
    }else{
      portal = new Portal(key,PORTAL_DEF_GREEN)
      dayPath.portals[key] = portal
    }
    return portal; 
  }
  getSegmentPortal(day:number,segment:number,type:"end"|"start"):Portal {
    const key = "portal."+day+"."+segment+"."+type
    
    let portal:Portal|undefined =  this.getOrCreatePortal(this.dayPaths[day],key)
    return portal
  }

  isDayInBounds(day:number){
    return day >= 0 && day < this.dayPaths.length
  }
  getDayData(day:number):DayPathData|undefined{
    if(!this.isDayInBounds(day)){
      //invalid index
      return undefined
    }
    const dayPath = this.dayPaths[day]
    return dayPath
  }
  getCurrentDayData():DayPathData|undefined{
    return this.getDayData(this.day)
  }

  getCurrentDayEndSegmentPortal():Portal {

    const day = this.day 
    const dayPath = this.dayPaths[day]
    
    let segment = dayPath.currSegment
    
    let portal:Portal|undefined = this.getSegmentPortal(day,segment,"end")

    log("getCurrentDayEndSegmentPortal",portal.name,portal.entity.getComponent(Transform).position,portal.entity.uuid)

    return portal;
  }
  getCurrentDayNextSegmentPortal() {

    const day = this.day 
    const dayPath = this.dayPaths[day]

    
    let segment = dayPath.currSegment+1

    let portal:Portal|undefined = this.getSegmentPortal(day,segment,"start")

    return portal;
  }
  vanishInPortal( portal:Portal, args:VanishInPortalParams){
    log("vanishInPortal",portal.name,args)
 

    //let portal:Portal = this.getCurrentDayEndSegmentPortal()
    
    //start sequence
    utils.setTimeout(args.delayTillNpcEnterPortal, ()=>{
      const fThingTrans = getFollowThing().getComponent(Transform)
      getFollowThing().addComponentOrReplace( 
          new utils.MoveTransformComponent(
            fThingTrans.position,
            fThingTrans.position.add(new Vector3(0,-3,0)),
            .5 
            ,()=>{

              if(args.closePortal){
                portal.close(false,args.closeSpeed,false,args.onPortalCloseCallback)
              }else{
                log("vanishInPortal.not closing this portal",portal.name,args)
              }

              getFollowThing().getComponent(Transform).position=TOUR_CONSTANTS.TOUR_NPC_POSITION_VANISH_POS.clone()

              args.onNpcEnterPortalCallback()
              //debugger
              log("vanishInPortal",portal.name,args,"moveDone")
              if(args.playerCanEnter ){
                portal.enablePlayerCanEnter(args.onPlayerEnterPortalCallback)
              }else{ 
                portal.disablePlayerCanEnter()
              }
            }
        )
      )  
      
    })
    
  }
  
  
  getCurrentDayEndSegmentPositionAbs() {
    const day = this.day 
    const dayPath = this.dayPaths[day]
    const segArr = dayPath.segmentsRel[dayPath.currSegment]
    //const dayStartPosition = 
    const relEndPos = segArr[segArr.length-1]
    const endPosAbs =  toAbsGridPos(relEndPos,TOUR_CONSTANTS.PATH_OFFSET)
    //const fThingTrans = getFollowThing().getComponent(Transform)
    
    //log("getCurrentDayEndSegmentPositionAbs",relEndPos,endPosAbs)
    return endPosAbs

  }
  getDayStartPositionAbs(day:number,segment:number){
    const dayPath = this.dayPaths[day]
    const segArr = dayPath.segmentsRel[segment]
    //const dayStartPosition = 
    const relEndPos = segArr[0]
    const endPosAbs =  toAbsGridPos(relEndPos,TOUR_CONSTANTS.PATH_OFFSET)
    //const fThingTrans = getFollowThing().getComponent(Transform)
    
    //log("getCurrentDayStartSegmentPositionAbs",relEndPos,endPosAbs)
    return endPosAbs
  }
  getCurrentDayStartSegmentPositionAbs(){
    const day = this.day 
    const dayPath = this.dayPaths[day]
    const endPosAbs =  this.getDayStartPositionAbs(day,dayPath.currSegment)
    //const fThingTrans = getFollowThing().getComponent(Transform)
    
    //log("getCurrentDayStartSegmentPositionAbs",relEndPos,endPosAbs)
    return endPosAbs
  }

  getNextDayStartSegmentPositionAbs(){
    const day = this.day 
    const dayPath = this.dayPaths[day]
    const segArr = dayPath.segmentsRel[dayPath.currSegment+1]
    //const dayStartPosition = 
    const relEndPos = segArr[0]
    const endPosAbs =  toAbsGridPos(relEndPos,TOUR_CONSTANTS.PATH_OFFSET)
    //const fThingTrans = getFollowThing().getComponent(Transform)
    
    //log("getNextDayStartSegmentPositionAbs",relEndPos,endPosAbs)
    return endPosAbs
  }

  isLastDay(){
    const last = this.day < this.dayPaths.length && this.dayPaths[this.day].isLastDay !== undefined && this.dayPaths[this.day].isLastDay === true
    return last
      //this.day >= this.dayPaths.length-1
  }
  startLeavingQuestAreaCounter(force?:boolean){
    const _force = force !== undefined && force
    if(_force || !this.leavingQuestWarningActive){
      this.leavingQuestDeadline = Date.now() + 1000* 20//20 //20 seconds
      this.leavingQuestWarningActive = true
    }
  }
  stopLeavingQuestAreaCounter(){
    //set far far in future
    if(this.leavingQuestWarningActive){
      this.leavingQuestDeadline = Number.MAX_VALUE
      this.leavingQuestWarningActive = false
    }
  }
  isDayHasMoreSegments(day:number,segment:number) {
    //const day = this.day
    const dayPath = this.dayPaths[day] 
    return segment < dayPath.segmentsRel.length - 1
  }
  isCurrentDayHasMoreSegments() {
    const day = this.day
    const dayPath = this.dayPaths[day] 
    return this.isDayHasMoreSegments(day,dayPath.currSegment)
  }
  setTourState(state:TourState){
    this.tourState = state
  }
  pickRandomDialog(arr:string[]){
    const val = pickRandom(arr);
    //TODO check if already asked, pick another
    return val;
  }
  isTourEnabled(){
    return this.enabled//this.tourState != TourState.TOUR_OFF && this.tourState != TourState.NOT_INIT
  }
  npcStopWalking(){
    this.npc.stopWalking()
    this.stoppedWalkingTime = Date.now()
  }
  disableTour(){ 
    this.tourState = TourState.TOUR_OFF
    this.enabled = false
    this.npc.getComponent(Transform).position = TOUR_CONSTANTS.TOUR_NOT_READY_HIDE_NPC_POSITION.clone()
    this.npc.getComponent(Transform).scale = TOUR_CONSTANTS.TOUR_NOT_READY_HIDE_NPC_SCALE.clone()
  }
  enableTour(){
     
    if(!this.enabled){ 
      //this.tourState = TourState.TOUR_ON
      this.npc.getComponent(Transform).position = CONFIG.TOUR_NPC_POS.clone()
      this.npc.getComponent(Transform).scale = Vector3.One()
       
      this.npc.getComponent(Transform).lookAt(Camera.instance.position)
      const rot = this.npc.getComponent(Transform).rotation
      log("lookAt",rot,rot.eulerAngles)
      this.npc.getComponent(Transform).rotation = Quaternion.Euler(0,rot.eulerAngles.y,0)
      
      if(  this.npc.hasComponent(npc.TrackUserFlag) )this.npc.getComponent(npc.TrackUserFlag).active = true
    } 

    this.enabled = true
  }/*
  drawPathToNPC(){
    
  }*/ 
  playNpcWaveCome(dt: number) {
    const trackUserComponent = this.npc.getComponent(npc.TrackUserFlag)
    if(trackUserComponent.active && waveInterval.update(dt) ){
            
      let animToPlay = REGISTRY.npcAnimations.WAVE

      log("WAVE/COME",animToPlay.name)

      if(Math.random()*2 >= 1){
        animToPlay=REGISTRY.npcAnimations.COME_ON
      }
      this.npc.playAnimation(animToPlay.name,true,animToPlay.duration)

      return true
    } 
    return false
  }

}
export async function fetchLatestDataAndStartDay(){
  if(REGISTRY.myNPC === undefined){
    throw new Error("npc not inistalized")
  }
  const tourManager = REGISTRY.tourManager

  const remoteData:StoredPlayerData = await fetchRemotePlayerData()
  //debugger
  const epoc = COMPLETED_ON_EPOC //Monday, October 31, 2022 12:00:00 AM
  //startDay(remoteData.activeDay)
  for(const p in tourManager.dayPaths){
    if(remoteData.daysCompleted[p] !== undefined){
      tourManager.dayPaths[p].completedOn = remoteData.daysCompleted[p].completedOn
      //TODO switch to completedOnce method check
      tourManager.dayPaths[p].completed = remoteData.daysCompleted[p].completedOn !== undefined && remoteData.daysCompleted[p].completedOn > epoc
    }
  }
  startDay( remoteData.activeDay )
}


function setSceneActiveStatus(val: boolean) {
  log("setSceneActiveStatus",val)
  if (val) {
    log("setSceneActiveStatus.calling fetchLatestDataAndStartDay",val)
    fetchLatestDataAndStartDay()
  } else{ 
  
  }
}
const sceneActiveUtil:SceneActiveUtil = new SceneActiveUtil( setSceneActiveStatus )

export function openToTowerPortal(day:number){
  log("openToTowerPortal","ENTRY",day)
  const portal = REGISTRY.tourManager.getSegmentPortal(day,0,"start")
  portal.show()
  portal.placeAtEndOfSegment( CONFIG.TOUR_NPC_POS.add(new Vector3(-1,.1,-2)) )
  portal.enablePlayerCanEnter(()=>{
    if(CONFIG.DEBUG_UI_ANNOUNCE_ENABLED) ui.displayAnnouncement("move player to last reward?")
    REGISTRY.tourManager.movePlayerToTower()
  })
}

export async function setupTour(){
  
  if(REGISTRY.myNPC === undefined){
    throw new Error("npc not inistalized")
  }
  const tourManager = new TourManager(REGISTRY.myNPC,DAY_PATHS)
  REGISTRY.tourManager = tourManager
 
  //do initial check
  fetchLatestDataAndStartDay()

  //will trigger fetchLatestDataAndStartDay 
  sceneActiveUtil.init()  
 
  const hasGiftAlready = await checkIfPlayerHasAnyWearableByUrn( ClaimConfig.campaign.WHITE_RABBIT_D4.wearableUrnsToCheck )
  //const hasGiftAlready = await checkIfPlayerHasAnyWearableByUrn( ["urn:decentraland:matic:collections-v2:0xef8f8be45c1d9860df50b379247a02eccf4e5f47:1"],true )
  log("DAYS_GIFT.show","hasGiftAlready",hasGiftAlready) 
  if(hasGiftAlready){
    DAYS_GIFT.hide()
    //open portal
    openToTowerPortal(3)//day 3 is last day
  }else{
    DAYS_GIFT.show()
  }
  
  /*if(  tourManager.getCurrentDayData().isEventDay !== undefined && !tourManager.getCurrentDayData().isEventDay){
    startDay(tourManager.day)
  }*/

  if(TOUR_CONSTANTS.USE_NPC_FOLLOW){
    //followThing = myNPC
  }else{
    followThing = new Entity()

    followThing.addComponent(new SphereShape()) 
    followThing.addComponent(new Transform({
      position: new Vector3(8+TOUR_CONSTANTS.CELL_WIDTH/2,.5,8+TOUR_CONSTANTS.CELL_WIDTH/2),
      scale: Vector3.One().scale(.5)
    }))
    engine.addEntity(followThing)
  }


  //initRunAwayForDay(tourManager) 
}


//const pathPoints = astarMultiTarget(pathSeedPointsRel[0],pathSeedPointsRel)

//solve white rabit path full circle
//const tourPath = findRabitPathFromNearest( getAstarCurrentPlayerPosition(),pathSeedPointsRel )


const input = Input.instance


input.subscribe("BUTTON_DOWN", ActionButton.PRIMARY, false, e => {
  log("BUTTON press OCCURED")
  
})


input.subscribe("BUTTON_DOWN", ActionButton.ACTION_5, false, e => {
  log("npc.debug data")
  if(REGISTRY.tourManager.npc.hasComponent(NPCLerpData)){
    log("NPCLerpData",REGISTRY.tourManager.npc.getComponent(NPCLerpData))
  }
})


const ONE_SECOND_MILLIS = 1000
const pollUserDataInterval = new IntervalUtil(ONE_SECOND_MILLIS/10);
const waveInterval = new IntervalUtil(ONE_SECOND_MILLIS* 2.5);//short as longest possible animation len
const updateBreadcrumbInterval = new IntervalUtil(ONE_SECOND_MILLIS/6);

export enum TourState {
  NOT_INIT="not-init",
  TOUR_OFF="tour-off",
  TOUR_ON="tour-on",
  PLAYER_FIND_NPC="player-find-npc",
  NPC_FIND_PLAYER_TO_START='npc-find-player-to-ask',
  NPC_ASK_TOUR='ask-tour',
  TOURING='touring',
  TOURING_WAITING_4_PLAYER='touring-waiting4u',
  TOUR_COMPLETE='tour-completed',
  NPC_ASK_TOUR_DECLINE='tour-declined',
  NPC_ASK_TOUR_ACCEPT='tour-accept',
  TOURING_START='tour-start',
} 


const maxAwayDistance = TOUR_CONSTANTS.NPC_MAX_AWAY_DISTANCE //when this close start amplifying speed to keep them out of reach
const activateDistance = TOUR_CONSTANTS.NPC_ACTIVATE_DISTANCE //when this close start amplifying speed to keep them out of reach


export async function spawnRewardForDay(){
  const METHOD_NAME = "spawnRewardForDay"
  const tourManager = REGISTRY.tourManager;
  log(METHOD_NAME,"ENTRY")
  if(tourManager === undefined){
    log(METHOD_NAME,"NpcTourSystem skipped, tourManager not ready",tourManager)
    return
  }

  /*if(tourManager.isLastDay()){
    if(CONFIG.DEBUG_UI_ANNOUNCE_ENABLED) ui.displayAnnouncement("last day go get from other scene")
    log(METHOD_NAME,"last day go get from other scene")
    //debugger
    return 
  }*/

  //TODO tag:check-w3-can-get

  const dispenserConfig = tourManager.claimDayDispenserConfig
  //const tourCampaign = tourManager.claimDayCampaign
  //const tourCampaignKey = tourManager.claimDayCampaignKey
  //const claimUI = tourManager.claimUI !== undefined ? tourManager.claimUI : new ClaimUI(claimUIConfig,this.claimConfig)
  //const claimCallbacks = tourManager.claimCallbacks

  const curDayData = tourManager.getCurrentDayData()
  log(METHOD_NAME,"currentDayData",curDayData,"dispConfig",dispenserConfig);
  if(dispenserConfig !== undefined 
      && 
      (curDayData !== undefined && curDayData.dropLootBox !== undefined && curDayData.dropLootBox)){

    const alreadyCompletedOnce = curDayData.completed
    log(METHOD_NAME,"calling show gift!!!","alreadyCompletedOnce",alreadyCompletedOnce,"on", completedOnce(curDayData) && curDayData.completedOn !== undefined ? new Date(curDayData.completedOn).toLocaleString():"n/a")
    //or do we show gift if failed, for example non web3 dont get one
    DAYS_GIFT.show() //- its always visible
    
    const claimUI = new ClaimUI(dispenserConfig.claimUIConfig,dispenserConfig.claimConfig)
    claimUI.claimConfig = dispenserConfig.claimConfig
    claimUI.setClaimUIConfig( dispenserConfig.claimUIConfig ) 

    //help with message, know if out of stock or wait till next day
    //claimUI.campaignSchedule = dispenserSchedule

    DAYS_GIFT.claimTokenReady = false
    //giving it to giftbox when claiming now
    DAYS_GIFT.claimTokenResult = undefined
    DAYS_GIFT.claimCallbacks = tourManager.claimCallbacks
    DAYS_GIFT.claimUI = claimUI
    
    const hasWearable = 
      claimUI.claimConfig?.wearableUrnsToCheck !== undefined ? await checkIfPlayerHasAnyWearableByUrn(
        //ClaimConfig.campaign.dcl_artweek_px.wearableUrnsToCheck
        claimUI.claimConfig?.wearableUrnsToCheck
        //ClaimConfig.campaign.mvfw.wearableUrnsToCheck
        )  
      : false
    
    log(METHOD_NAME,"hasWearable",hasWearable)

    if(hasWearable){
        const claimResult=new ClaimTokenResult()
        claimResult.requestArgs = {...dispenserConfig.claimData}
        claimResult.requestArgs.claimConfig = dispenserConfig.claimConfig
        

        claimResult.claimCode = ClaimCodes.ALREADY_HAVE_IT
        DAYS_GIFT.claimTokenReady = true
        //giving it to giftbox when claiming now
        DAYS_GIFT.claimTokenResult = claimResult

        //claimUI.openYouHaveAlready(claimResult,claimCallbacks)
    }else{
        //debugger
        const claimReq = new ClaimTokenRequest( dispenserConfig.claimData )

        const claimResult = await claimReq.claimToken()

        updateRemotePlayerData({finalDayCompleted:true})
        //debugger
        log(METHOD_NAME,"claim result",claimResult.success)


        DAYS_GIFT.redeemable = true
 
        //claimUI.handleClaimJson( claimResult, claimCallbacks )

        DAYS_GIFT.claimTokenReady = true
        //giving it to giftbox when claiming now
        DAYS_GIFT.claimTokenResult = claimResult

        if(DAYS_GIFT.claimUI.claimInformedPending){
          DAYS_GIFT.claimUI.claimInformedPending = false
          DAYS_GIFT.showClaimPrompt()
        }

    }
  }else{
    //claim not configured for day
    log(METHOD_NAME,"does not have a claimable",curDayData,dispenserConfig)
  }

  /*
  if (
    (claimResult.isClaimJsonSuccess()) === false
  ) {
    if (!getUserDataFromLocal()) {
      log("USER DATA SHOULD NOT BE NULL IF PLAYER PROGRESSION WAS CALLED DURING GAME START")
    }
    const userData = getUserDataFromLocal();
    if(userData !== undefined && userData !== null && !userData.hasConnectedWeb3){
      //NPC_REGISTRY.elf2.talk(elf2RewardIssues,'notWeb3ConnectedReward')    
    }else{
      //showFailedClaimMessage(claimTokenResult)
    }
    //NPC_REGISTRY.elf2.talk(elf2HappyReward)
    return
  }else{
    showClaimNow = false

    DAYS_GIFT.show()
  }*/
      
      
  

  if(!tourManager.isLastDay()){
    tourManager.closePortals()
  }
}


function tourComplete(){
  log("tourComplete called!!!")
  const tourManager = REGISTRY.tourManager;
  const trackUserComponent = tourManager.npc.getComponent(npc.TrackUserFlag)


  const day = tourManager.day
  const dayPath = tourManager.dayPaths[day]  
  //const pathSeedPointsRel = dayPath.segmentsRel[dayPath.currSegment]
  //debugger
  if( tourManager.isCurrentDayHasMoreSegments()){
    tourManager.npc.talk(REGISTRY.WhiteRabbitDialog, "through-here-tour");
    //continueNextSegmentRunAwayForDay(tourManager)
  }else{
    
    trackUserComponent.active = true
    tourManager.setTourState(TourState.TOUR_COMPLETE)

  }
}

function resetTour(tourManager:TourManager) {
  //reset day
  const day = tourManager.day 
  const dayPath = tourManager.dayPaths[day]
  dayPath.currSegment = 0
  //const dayStartPosition = 

  leavingQuestAreaUI.hide()
  
  //close all portals
  tourManager.closePortals()

  //DAYS_GIFT.hide(true) 
  
  //clear out crumb path
  //tourManager.disableNPCBreadcrumb() // or keep it active? but need to update itself
  //clear debug path too
  //debugDrawPath( {reachable:false,path:[]},[],debugCubeEnt,{material:RESOURCES.materials.emissiveBoxMatOutline,highlightSeedPoints:false} )

}
export function disableTour(tourManager:TourManager) {
  resetTour(tourManager)
  tourManager.disableTour()
   
}
export function enableTour(tourManager:TourManager) {
  tourManager.enableTour()
}

export function startDay(day:number){
  const METHOD_NAME = "startDay" 
  log(METHOD_NAME,"day",day,"tourScheduleSetup",day,"was",REGISTRY.tourManager.day)


  if(day !== 3){
    log(METHOD_NAME,"day",day,"tourScheduleSetup","day not valid for this scene",day," ",REGISTRY.tourManager.day)
    if(day >= CONFIG.TOUR_DEFAULT_NON_EVENT_DAY){
      REGISTRY.tourManager.day = day
    }
    disableTour(REGISTRY.tourManager)
    return;
  }

  const curDayData = REGISTRY.tourManager.getDayData(day)
  const alreadyCompletedOnce = curDayData !== undefined && curDayData.completed

  if(!alreadyCompletedOnce){ 
    log(METHOD_NAME,"day",day,"tourScheduleSetup","day not valid for this scene until you complete the tour once",day," ",REGISTRY.tourManager.day)
    disableTour(REGISTRY.tourManager)
    return;
  }

  if(REGISTRY.tourManager.enabled && day ===REGISTRY.tourManager.day){
    log(METHOD_NAME,"day",day,"tourScheduleSetup","day already started!",day," ",REGISTRY.tourManager.day)
    return;
  }


  //TODO LET THEM FINISH, REGISTER NEXT TOUR DAY AS COMPLETION, ENDING OF OTHER
  disableTour(REGISTRY.tourManager)
  REGISTRY.tourManager.day = day
  REGISTRY.tourManager.setTourState(TourState.PLAYER_FIND_NPC)
  enableTour(REGISTRY.tourManager)
  //initRunAwayForDay(REGISTRY.tourManager) 
  REGISTRY.tourManager.initRewardForDay();
  

  if( completedOnce(curDayData) && curDayData!.completedOn !== undefined  ){
    log(METHOD_NAME,"day",day,"alreadyCompletedOnce",alreadyCompletedOnce,"on",curDayData!.completedOn, new Date(curDayData!.completedOn).toLocaleString())
  }else{
    log(METHOD_NAME,"day",day,"alreadyCompletedOnce",alreadyCompletedOnce,"FIRST TRY!!")
  }
  spawnRewardForDay()
    
  if(CONFIG.DEBUG_2D_PANEL_ENABLED) updateDebugTourInfo({astarNpcLoc:getAstarNpcPosition(),astarCurPlayerPos:getAstarCurrentPlayerPosition()})
} 

export function initRunAwayForDay(tourManager:TourManager) {
  log("initRunAwayForDay ENTRY")
  //debugger
  tourManager.initRewardForDay();
  tourManager.initPortals();
  resetTour(tourManager)
  moveFollowThingToStartOfSegment(tourManager)
  
  //toggleFollowThingTriggerArea();
}

const PORTAL_SHAPE_GREEN = new GLTFShape('models/WR_Green_Teleporter.glb')// new ConeShape()
const PORTAL_SHAPE_MAGENTA = new GLTFShape('models/WR_Magenta_Teleporter.glb')
//PORTAL_SHAPE.withCollisions = false


const PORTAL_DEF_GREEN:SceneItemDef={
  shape:PORTAL_SHAPE_GREEN,
  show:{name:"Teleport_Open",duration:1,autoStart:true},
  idle:{name:"Teleport_Loop",duration:-1,autoStart:false},
  close:{name:"Teleport_Close",duration:2}
}

const PORTAL_DEF_MAGENTA:SceneItemDef={
  shape:PORTAL_SHAPE_MAGENTA,
  show:{name:"Teleport_Open",duration:1,autoStart:true},
  idle:{name:"Teleport_Loop.001",duration:-1,autoStart:false},
  close:{name:"Teleport_Close",duration:1}
}

const REWARD_SHAPE = new BoxShape()
REWARD_SHAPE.withCollisions = true

 
const grandGiftYOffset = -3.5  

const grandGiftPosVisible = {
  //position: new Vector3(55.03883743286133, .465, 32.57284927368164),//centred but close to street
  //position: new Vector3(50.5, .65, 36.57284927368164),//centred closer to tree
  position: CONFIG.TOUR_LOOT_POS.clone().add(new Vector3(0,grandGiftYOffset,0)), //in front of elf
  //rotation: new Quaternion(0, 0, 0, 1),//tree
  rotation: Quaternion.Euler(0,0,0),//elf
  scale: new Vector3(2.5,2.5,2.5),
} 
  
 const grandGiftPosHidden = {
  //position: new Vector3(55.03883743286133, .465, 32.57284927368164),//centred but close to street
  //position: new Vector3(50.5, 0, 36.57284927368164),//centred closer to tree
  //position: new Vector3(2 , -3 , 2), //in front of elf
  position: CONFIG.TOUR_LOOT_POS.clone().add(new Vector3(0,grandGiftYOffset,0)), //in front of elf 
  //rotation: new Quaternion(0, 0, 0, 1),//tree
  rotation: Quaternion.Euler(0,0,0),//elf
  scale: new Vector3(.1, .01, .1),
  //scale: new Vector3(1,1,1),
  //scale: new Vector3(.005, .005, .005),
} 

export const DAYS_GIFT = new GrandGiftBox(
  'grandGift',
  grandGiftPosHidden,
  grandGiftPosVisible,
  undefined 
)

 
//const DAYS_GIFT = new GrandGiftBox()

export const _PORTAL = new Portal("testportal",PORTAL_DEF_GREEN) 
_PORTAL.placeAtEndOfSegment(new Vector3(2,4,3))
_PORTAL.hide(false,0,false)

 
function moveFollowThingToStartOfSegment(tourManager:TourManager) {
  const METHOD_NAME = "moveFollowThingToStartOfSegment"
  log(METHOD_NAME,"ENTRY")

  const day = tourManager.day 
  const dayPath = tourManager.dayPaths[day]
  let segId = 0
  if(dayPath.currSegment > 0){
    //start 1 off spawn point so that player wont spawn on them
    
    segId = 1
  }
  //const dayStartPosition = 
  const startPosAbs =  toAbsGridPos(dayPath.segmentsRel[dayPath.currSegment][segId],TOUR_CONSTANTS.PATH_OFFSET)
  const fThingTrans = getFollowThing().getComponent(Transform)
  
  //TODO only set 1 time 
  fThingTrans.position.x = startPosAbs.x
  fThingTrans.position.y = 0
  fThingTrans.position.z = startPosAbs.z

  log(METHOD_NAME,"moved to ",fThingTrans.position)
}

