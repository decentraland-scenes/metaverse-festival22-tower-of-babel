import { pivotScene } from "../pivot"
import { spectrumData } from "../spectrumEffect/spectrum_data"
import * as utils from '@dcl/ecs-scene-utils'
import { butterflySystem } from "../butterfly/butterfly"
import { videoTexture } from "./babelAudio"
//import { breathAnim, innerWall } from "./innerWall"
import { centerBall, centerBallMat } from "./centerTopBall"
import { innerWallSys } from "./innerWall"

export type SpectrumDataType = {
    sample_rate: number,
    data_length: number,
    data: number[][]
}

let lightBallCollection: Entity[] = []
let lightBallCollectionPivot = new Entity()
lightBallCollectionPivot.addComponent(new Transform({
    position: new Vector3(0, 4.83, 10.685)
}))
lightBallCollectionPivot.setParent(pivotScene)

let ballPosition = [

    new Vector3(4.5698, 3.89266, -18.6921).add(new Vector3(0, 0, 10.0982 - 0.025884)),
    new Vector3(6.71284, 3.91591, -17.1401).add(new Vector3(0, 0, 10.0982 - 0.025884)),
    new Vector3(9.57652, 3.89812, -8.39868).add(new Vector3(0, 0, 10.0982 - 0.025884)),
    new Vector3(8.76826, 3.90228, -5.89713).add(new Vector3(0, 0, 10.0982 - 0.025884)),
    new Vector3(1.32949, 3.90398, -0.469261).add(new Vector3(0, 0, 10.0982 - 0.025884)),
    new Vector3(-1.28873, 3.90551, -0.465093).add(new Vector3(0, 0, 10.0982 - 0.025884)),
    new Vector3(-8.74626, 3.90932, -5.84941).add(new Vector3(0, 0, 10.0982 - 0.025884)),
    new Vector3(-9.56936, 3.89874, -8.36619).add(new Vector3(0, 0, 10.0982 - 0.025884)),
    new Vector3(-6.74745, 3.90855, -17.1099).add(new Vector3(0, 0, 10.0982 - 0.025884)),
    new Vector3(-4.61675, 3.90487, -18.6643).add(new Vector3(0, 0, 10.0982 - 0.025884)),

    //new Vector3(-8.73093, 3.95172, 4.28288),
    //new Vector3(-9.55277, 3.92225, 1.80902),
    //new Vector3(-6.78072, 3.96689, -6.96987),
    //new Vector3(-4.64963, 3.92889, -8.53879),

    //new Vector3(4.52376, 3.96094, -8.60811),
    //new Vector3(6.68926, 3.96333, -7.0523),
    //new Vector3(9.58141, 3.98448, 1.65248),
    //new Vector3(8.77108, 3.94669, 4.19283),
    //new Vector3(1.42274, 3.96845, 9.62036),
]

for (let i = 0; i < ballPosition.length; i++) {
    const lightBallMat = new Material()
    lightBallMat.roughness = 1
    lightBallMat.albedoColor = new Color4(0.8, 0.8, 0.8, 0.8)
    lightBallMat.emissiveColor = Color3.Yellow()
    lightBallMat.emissiveIntensity = 0.1

    let lightBall = new Entity()
    lightBall.addComponent(new SphereShape())
    lightBall.addComponent(new Transform({
        position: ballPosition[i],
        scale: new Vector3(0.2, 0.2, 0.2)
    }))

    lightBall.addComponent(lightBallMat)
    lightBall.setParent(lightBallCollectionPivot)

    lightBallCollection.push(lightBall)
}

let lightParticle = new Entity()
lightParticle.addComponent(new GLTFShape("models/effects/light_particle.glb"))
lightParticle.addComponent(new Transform({
    position: new Vector3(0, 5, 10.685),
    scale: new Vector3(1, 1.25, 1)
}))

lightParticle.addComponent(new Animator())
let lightParticleAnim = new AnimationState("P0")
lightParticleAnim.playing = false
lightParticleAnim.looping = false
lightParticle.getComponent(Animator).addClip(lightParticleAnim)

lightParticle.setParent(pivotScene)

let circleTexture = new Texture("images/circle_transparent.png")
let circleEdge = new Entity()
circleEdge.addComponent(new PlaneShape())
let circleEdge2 = new Entity()
circleEdge2.addComponent(new PlaneShape())


