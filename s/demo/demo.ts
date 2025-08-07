
// create a pool of web workers, and call functions on it

import {MySchematic} from "./schematic.js"
import {Comrade} from "../index.browser.js"

const cluster = await Comrade.cluster<MySchematic>({
	workerUrl: new URL("./math-browser.worker.js", import.meta.url),
	setupHost: () => ({
		async mul(a: number, b: number) {
			return a * b
		},
	}),
})

const x = await cluster.work.add(2, 3)
console.log(x) // 5

cluster.terminate()

