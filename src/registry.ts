import { NPC } from "@dcl/npc-scene-utils"
import { TourManager } from "./npc-tour/astarTesting"
import { Dialog } from '@dcl/npc-scene-utils'


export type NpcAnimationNameDef = {
  name:string
  duration:number
  autoStart?:boolean
}
export type NpcAnimationNameType = {
  IDLE: NpcAnimationNameDef
  WALK: NpcAnimationNameDef
  RUN: NpcAnimationNameDef
  WAVE: NpcAnimationNameDef
  HEART_WITH_HANDS: NpcAnimationNameDef
  COME_ON: NpcAnimationNameDef
}

export class Registry{
  myNPC!:NPC
  tourManager!:TourManager
  npcAnimations!:NpcAnimationNameType
  WhiteRabbitDialog!: Dialog[]
  dialogKeepUpDialogIds!:string[]
  dialogSideCommentaryDialogIds!:string[]
  dialogSideCommentaryDialogIdsPostTourComplete!:string[]

}

export const REGISTRY = new Registry()

export function initRegistry(){
  
}