const circleEdgeMat = new Material()
circleEdgeMat.metallic = 0.1
circleEdgeMat.roughness = 0.9
circleEdgeMat.alphaTexture = circleTexture
circleEdgeMat.albedoTexture = circleTexture
circleEdgeMat.albedoColor = Color3.White()
circleEdgeMat.emissiveColor = Color3.White()
circleEdgeMat.emissiveIntensity = 0.1

circleEdge.addComponent(new Transform({
    position: new Vector3(0, 4.83, 10.685),
    rotation: Quaternion.Euler(90, 0, 0),
    scale: new Vector3(20.1, 20.1, 20.1)
}))
circleEdge.addComponent(circleEdgeMat)
circleEdge.setParent(pivotScene)

circleEdge2.addComponent(new Transform({
    position: new Vector3(0, 4.83 + 7.88689, 10.685),
    rotation: Quaternion.Euler(90, 0, 0),
    scale: new Vector3(20.5, 20.5, 20.5)
}))
circleEdge2.addComponent(circleEdgeMat)
circleEdge2.setParent(pivotScene)

let circleCenterT = new Texture("images/circle_grad.png")
let circleCenter = new Entity()
circleCenter.addComponent(new PlaneShape())

const circleCenterMat = new Material()
circleCenterMat.metallic = 0.1
circleCenterMat.roughness = 0.9
circleCenterMat.alphaTexture = circleCenterT
circleCenterMat.albedoTexture = circleCenterT
circleCenterMat.albedoColor = Color3.White()
circleCenterMat.emissiveColor = Color3.White()
//circleCenterMat.emissiveColor = new Color3(245 / 255, 241 / 255, 220 / 255)
circleCenterMat.emissiveIntensity = 0.1

circleCenter.addComponent(new Transform({
    position: new Vector3(0, 4.83, 10.685),
    rotation: Quaternion.Euler(90, 0, 0),
    scale: new Vector3(4, 4, 4)
}))
circleCenter.addComponent(circleCenterMat)
circleCenter.setParent(pivotScene)


class EffectSystem {
    videoTime: number = 0
    isPlaying: boolean = false

    effectData: SpectrumDataType = spectrumData
    msCounter: number = 0
    dataIndex: number = 0
    currentIndex: number = 0

    beatStatus: boolean = false
    changeCount: number = 0
    beatCanChange: boolean = true

