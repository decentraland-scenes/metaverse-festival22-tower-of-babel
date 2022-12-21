import { DispenserPos } from "src/claiming-dropin/claiming/claimTypes"
import { Portal } from "./portal"

export type GridPosition=number[]


export type DayPathData={
    day:number
    isLastDay?:boolean
    dropLootBox:boolean
    isEventDay:boolean
    currSegment:number
    segmentsAbs:GridPosition[][]
    segmentsRel:GridPosition[][]
    completed:boolean
    completedOn?:number//timestamp in ms
    portals:Record<string,Portal>
    claimConfig?:DispenserPos
  }