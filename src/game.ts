import * as ui from '@dcl/ui-scene-utils'
import * as utils from '@dcl/ecs-scene-utils'
import { isPreviewMode } from '@decentraland/EnvironmentAPI'
import { CONFIG, initConfig } from "./config"

import { IntervalUtil } from "./interval-util"
import { createDebugUIButtons } from './ui/ui-hud-debugger'


import { pivotScene, setSceneOrientation } from './pivot'
import { butterflySystem } from './butterfly/butterfly'
import { effectSystem } from './effect/effects'
import { setupNPC } from './npc-tour/npcSetup'
import { initDialogs } from './npc-tour/npcDialog'
import { bootStrapClaimingDropins } from './claiming-dropin/bootstrapClaiming'
import { setupTour } from './npc-tour/astarTesting'
import { initTourScheduler, startTourScheduler } from './npc-tour/schedule/tourScheduleSetup'
import { loadShowTourDebugUI } from './npc-tour/debugUI'
import { initRegistry, REGISTRY } from './registry'
//import { innerWall } from './effect/innerWall'
import { particleStars } from './effect/starsParticle'
import { wallEntities, wallPattern } from './effect/innerWall'

initConfig()
 
const basePosition = CONFIG.centerGround.clone()////.add(new Vector3(16,.5,16))//new Vector3(16*11 ,0,16*11)//
//leaving this here as i assume will have a base "static ground model"
const baseShape = new PlaneShape()//new GLTFShape('models/mvmf_roads.glb') 


const USE_TEMP_LOADER = true
const START_SCALE=Vector3.One().scale(.01)
const tempLoadNow = new Entity()
// add a shape to the entity
tempLoadNow.addComponent(baseShape)
// add the entity to the engine
if(USE_TEMP_LOADER) engine.addEntity(tempLoadNow)
tempLoadNow.addComponent(new Transform({  
  position: new Vector3(8,0,8),
  scale: START_SCALE,
  //rotation: Quaternion.Euler(0,180,0)
}))  
  
export const _scene = new Entity('_scene')
engine.addEntity(_scene)
const transform = new Transform({
  position: new Vector3(0, 0, 0),
  rotation: Quaternion.Euler(0, 0, 0),
  scale: new Vector3(1, 1, 1),
})
_scene.addComponentOrReplace(transform)

export let parent = new Entity()
parent.addComponent(
  new Transform({
    position: new Vector3(0, 0, 0),
    rotation: Quaternion.Euler(0, 0, 0),
  })
)
engine.addEntity(parent)

const TOWER_ENTITY_POS = new Vector3(48/2, 0, 64/2)
const TOWER_ENTITY_ROT = Quaternion.Euler(0, 270, 0)

/*
//removing loot, using Present class for it
export let base_tower_loot = new Entity()
base_tower_loot.addComponent(new GLTFShape('models/out/base_tower_loot.glb'))
base_tower_loot.addComponent(
  new Transform({
    position: TOWER_ENTITY_POS,
    rotation: TOWER_ENTITY_ROT,
  })
)
engine.addEntity(base_tower_loot)
base_tower_loot.setParent(parent)
*/

export let baseTower = new Entity()
baseTower.addComponent(new GLTFShape("models/out/base.glb"))
baseTower.addComponent(new Transform({
    position: TOWER_ENTITY_POS,
    rotation: TOWER_ENTITY_ROT,
}))
export let tree = new Entity()
tree.addComponent(new GLTFShape("models/out/tree.glb"))
tree.addComponent(new Transform({
    position: TOWER_ENTITY_POS,
    rotation: TOWER_ENTITY_ROT,
}))
engine.addEntity(baseTower)
engine.addEntity(tree)

// Base Tower of hatch
export let base_tower_hatch = new Entity()
base_tower_hatch.addComponent(new GLTFShape('models/base_tower_hatch.glb'))
base_tower_hatch.addComponent(
    new Transform({
        position: TOWER_ENTITY_POS,
        rotation: TOWER_ENTITY_ROT,
    })
)
engine.addEntity(base_tower_hatch)

// Base Tower of Antenna
export let base_tower_antenna = new Entity()
base_tower_antenna.addComponent(new GLTFShape('models/out/base_tower_antenna.glb'))
base_tower_antenna.addComponent(
    new Transform({
        position: TOWER_ENTITY_POS,
        rotation: TOWER_ENTITY_ROT,
    })
)
engine.addEntity(base_tower_antenna)

//// Base Tower Trees

////TREE 01

//export let base_tower_tree_01 = new Entity()
//base_tower_tree_01.addComponent(new GLTFShape('models/out/base_tower_tree_01.glb'))
//base_tower_tree_01.addComponent(
//  new Transform({
//    position: TOWER_ENTITY_POS,
//    rotation: TOWER_ENTITY_ROT,
//  })
//)
//engine.addEntity(base_tower_tree_01)
//base_tower_tree_01.setParent(parent)

////TREE 02
//export let base_tower_tree_02 = new Entity()
//base_tower_tree_02.addComponent(new GLTFShape('models/out/base_tower_tree_02.glb'))
//base_tower_tree_02.addComponent(
//  new Transform({
//    position: TOWER_ENTITY_POS,
//    rotation: TOWER_ENTITY_ROT,
//  })
//)
//engine.addEntity(base_tower_tree_02)
//base_tower_tree_02.setParent(parent)

