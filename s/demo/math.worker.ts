
// this is a web worker

import {worker} from "../parts/worker.js"
import {MySchematic} from "./schematic.js"

await worker<MySchematic>(() => ({
	async add(a, b) {
		return a + b
	},
}))

