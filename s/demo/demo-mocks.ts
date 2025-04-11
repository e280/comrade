
import {Comrade} from "../comrade.js"
import {MySchematic} from "./schematic.js"

const {work, host} = Comrade.mocks<MySchematic>({
	setupWork: (_host, _rig) => ({
		async add(a, b) {
			return a + b
		},
	}),
	setupHost: (_worker, _rig) => ({
		async mul(a, b) {
			return a * b
		},
	}),
})

console.log(await work.add(2, 3)) // 5
console.log(await host.mul(2, 3)) // 6

