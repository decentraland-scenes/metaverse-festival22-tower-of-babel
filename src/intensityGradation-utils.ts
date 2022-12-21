
@Component('materialIntensityGradation')
export class MaterialIntensityGradation {
    timer_ms = 0
    intensityStart = 0
    intensityTarget = 0
    interval_ms = 0

    constructor(_intensityStart: number, _intensityStop: number, _interval_ms: number) {
        this.intensityStart = _intensityStart
        this.intensityTarget = _intensityStop
        this.interval_ms = _interval_ms
        log("CREATE INTENSITY GRADATION COMPONENT: ", this.timer_ms, this.intensityStart, this.intensityTarget, this.interval_ms)
    }
}


class MaterialIntensityGradataionSystem {
    constructor() { }
    update(dt: number) {
        let entGroups = engine.getComponentGroup(MaterialIntensityGradation)
        for (let ent of entGroups.entities) {
            let gradationComponent = ent.getComponent(MaterialIntensityGradation)
            let materialComponent = ent.getComponent(Material)

            //log(gradationComponent.timer_ms, gradationComponent.intensityStart, gradationComponent.intensityTarget, gradationComponent.interval_ms)
            if (gradationComponent.timer_ms < gradationComponent.interval_ms) {
                gradationComponent.timer_ms += dt * 1000
                let percentage = gradationComponent.timer_ms / gradationComponent.interval_ms

                if (gradationComponent.intensityTarget > gradationComponent.intensityStart) {
                    materialComponent.emissiveIntensity =
                        gradationComponent.intensityStart +
                        percentage * Math.abs(gradationComponent.intensityTarget - gradationComponent.intensityStart)
                }
                else {
                    materialComponent.emissiveIntensity =
                        gradationComponent.intensityStart -
                        percentage * Math.abs(gradationComponent.intensityTarget - gradationComponent.intensityStart)
                }
                log(gradationComponent.timer_ms, gradationComponent.interval_ms, "\nPERCENTAGE: ",
                    percentage, materialComponent.emissiveIntensity, gradationComponent.intensityTarget)
            }
            if (gradationComponent.timer_ms > gradationComponent.interval_ms) {
                materialComponent.emissiveIntensity = gradationComponent.intensityTarget
                log('FINALIZE', materialComponent.emissiveIntensity, gradationComponent.intensityTarget)
            }
        }
    }
}
engine.addSystem(new MaterialIntensityGradataionSystem())