export const pivotScene = new Entity()

export let sceneCenter = {
    x: 3 * 16 / 2,
    z: 4 * 16 / 2
}

export function setSceneOrientation(yRotation: number) {
    pivotScene.addComponent(new Transform({
        position: new Vector3(sceneCenter.x, 0, sceneCenter.z),
        rotation: Quaternion.Euler(0, yRotation, 0)
    }))
    engine.addEntity(pivotScene)
}
