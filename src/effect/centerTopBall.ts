import { pivotScene } from "../pivot"


export const centerBallMat = new Material()
centerBallMat.roughness = 1
centerBallMat.albedoColor = new Color4(0.8, 0.8, 0.8, 0.8)
centerBallMat.emissiveColor = Color3.Yellow()
centerBallMat.emissiveIntensity = 1

export const centerBall = new Entity()
centerBall.addComponent(new SphereShape())
centerBall.addComponent(new Transform({
    position: new Vector3(0, 4.83 + 18, 10.685),
    scale: new Vector3(1, 1, 1)
}))

centerBall.addComponent(centerBallMat)
centerBall.setParent(pivotScene)