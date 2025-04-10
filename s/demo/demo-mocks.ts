
import {mockSetup} from "../parts/setup.js"
import {MySchematic} from "./schematic.js"

const {worker, main} = mockSetup<MySchematic>({
	setupWorkerFns: () => ({
		async add(a, b) {
			return a + b
		},
	}),
	setupMainFns: () => ({
		async mul(a, b) {
			return a * b
		},
	}),
})

console.log(await worker.add(2, 3)) // 5
console.log(await main.mul(2, 3)) // 6

