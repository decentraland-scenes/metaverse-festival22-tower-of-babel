import { pivotScene } from "../pivot";

export let particleStars = new Entity()
particleStars.addComponent(new GLTFShape("models/effects/stars_particle.glb"))
particleStars.addComponent(new Transform({
    position: new Vector3(0, 4.83, 10.685),
    scale: new Vector3(0, 0, 0)
}))
particleStars.setParent(pivotScene)