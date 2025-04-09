
// this is a web worker

import {workerize} from "../workerize.js"
import {DemoSchematic} from "./types.js"

workerize<DemoSchematic>(() => ({
	async add(a, b) {
		return a + b
	},
}))

