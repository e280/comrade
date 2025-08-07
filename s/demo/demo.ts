
// create a pool of web workers, and call functions on it

import {Comrade} from "../index.browser.js"
import {MathSchematic, setupHost} from "./math.js"

const cluster = await Comrade.cluster<MathSchematic>({
	workerUrl: new URL("./math-browser.worker.js", import.meta.url),
	setupHost,
})

const x = await cluster.work.add(2, 3)
console.log(x) // 5

cluster.terminate()

