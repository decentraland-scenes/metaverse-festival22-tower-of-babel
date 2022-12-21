
import { DelayUtil } from '../delay-utils'
import { pivotScene } from '../pivot'

let camera = Camera.instance

//let butterflyModel = new GLTFShape("models/butterfly/butterfly5.glb")
let circleEffectModel = new GLTFShape("models/effects/circle_butterfly.glb")



@Component('butterfly')
class ButterflyMovement {
    actice: boolean = false
    keepVelocity: number = 0
    vel: Vector3 = Vector3.Zero()
    acc: Vector3 = Vector3.Zero()

    slerpOrigin: Quaternion = Quaternion.Identity
    slerpTarget: Quaternion = Quaternion.Identity
    slerpFraction: number = 0

    applyForce(_force: Vector3) {
        this.acc.addInPlace(_force)
        this.vel.addInPlace(_force)
        this.acc = Vector3.Zero()
    }
    resetAcceleration() {
        this.acc = Vector3.Zero()
    }
    changeVelocity(_vel: Vector3) {
        this.vel = _vel
    }
}


let butterflyModels = [
    new GLTFShape("models/effects/butterfly/butterfly1.glb"),
    new GLTFShape("models/effects/butterfly/butterfly2.glb"),
    new GLTFShape("models/effects/butterfly/butterfly3.glb"),
    new GLTFShape("models/effects/butterfly/butterfly4.glb"),
    new GLTFShape("models/effects/butterfly/butterfly5.glb"),
]

let totalButterflies = [5, 5, 5, 5, 50]
let butterflyIndex = 0
let butterflyCount = 0

function addButterfly(_pivot: Entity) {
    if (butterflyCount > totalButterflies[butterflyIndex]) {
        butterflyCount = 0
        butterflyIndex += 1
    }
    butterflyCount += 1

    //log("ADDING BUTTERFLY: ", butterflyIndex, butterflyCount)

    let butterModel = butterflyModels[butterflyIndex]

    let butterfly = new Entity()
    butterfly.addComponent(butterModel)
    let circleEffect = new Entity()
    circleEffect.addComponent(circleEffectModel)


    circleEffect.addComponent(new Transform({
        position: Vector3.Zero(),
        scale: Vector3.Zero()
    }))
    circleEffect.addComponent(new Animator())
    let circleEffectAnim = new AnimationState("A1")
    circleEffect.getComponent(Animator).addClip(circleEffectAnim)

    butterfly.addComponent(new Transform({
        position: Vector3.Zero(),
        scale: Vector3.Zero()
    }))
    butterfly.addComponent(new Animator())
    let wingAnim = new AnimationState("W0")
    butterfly.getComponent(Animator).addClip(wingAnim)

    wingAnim.playing = true
    wingAnim.speed = 1.5
    wingAnim.looping = true

    circleEffectAnim.looping = false
    circleEffectAnim.playing = false

    butterfly.setParent(_pivot)
    circleEffect.setParent(_pivot)

    return {
        "butter": butterfly,
        "circle": circleEffect
    }
}


export class ButterfliesSystem {
    pivot: Entity = new Entity()
    radius: number = 10
    total: number = 10
    timeSpawnSec: number = 30
    isStart: boolean = false

    isRotate: boolean = false

    entities: any = []

