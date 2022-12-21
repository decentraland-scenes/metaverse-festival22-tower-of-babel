
@Component('delayUtil')
export class DelayUtil {
    elapsedTime: number
    targetTime: number
    //onTargetTimeReached: () => void

    onTimeReachedCallback?: () => void

    /**
     * @param millisecs - amount of time in milliseconds
     * @param onTimeReachedCallback - callback for when time is reached
     */
    constructor(millisecs: number, onTimeReachedCallback?: () => void) {
        this.elapsedTime = 0
        this.targetTime = millisecs / 1000

        this.onTimeReachedCallback = onTimeReachedCallback
        //this.onTargetTimeReached = () => {
        //    //this.elapsedTime = 0
        //    engine.removeSystem(this)
        //}
        engine.addSystem(this)
    }

    setCallback(onTimeReachedCallback: () => void) {
        this.onTimeReachedCallback = onTimeReachedCallback
    }
    stop() {
        engine.removeSystem(this)
    }
    /**
     * 
     * @param dt 
     * @returns false if not hit interval, true if hit interval
     */
    update(dt: number) {
        this.elapsedTime += dt
        //log(this.elapsedTime)
        if (this.elapsedTime > this.targetTime) {
            if (this.onTimeReachedCallback) this.onTimeReachedCallback()
            engine.removeSystem(this)
            //this.onTargetTimeReached()
            //return true
            //this.elapsedTime -= this.targetTime //push back
        }

        //return false;
    }

}

//log('TEST DELAY START')
//let test = new Entity()
//test.addComponent(new DelayUtil(5000, () => {
//    log("TEST DELAY EXECUTE")
//}))
//test.getComponent(DelayUtil).stop()