    transition: boolean = false
    constructor() {
        onVideoEvent.add((data) => {
            //log("New Video Event ", data)
            if (data.videoStatus === 4 && data.videoClipId === videoTexture.videoClipId) {
                this.isPlaying = true
                this.videoTime = data.currentOffset
            }
            else {
                this.isPlaying = false
            }
        })
    }
    start() {
        //videoTexture.seekTime(120)
        videoTexture.playing = true
        videoTexture.loop = true
    }
    stop() {
        videoTexture.playing = false
    }
    update(dt: number) {
        if (this.isPlaying) {
            this.videoTime += dt

            this.dataIndex = Math.floor(this.videoTime * 1000 / (this.effectData.sample_rate))
            if (this.dataIndex > this.effectData.data_length) { }
            else {
                if (this.dataIndex != this.currentIndex && this.dataIndex < this.effectData.data_length - 1) {
                    this.currentIndex = this.dataIndex

                    //CIRCLE SCALING
                    let startSize = circleCenter.getComponent(Transform).scale
                    let endSize = circleCenter.getComponent(Transform).scale

                    let scaleAdjust = this.effectData.data[0][this.currentIndex + 1] / 100
                    scaleAdjust = 0.25 + 3 * scaleAdjust / (scaleAdjust + 3) * 0.75
                    //scaleAdjust = utils.map(scaleAdjust, 0, 1.5, 0, 5)
                    let endScale = utils.map(this.effectData.data[0][this.currentIndex + 1] / 100, 0, 1, 3, 5)
                    endSize = new Vector3(endScale, endScale, endScale)

                    //log(this.videoTime, scaleAdjust, this.dataIndex, this.currentIndex)
                    circleCenter.addComponentOrReplace(new utils.ScaleTransformComponent(startSize, endSize, 0.8 * this.effectData.sample_rate / 1000, () => { }))
                    //entity.getComponent(Transform).scale.y = this.spectrumData.data[idx][this.currentIndex + 1] / 100

                    //TOP CENTER BALL
                    let startSizeCenterBall = centerBall.getComponent(Transform).scale
                    let endSizeCenterBall = new Vector3(endScale * 0.75, endScale * 0.75, endScale * 0.75)
                    centerBall.addComponentOrReplace(new utils.ScaleTransformComponent(startSizeCenterBall, endSizeCenterBall, 0.8 * this.effectData.sample_rate / 1000, () => { }))
                    //CENTER BALL INTENSITY
                    let intensityTarget = utils.map(scaleAdjust, 0, 1.5, 1, 20)
                    centerBallMat.emissiveIntensity = intensityTarget


                    //CIRCLE INTENSITY
                    //circleEdgeMat.emissiveIntensity = scaleAdjust * 1
                    intensityTarget = utils.map(scaleAdjust, 0, 1.5, 0, 5)

                    //log(intensityStart, intensityTarget, this.effectData.sample_rate)
                    //circleEdge.addComponentOrReplace(new MaterialIntensityGradation(intensityStart, intensityTarget, 0.4 * this.effectData.sample_rate))
                    circleEdgeMat.emissiveIntensity = intensityTarget
                    circleCenterMat.emissiveIntensity = intensityTarget * 4

                    //EMISSIVE SPHERE EFFECT
                    for (let i = 0; i < lightBallCollection.length; i++) {
                        let startSize = lightBallCollection[i].getComponent(Transform).scale
                        let endSize = lightBallCollection[i].getComponent(Transform).scale

                        //let scale = 0.15 + this.effectData.data[i + 1][this.currentIndex + 1] / 100
                        let scale = utils.map(this.effectData.data[i + 1][this.currentIndex + 1] / 100, 0, 1, 0.2, 0.3)
                        endSize = new Vector3(scale, scale, scale)
                        //sphereEmmisiveCollections[i].getComponent(Material).albedoColor = Color3.Lerp(new Color3(1 - scale, 1 - scale, 1 - scale), new Color3(scale, scale, scale), scale)

                        lightBallCollection[i].addComponentOrReplace(new utils.ScaleTransformComponent(startSize, endSize, 1.5 * this.effectData.sample_rate / 1000, () => { }))
                        scale = this.effectData.data[i + 1][this.currentIndex + 1] / 100
                        lightBallCollection[i].getComponent(Material).emissiveIntensity = utils.map(scale * scale, 0, 1.5, 0.75, 20) // utils.map(scale, 0, 1.5, 0, 40)//0.5 + 10 * scale
                    }

                    //LIGHT PARTICLE
                    //log(this.effectData.data[10][this.currentIndex + 1] / 100)
                    if (!this.transition && this.effectData.data[10][this.currentIndex + 1] / 100 > 0) {


                        this.transition = true
                        //log("TRANSITION, PLAYING PARTICLE")
                        
                        //if (!lightParticleAnim.playing) {
                        
                        let randomRotation = Math.random() * 180
                        lightParticle.getComponent(Transform).rotate(Vector3.Up(), randomRotation)

                        lightParticleAnim.reset()
                        lightParticleAnim.playing = true
                        lightParticleAnim.looping = false
                        //}
                    }
                    if (this.effectData.data[10][this.currentIndex + 1] / 100 === 0) {
                        this.transition = false
                        butterflySystem.removeRotation()
                    }
                    if (this.effectData.data[10][this.currentIndex + 1] / 100 > 0) {
                        //log("APPLY ROTATION TO BUTTERFLIES")
                        butterflySystem.applyRotation()
                    }


                    //WALL EFFECT
                    if (this.effectData.data[11][this.currentIndex + 1] / 100 >= 1) {
                        if (this.beatCanChange) {
                            if (this.beatStatus === false) {
                                //log("PLAY WALL ANIMATION")
                                //breathAnim.play(true)
                                innerWallSys.start()
                            }
                            this.beatStatus = true
                        }
                    }
                    else {
                        if (this.beatCanChange) {
                            this.beatStatus = false
                        }
                    }

                    if (!this.beatCanChange) {
                        this.changeCount += dt
                    }
                    if (this.changeCount > 0.5) {
                        this.changeCount = 0
                        this.beatCanChange = true
                    }
                }
            }
        }
    }
}
export const effectSystem = new EffectSystem()
engine.addSystem(effectSystem)