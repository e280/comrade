
import {ExposedError} from "@e280/renraku"
import {MySchematic} from "./schematic.js"
import {SetupWork} from "../parts/types.js"

export const setupMathWork: SetupWork<MySchematic> = shell => ({
	async add(a, b) {
		const six = await shell.host.mul(2, 3)

		if (six !== 6)
			throw new ExposedError("host mul failed")

		return a + b
	},
})

