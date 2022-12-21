
//VIDEO CONTAIN ONLY TOWER OF BABEL AUDIO CLIP

const babelClip = new VideoClip("https://player.vimeo.com/external/768653933.m3u8?s=d14d75616ee83229785bdb7b358cf46833a4815a")
export const videoTexture = new VideoTexture(babelClip)
//log("VIDEO ID: ", videoTexture.videoClipId)
const myMaterial = new Material()
myMaterial.albedoTexture = videoTexture
myMaterial.roughness = 1

const screen = new Entity()
screen.addComponent(new PlaneShape())
screen.addComponent(new Transform({
    position: new Vector3(0, -10, 0),
    scale: new Vector3(0, 0, 0)
}))
screen.addComponent(myMaterial)
engine.addEntity(screen)
