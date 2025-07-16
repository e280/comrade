
// this is a web worker

import {MySchematic} from "./schematic.js"
import {Comrade} from "../index.node.js"

await Comrade.worker<MySchematic>(() => ({
	async add(a, b) {
		return a + b
	},
}))