    constructor(_total: number, _centerPos: Vector3, _radius: number, _timeRangeSec: number) {
        this.radius = _radius
        this.total = _total
        this.timeSpawnSec = _timeRangeSec

        this.pivot.addComponent(new Transform({
            position: _centerPos
        }))
        //this.pivot.addComponent(new BoxShape())
        this.pivot.setParent(pivotScene)
        this.init()
    }
    init() {
        for (let i = 0; i < this.total; i++) {
            this.entities.push(addButterfly(this.pivot))
        }
    }
    start() {
        if (!this.isStart) {
            log("START")
            for (let ent of this.entities) {
                let butterEnt = ent.butter as Entity
                let circleEnt = ent.circle as Entity
                butterEnt.addComponentOrReplace(new DelayUtil(randomNumber(0, 1) * this.timeSpawnSec * 1000, () => {

                    let spawnPos = new Vector3(randomInteger(-5, 5), 0, randomInteger(-5, 5))

                    circleEnt.getComponent(Animator).getClip("A1").reset()
                    circleEnt.getComponent(Animator).getClip("A1").playing = true
                    circleEnt.getComponent(Transform).position = spawnPos
                    circleEnt.getComponent(Transform).scale.setAll(2.5)

                    butterEnt.getComponent(Transform).position = spawnPos
                    butterEnt.getComponent(Transform).scale.setAll(randomNumber(0.5, 1.25))

                    butterEnt.addComponentOrReplace(new ButterflyMovement())
                    let randVector3 = new Vector3(
                        randomNumber(-2, 2),
                        randomNumber(0, 0),
                        randomNumber(-2, 2),
                    )
                    butterEnt.getComponent(ButterflyMovement).vel = randVector3.normalize().scale(1.5)
                }))
            }
        }
        this.isStart = true
    }
    stop() {
        //log("sSTOP")
        for (let entity of this.entities) {
            let butterfly = entity.butter as Entity
            butterfly.getComponent(Transform).scale.setAll(0)
            butterfly.getComponent(DelayUtil).stop()
            butterfly.removeComponent(DelayUtil)
        }

        this.isStart = false
    }
    applyRotation() {
        this.isRotate = true
    }
    removeRotation() {
        this.isRotate = false
    }
    applyRotationForce(transform: Transform, _butterflyMovement: ButterflyMovement, cw: boolean = true) {
        let angle = -90
        if (!cw) angle = 90

        let normalizePoint: Vector3 = Vector3.Zero()
        normalizePoint.copyFrom(transform.position)

        let forceVector = new Vector3(
            normalizePoint.x * Math.cos(angle) - normalizePoint.z * Math.sin(angle),
            0,
            normalizePoint.x * Math.sin(angle) + normalizePoint.z * Math.cos(angle)
        )

        _butterflyMovement.applyForce(forceVector.scale(randomNumber(0, 0.01)))//0.0025)))//0.003))
    }
    update(dt: number) {
        if (this.isStart) {
            let butterflies = engine.getComponentGroup(ButterflyMovement)

            for (let butter of butterflies.entities) {
                let butterflyMovement = butter.getComponent(ButterflyMovement)
                let transform = butter.getComponent(Transform)

                let oldPos = new Vector3(transform.position.x, transform.position.y, transform.position.z)
                let newPos = transform.position.add(butterflyMovement.vel.scale(dt))

                //transform.lookAt(new Vector3(newPos.x, transform.position.y, newPos.z))


                transform.position = newPos
                butterflyMovement.vel.addInPlace(butterflyMovement.acc.scale(dt))


                if (transform.position.y < 1) {
                    butterflyMovement.applyForce(new Vector3(0, 0.05, 0))
                    butterflyMovement.vel = butterflyMovement.vel.normalize().scale(randomNumber(0.5, 1.25))
                }

                if (transform.position.lengthSquared() >= this.radius * this.radius) {
                    let inverseForce = transform.position.scale(-1).normalize().scale(0.05)
                    butterflyMovement.applyForce(inverseForce)
                    butterflyMovement.vel = butterflyMovement.vel.normalize().scale(randomNumber(0.5, 1.25))
                }

                if (this.isRotate) {
                    this.applyRotationForce(transform, butterflyMovement)
                }

                //log(transform.position)
                butterflyMovement.keepVelocity += dt
                if (butterflyMovement.keepVelocity > 2) {
                    let randVector3 = new Vector3(
                        randomNumber(-2, 2),
                        randomNumber(-0.5, 0.5),
                        randomNumber(-2, 2)
                    )

                    butterflyMovement.applyForce(randVector3.normalize().scale(1))
                    //log(butterflyInfo.vel, butterflyInfo.acc)
                    butterflyMovement.vel = butterflyMovement.vel.normalize().scale(randomNumber(0.5, 1))

                    butterflyMovement.keepVelocity = 0
                }


                if (butterflyMovement.slerpFraction < 1) {
                    butterflyMovement.slerpFraction += dt * 2


                    transform.rotation = Quaternion.Slerp(
                        butterflyMovement.slerpOrigin,
                        butterflyMovement.slerpTarget,
                        butterflyMovement.slerpFraction
                    )
                }
                else {

                    let newTarget = Quaternion.LookRotation(
                        new Vector3(butterflyMovement.vel.x, 0, butterflyMovement.vel.z),
                        //new Vector3(newPos.x, 0, newPos.z),
                        Vector3.Up()
                    )

                    butterflyMovement.slerpOrigin.copyFrom(butterflyMovement.slerpTarget)
                    butterflyMovement.slerpTarget = newTarget
                    butterflyMovement.slerpFraction = 0
                }
            }
        }
    }
}

export let butterflySystem = new ButterfliesSystem(30, new Vector3(0, 4.83, 10.685), 9.5, 150)
engine.addSystem(butterflySystem)



function randomInteger(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomNumber(min: number, max: number) {
    return Math.random() * (max - min) + min;
}