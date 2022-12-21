import * as ui from '@dcl/ui-scene-utils'

import * as utils from '@dcl/ecs-scene-utils'
//import { REGISTRY } from 'src/registry'
import { CONFIG } from 'src/config'
import { REGISTRY } from 'src/registry'
import { getAndSetUserData, getUserDataFromLocal } from 'src/userData'
import { DAYS_GIFT, fetchLatestDataAndStartDay, spawnRewardForDay, startDay, TourState } from 'src/npc-tour/astarTesting'
import { fetchRemotePlayerData } from 'src/npc-tour/saveData'

const TEST_CONTROLS_ENABLE = CONFIG.TEST_CONTROLS_ENABLE 


const textFont = new Font(Fonts.SansSerif)
 
const canvas = ui.canvas


const buttonPosSTART = -350
let buttonPosCounter = buttonPosSTART
let buttonPosY = -30 //350
const buttomWidth = 121
const changeButtomWidth = 120
const changeButtomHeight = 16
 
 

function updateDebugButtonUI(testButton:ui.CustomPromptButton){
  if(changeButtomWidth>0) testButton.image.width = changeButtomWidth
  if(changeButtomHeight>0) testButton.image.height = changeButtomHeight
  testButton.label.fontSize -= 5
}
function boolShortNameOnOff(val:boolean){
  if(val) return "On"
  return "Off"
}
export async function createDebugUIButtons(){
  if(!TEST_CONTROLS_ENABLE){ 
    log("debug buttons DISABLED")
    return
  }
  log("debug buttons")

  if( getUserDataFromLocal() === undefined){
    await getAndSetUserData();
  }
  let wallet = getUserDataFromLocal()?.publicKey;
  if (wallet) wallet = wallet.toLowerCase();
  let allowed = false;
  for (const p in CONFIG.ADMINS) {
    if (CONFIG.ADMINS[p] == "any") {
      allowed = true;
      break;
    }
    if (wallet == CONFIG.ADMINS[p]?.toLowerCase()) {
      allowed = true;
      break;
    }
  }

  log("debug.allowed ", allowed, wallet);
  if (!allowed) return;

  let testButton:ui.CustomPromptButton|null = null
  
  const testControlsToggle = new ui.CustomPrompt(ui.PromptStyles.DARKLARGE,1,1)
  
  
  testControlsToggle.background.positionY = 350
  //testControls.background.visible = false
  testControlsToggle.closeIcon.visible = false
  //testControls.addText('Who should get a gift?', 0, 280, Color4.Red(), 30)
  //const pickBoxText:ui.CustomPromptText = testControls.addText("_It's an important decision_", 0, 260)  
   
  
  const enableDisableToggle = testButton = testControlsToggle.addButton(
    'show:true',
    buttonPosCounter,
    buttonPosY,
    () => { 
      log("enableDisableToggle " + testControls.background.visible)
      if(testControls.background.visible){
        testControls.hide()
        testControls.closeIcon.visible = testControls.background.visible
      }else{
        testControls.show()
        testControls.closeIcon.visible = testControls.background.visible
      }
      enableDisableToggle.label.value='show:'+!testControls.background.visible
    }, 
    ui.ButtonStyles.RED
  )
  if(changeButtomWidth>0) testButton.image.width = changeButtomWidth
  if(changeButtomHeight>0) testButton.image.height = changeButtomHeight
  
  buttonPosCounter += buttomWidth
    
    
  
  const testControls = new ui.CustomPrompt(ui.PromptStyles.DARKLARGE,1,1)
  
  //testControls.hide()
  
  testControls.background.positionY = 350  
  //testControls.background.visible = false
  testControls.closeIcon.visible = false
  //testControls.addText('Who should get a gift?', 0, 280, Color4.Red(), 30)
  //const pickBoxText:ui.CustomPromptText = testControls.addText("_It's an important decision_", 0, 260)  
  
  testControls.background.positionY = 350
  //testControls.background.visible = false
  testControls.closeIcon.visible = false
  //testControls.addText('Who should get a gift?', 0, 280, Color4.Red(), 30)
  //const pickBoxText:ui.CustomPromptText = testControls.addText("_It's an important decision_", 0, 260)  
  

  //type TourState = 'not-init'|'tour-not-ready'|'tour-npc-waiting'|'find-to-ask'|'ask-tour'|'touring'|'tour-completed'|'tour-declined'

  testButton = testControls.addButton(
    TourState.TOUR_OFF,
    buttonPosCounter,
    buttonPosY,
    () => { 
      REGISTRY.tourManager.setTourState(TourState.TOUR_OFF)
    },
    ui.ButtonStyles.RED
  )
  updateDebugButtonUI(testButton)
  buttonPosCounter += buttomWidth //next column

  testButton = testControls.addButton(
    "FetchStart",
    buttonPosCounter,
    buttonPosY,
    () => { 
      fetchLatestDataAndStartDay() 
    },
    ui.ButtonStyles.RED
  )
  updateDebugButtonUI(testButton)
  buttonPosCounter += buttomWidth //next column
  

  //NEW ROW//NEW ROW
  buttonPosY -= changeButtomHeight + 2;
  buttonPosCounter = buttonPosSTART;

  testButton = testControls.addButton(
    "Day_0",
    buttonPosCounter,
    buttonPosY,
    () => { 
      startDay( 0 )
    },
    ui.ButtonStyles.RED
  )
  updateDebugButtonUI(testButton)
  buttonPosCounter += buttomWidth //next column


  testButton = testControls.addButton(
    "Day_1",
    buttonPosCounter,
    buttonPosY,
    () => { 
      startDay( 1 )
    },
    ui.ButtonStyles.RED
  )
  updateDebugButtonUI(testButton)
  buttonPosCounter += buttomWidth //next column
  //
  testButton = testControls.addButton(
    "Day_2",
    buttonPosCounter,
    buttonPosY,
    () => { 
      startDay( 2 )
    },
    ui.ButtonStyles.RED
  )
  updateDebugButtonUI(testButton)
  buttonPosCounter += buttomWidth //next column
  //
  
  testButton = testControls.addButton(
    "Day_3",
    buttonPosCounter,
    buttonPosY,
    () => { 
      startDay( 3 )
    },
    ui.ButtonStyles.RED
  )
  updateDebugButtonUI(testButton)
  buttonPosCounter += buttomWidth //next column
  //
  

  testButton = testControls.addButton(
    "Day_4;non-event",
    buttonPosCounter,
    buttonPosY,
    () => { 
      startDay( 4 )
    },
    ui.ButtonStyles.RED
  )
  updateDebugButtonUI(testButton)
  buttonPosCounter += buttomWidth //next column
  //
  testButton = testControls.addButton(
    "Claim",
    buttonPosCounter,
    buttonPosY,
    () => { 
      REGISTRY.tourManager.initRewardForDay();
      spawnRewardForDay()
    },
    ui.ButtonStyles.RED
  )
  updateDebugButtonUI(testButton)
  buttonPosCounter += buttomWidth //next column
  //


  //NEW ROW//NEW ROW
  buttonPosY -= changeButtomHeight + 2;
  buttonPosCounter = buttonPosSTART;
    
  //
  testButton = testControls.addButton(
    "G:SHOW",
    buttonPosCounter,
    buttonPosY,
    () => { 
      DAYS_GIFT.show()
    },
    ui.ButtonStyles.RED
  )
  updateDebugButtonUI(testButton)
  buttonPosCounter += buttomWidth //next column


  //
  testButton = testControls.addButton(
    "G:HIDE",
    buttonPosCounter,
    buttonPosY,
    () => { 
      DAYS_GIFT.hide()
    },
    ui.ButtonStyles.RED
  )
  updateDebugButtonUI(testButton)
  buttonPosCounter += buttomWidth //next column
  

  //
  testButton = testControls.addButton(
    "TO:TOWER",
    buttonPosCounter,
    buttonPosY,
    () => { 
      REGISTRY.tourManager.movePlayerToTower()
    },
    ui.ButtonStyles.RED
  )
  updateDebugButtonUI(testButton)
  buttonPosCounter += buttomWidth //next column
  
  
} 
 
