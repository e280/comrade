
// this is a web worker

import {ExposedError} from "@e280/renraku"
import {MySchematic} from "./schematic.js"
import {Comrade} from "../index.node.js"

await Comrade.worker<MySchematic>(shell => ({
	async add(a, b) {
		const six = await shell.host.mul(2, 3)
		if (six !== 6)
			throw new ExposedError("host mul failed")
		return a + b
	},
}))

