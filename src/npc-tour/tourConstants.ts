import { TourSchedule } from "./schedule/tourSchedule"

const ENV = "local_tiny"

export const CELL_WIDTH = 1//16 //2
export const PATH_OFFSET = CELL_WIDTH > 4 ? [2,2] : [0,0]  

export const REL_CAMERA_SHIFT_X = 0//8
export const REL_CAMERA_SHIFT_Z = 0//2
export const ABS_SHIFT_X = 0//-8*16
export const ABS_SHIFT_Z = 0//-2*16

export const TOUR_NOT_READY_HIDE_NPC_POSITION = new Vector3(2,-9,2)//make these invisible eventually
export const TOUR_NOT_READY_HIDE_NPC_SCALE = new Vector3(.5,.5,.5)
export const TOUR_NPC_POSITION_VANISH_POS = new Vector3(2,-4,2)
export const NPC_FIND_PLAYER_TO_START_MIN_DIST = 3
export const NPC_FIND_PLAYER_RECALC_DIST = 8//6//if too far from current target, redo it
export const DEBUG_BOX_SHAPE = new BoxShape()
export const TOUR_LAST_DAY_TELEPORT_COORDS = "-62,70" //tower of babel
  
DEBUG_BOX_SHAPE.withCollisions = false

export const BREADCRUMB_SHAPE = DEBUG_BOX_SHAPE//new GLTFShape("")

export const NPC_DEFAULT_WALK_SPEED = 2
export const USE_NPC_FOLLOW = true
 

export const NPC_MAX_AWAY_DISTANCE = CELL_WIDTH == 16+0 ? 34 : 8//35//4//37 //37 keeps on edge of shortest possible draw distance of 40
export const NPC_ACTIVATE_BREADCRUMB_DIST = NPC_MAX_AWAY_DISTANCE  + 2
export const NPC_TOO_FAR_AWAY = NPC_ACTIVATE_BREADCRUMB_DIST

export const NPC_ACTIVATE_DISTANCE = NPC_MAX_AWAY_DISTANCE - (CELL_WIDTH == 16+0 ? 6 : 3)//35//4//37 //37 keeps on edge of shortest possible draw distance of 40

//workaround moved here to avoid cyclic deps
//track dispensers by campaignId

export const tourSchedule = new TourSchedule()