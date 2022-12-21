import { pivotScene } from "../pivot"


////ADDING INNER WALL
//export let innerWall = new Entity()
//innerWall.addComponent(new GLTFShape('models/effects/inner_wall.glb'))
//innerWall.addComponent(
//    new Transform({
//        scale: Vector3.Zero(),
//        position: new Vector3(0, 4.83, 10.685)
//    })
//)
//innerWall.getComponent(GLTFShape).visible = false
//innerWall.setParent(pivotScene)

//innerWall.addComponent(new Animator())

//export let breathAnim = new AnimationState("breath")
//export let lightAnim = new AnimationState("light")
//export let dimAnim = new AnimationState("dim")

//breathAnim.looping = false
//lightAnim.looping = false
//dimAnim.looping = false

//innerWall.getComponent(Animator).addClip(breathAnim)
//innerWall.getComponent(Animator).addClip(lightAnim)
//innerWall.getComponent(Animator).addClip(dimAnim)


//////

export let wallEntities: Entity[] = []

export let wallPattern = new Entity()
wallPattern.addComponent(new GLTFShape("models/wall/wall_pattern.glb"))
wallPattern.getComponent(GLTFShape).visible = false
wallPattern.addComponent(new Transform({
    position: new Vector3(24, 0, 32).add(new Vector3(0, 4.83, 10.685).add(new Vector3(0, 0, 10.0982 - 0.025884)))
}))
engine.addEntity(wallPattern)

for (let i = 0; i < 6; i++) {
    let wallIntensity = new Entity()
    //log("CREATE WALL"+i)
    wallIntensity.addComponent(new GLTFShape("models/wall/wall" + i.toString() + ".glb"))
    wallIntensity.addComponent(new Transform({
        position: new Vector3(24, 0, 32).add(new Vector3(0, 4.83, 10.685).add(new Vector3(0, 0, 10.0982)))
    }))
    //if(i !== 0)
        wallIntensity.getComponent(GLTFShape).visible = false
    engine.addEntity(wallIntensity)

    wallEntities.push(wallIntensity)
}


class InnerWallSystem {
    isStart: boolean = false
    sequence: number = 1 //1 = wall brighter, 2 = wall dimmer, 3 = idle

    sequence1Timer: number = 0
    sequence1State: number = 0
    maxsequenc1: number = 6

    sequence2Timer: number = 0
    sequence2State: number = 0
    maxsequenc2: number = 6

    constructor() {}
    start() {
        this.isStart = true

        this.sequence = 1
        this.sequence1Timer = 0
        this.sequence1State = 0
        this.sequence2Timer = 0
        this.sequence2State= 0
    }
    hideWallExcept(wallNum: number) {
        wallEntities[wallNum].getComponent(GLTFShape).visible = true
        for (let i = 0; i < wallEntities.length; i++) {
            if(i !== wallNum)
                wallEntities[i].getComponent(GLTFShape).visible = false
        }
    }
    update(dt: number) {
        if (this.isStart) {
            if (this.sequence === 1) {
                //log("SEQUENCE 1", this.sequence1Timer)
                this.sequence1Timer += dt

                if (this.sequence1Timer > 0.1) {
                    //log("sequence1, ", this.sequence1State)
                    if (this.sequence1State > 4) {
                        this.sequence = 2
                    }
                    else {
                        this.hideWallExcept(this.sequence1State + 1)
                        //wallEntities[this.sequence1State + 1].getComponent(GLTFShape).visible = true
                    }
                    this.sequence1State += 1
                    this.sequence1Timer = 0
                }
            }
            if (this.sequence === 2) {
                this.sequence2Timer += dt

                if (this.sequence2Timer > 0.15) {
                    //log("sequence2, ", this.sequence2State)
                    if (this.sequence2State > 4) {
                        this.sequence = 3
                    }
                    else {
                        this.hideWallExcept(5 - this.sequence2State)
                        //wallEntities[6 - this.sequence2State].getComponent(GLTFShape).visible = false
                    }
                    this.sequence2State += 1
                    this.sequence2Timer = 0
                }
            }

            if (this.sequence === 3) {
                this.isStart = false
                //idle, do nothing
            }
        }
    }
}

export let innerWallSys = new InnerWallSystem()
engine.addSystem(innerWallSys)