////TREE 03
//export let base_tower_tree_03 = new Entity()
//base_tower_tree_03.addComponent(new GLTFShape('models/out/base_tower_tree_03.glb'))
//base_tower_tree_03.addComponent(
//  new Transform({
//    position: TOWER_ENTITY_POS,
//    rotation: TOWER_ENTITY_ROT,
//  })
//)
//engine.addEntity(base_tower_tree_03)
//base_tower_tree_03.setParent(parent)

////TREE 04

//export let base_tower_tree_04 = new Entity()
//base_tower_tree_04.addComponent(new GLTFShape('models/out/base_tower_tree_04.glb'))
//base_tower_tree_04.addComponent(
//  new Transform({
//    position: TOWER_ENTITY_POS,
//    rotation: TOWER_ENTITY_ROT,
//  })
//)
//engine.addEntity(base_tower_tree_04)
//base_tower_tree_04.setParent(parent)

//// Tower of Babel Details

//export let base_tower_details = new Entity()
//base_tower_details.addComponent(new GLTFShape('models/out/base_tower_details.glb'))
//base_tower_details.addComponent(
//  new Transform({
//    position: TOWER_ENTITY_POS,
//    rotation: TOWER_ENTITY_ROT,
//  })
//)
//engine.addEntity(base_tower_details)
//base_tower_details.setParent(parent)


async function init(){
  log("init called")

   
  initRegistry() 
  setupNPC() 
  initDialogs()
  
  bootStrapClaimingDropins()
  //initSceneClaiming()
  //initArches()
  

  //async this
  executeTask(async () => {
    
    loadShowTourDebugUI()
    try{
      createDebugUIButtons()
    }catch(e){
      log("createDebugUIButtons failed!!!",e)
    }

    await setupTour()
    //initTourScheduler()
    //startTourScheduler()



  })
  
  

  // create the entity
  const baseScene = new Entity()
  // add a transform to the entity
  baseScene.addComponent(new Transform({ 
    position: basePosition,
    scale: Vector3.One().scale(.01),
    rotation: Quaternion.Euler(0,180,0)
  })) 
      
  baseScene.addComponent(new utils.Delay(200,()=>{
    const sizeUpScale = new Vector3(1,0,1)  
    baseScene.getComponent(Transform).scale = sizeUpScale
    baseScene.addComponentOrReplace(new utils.ScaleTransformComponent(sizeUpScale,Vector3.One(),1))
    
  }))
  // add a shape to the entity
  baseScene.addComponent(baseShape)
  // add the entity to the engine
  engine.addEntity(baseScene)

  engine.removeEntity(tempLoadNow)
}

if(USE_TEMP_LOADER){
  //due to red box appearing on load and fear it wont render in scene going to defer till engine started
  tempLoadNow.addComponent(new utils.Delay(0,()=>{
    init() 
  }))
}else{
  init() 
}
/*
const groundPlaceHolder = spawnCube(CONFIG.sizeX/2, .1, CONFIG.sizeZ/2)
groundPlaceHolder.getComponent(Transform).scale = new Vector3(CONFIG.sizeX, .1, CONFIG.sizeZ)

const greenMat:Material = new Material()
greenMat.albedoColor = Color4.Green()
groundPlaceHolder.addComponent( greenMat )*/

isPreviewMode().then( (val:boolean)=>{
  if(val){
    const movePlayerTest = new Entity()
    // add a transform to the entity
    movePlayerTest.addComponent(new BoxShape())
    movePlayerTest.addComponent(new Transform({ 
      position: new Vector3(2,1 ,41),
      scale: Vector3.One(),
      rotation: Quaternion.Euler(0,0,0)
    }))  
    
    movePlayerTest.addComponent(new OnPointerDown(()=>{
      REGISTRY.tourManager.movePlayerToTower()
    },{
      hoverText:"to loot"
    }))
    engine.addEntity(movePlayerTest)
  }
})



//INSIDE TOWER EXPERIENCE


setSceneOrientation(0)
//ADDING BUTTERFLY
let triggerEnter = new Entity()
triggerEnter.addComponent(new Transform({
    position: new Vector3(0, 0, 0)
}))
triggerEnter.setParent(butterflySystem.pivot)
let triggerAreaEnter = new utils.TriggerSphereShape(10, Vector3.Zero())
triggerEnter.addComponent(
    new utils.TriggerComponent(
        triggerAreaEnter,
        {
            onCameraEnter: () => {
                //scale inner wall to 1
                //innerWall.getComponent(Transform).scale.setAll(1)
                particleStars.getComponent(Transform).scale.setAll(1)
                wallEntities[0].getComponent(GLTFShape).visible = true
                wallPattern.getComponent(GLTFShape).visible = true


                effectSystem.start()
                butterflySystem.start()
            },
            enableDebug: false
        }
    )
)

let triggerExit = new Entity()
triggerExit.addComponent(new Transform({
    position: new Vector3(0, 0, 0)
}))
triggerExit.setParent(butterflySystem.pivot)
let triggerAreaExit = new utils.TriggerSphereShape(14, Vector3.Zero())
triggerExit.addComponent(
    new utils.TriggerComponent(
        triggerAreaExit,
        {
            onCameraExit: () => {
                effectSystem.stop()
                butterflySystem.stop()
            },
            enableDebug: false
        }
    )
)
