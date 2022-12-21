
import { Logger, LoggerFactory } from 'src/claiming-dropin/logging/logging';
import { TourSchedule } from './tourSchedule';
import { TourDayType, ShowMatchRangeResult } from './types';
import { CONFIG } from 'src/config';
import { REGISTRY } from 'src/registry';
import { disableTour, enableTour, initRunAwayForDay, TourState } from '../astarTesting';


export let adminList = ["ADMIN_LIST_ADDRESS_1", "ADMIN_LIST_ADDRESS_2", "ADMIN_LIST_ADDRESS_3"]

 
const CLASSNAME = "TourSchedulerSystem"
export class TourSchedulerSystem implements ISystem{
  
  campaignSchedule:TourSchedule
  logger:Logger
  currentlyPlaying?:TourDayType

  intermissionStarted = false
  countdownStarted = false
  lastShowIdx = -1
 
  timeLapse = 0
  checkIntervalSeconds = 1

  enabled:boolean = true

  lastShowMatch:ShowMatchRangeResult = {} //cache to avoid creating new objects over and over 

  //day:any

  constructor(showSchedule:TourSchedule){
      //this.days= days 
      this.campaignSchedule = showSchedule
      //this.showsSorted = this.showMgr.showSchedule.shows//showData.shows.sort((a, b) => (a.startTime < b.startTime) ? -1 : 1);
      this.logger = LoggerFactory.getLogger("TourSchedulerSystem")
  }
  reset(){
    this.lastShowIdx = 0
    this.timeLapse = 0
  }
  pause(){
    this.enabled = false
  }
  play(){
    this.enabled = true
  }
  update(dt:number){
    //log("scheduler called")
    if(!this.enabled) return
    
    this.timeLapse += dt
    
    if(this.timeLapse < this.checkIntervalSeconds){
      return
    }
    this.timeLapse -= this.checkIntervalSeconds

    let activeCount = 0
    //FIND NEAREST SHOW THAT HAS NOT STARTED
    //FIND SHOW THAT STARTED
    //IF NO SHOWS NOT STARTED, END
    //IF NEAREST NOT ST
    //
 
    const date = new Date()
    
    const showMatch = this.lastShowMatch = this.campaignSchedule.findShowToPlayByDateInPlace( this.lastShowMatch, date,this.lastShowIdx )

    //log("showMatch",showMatch) 

    if(showMatch && showMatch.lastShow && showMatch.lastShow.show && showMatch.lastShow.index !== undefined){
      //update index for faster checking
      this.lastShowIdx = showMatch.lastShow.index
    }

    this.processShow(showMatch)
    
  }
  processShow(showMatch:ShowMatchRangeResult){
    const METHOD_NAME="processShow"
    if(!showMatch){
      return
    }
    if(showMatch.currentShow && showMatch.currentShow.show){
      ///this.started = true
      //this.intermissionStarted = false
      //this.countdownStarted = false

      if((!this.currentlyPlaying) || showMatch.currentShow.show.refId !== this.currentlyPlaying.refId){
        this.logger.info(METHOD_NAME,'starting show', showMatch)
        const showToPlay = showMatch.currentShow.show
        //const currentlyPlaying = this.showMgr.isCurrentlyPlaying(showToPlay)
        //if(!currentlyPlaying){
          this.startShow(showToPlay)
        //}else{
        //  this.logger.trace(METHOD_NAME,'did not play show, already playing or was null',this.currentlyPlaying,showToPlay)
        //}
      }else{
        //log('already running show', showMatch)
      } 
    }else{
      if(showMatch.nextShow && showMatch.nextShow.show){
        this.logger.trace(METHOD_NAME,'waiting till show start',showMatch)
          //this.intermissionStarted = true
          this.onNoShowToPlay(showMatch)
      }
 
      //this.showMgr.startCountdown(closestNotStartedShow.startTime)
      
    }
    
    if(showMatch === undefined || 
        ((showMatch.currentShow === undefined || showMatch.currentShow.show === undefined) && (showMatch.nextShow === undefined || showMatch.nextShow.show === undefined))){
      this.onOutOfShowsToPlay()
    }
  }
  startShow(showToPlay:TourDayType){
    const METHOD_NAME="startShow"
    //this.logger.trace(METHOD_NAME,'ENTRY',showToPlay)
    log(CLASSNAME,METHOD_NAME,'ENTRY',showToPlay)

    this.currentlyPlaying = showToPlay
    /*const currentlyPlaying = this.showMgr.isDefaultVideoPlaying()
    if(!currentlyPlaying){
      this.showMgr.playDefaultVideo()
    }else{
      this.logger.trace(METHOD_NAME,'did not play default show, already playing or was null',currentlyPlaying)
    }*/

    //TODO LET THEM FINISH, REGISTER NEXT TOUR DAY AS COMPLETION, ENDING OF OTHER
    disableTour(REGISTRY.tourManager)
    REGISTRY.tourManager.day = showToPlay.day
    REGISTRY.tourManager.setTourState(TourState.PLAYER_FIND_NPC)
    enableTour(REGISTRY.tourManager)
    initRunAwayForDay(REGISTRY.tourManager)  

    for(const p in showToPlay.campaigns){
      const camp = showToPlay.campaigns[p]
      /*
      const instArr = dispenserRefIdInstRecord[camp.refId]
      if(instArr){
        for(const p in instArr){
          const inst = instArr[p]
          log(METHOD_NAME,'found',camp.refId,"to update",camp,inst)
          inst.dispData.claimConfig.campaign = camp.campaignId
          inst.dispData.claimConfig.campaignKeys = {key1:camp.campaignKey}

          inst.dispData.claimData.campaign = camp.campaignId
          inst.dispData.claimData.campaign_key = camp.campaignKey 
          
          let onPointerDownObj:OnPointerDown|undefined
          if(idDispenser(inst.entity)){
            if(inst.entity.button.hasComponent(OnPointerDown)){
              onPointerDownObj = inst.entity.button.getComponent(OnPointerDown)
            }
          }else if(inst.entity instanceof Entity){
            if(inst.entity.hasComponent(OnPointerDown)){
              onPointerDownObj = inst.entity.getComponent(OnPointerDown)
            }
          }
          if(onPointerDownObj !== undefined){
            if(CONFIG.CLAIM_TESTING_ENABLED){
              onPointerDownObj.hoverText += "(" + showToPlay.refId +"!)"
            }
            
          }
        }
      }else{
        this.logger.error(METHOD_NAME,'WARNING! could not find',camp.refId,"to update",camp)
      }*/
    }
  }

  onNoShowToPlay(showMatch:ShowMatchRangeResult){
    const METHOD_NAME="onNoShowToPlay"
    log(CLASSNAME,METHOD_NAME,'ENTRY',showMatch,this.lastShowMatch,this.lastShowIdx)
    /*const currentlyPlaying = this.showMgr.isDefaultVideoPlaying()
    if(!currentlyPlaying){
      this.showMgr.playDefaultVideo()
    }else{
      this.logger.trace(METHOD_NAME,'did not play default show, already playing or was null',currentlyPlaying)
    }*/

    //just leave what ever was running running
    //REGISTRY.tourManager.setTourState(TourState.TOUR_OFF)
  }

  onOutOfShowsToPlay(){
    const METHOD_NAME="onOutOfShowsToPlay"
    log(CLASSNAME,METHOD_NAME,'ENTRY')
    log(CLASSNAME,"no more days, stop system")
    engine.removeSystem(this)
    /*if(!this.intermissionStarted){
      this.intermissionStarted = true
      this.showMgr.playDefaultVideo()
    }*/
  }
}
