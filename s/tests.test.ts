
import {Science, test, expect} from "@e280/science"

import {Comrade} from "./index.node.js"
import {MySchematic} from "./demo/schematic.js"

await Science.run({
	"spin up a cluster, call one fn": test(async() => {
		const cluster = await Comrade.cluster<MySchematic>({
			workerUrl: new URL("./demo/math-node.worker.js", import.meta.url),
			setupHost: () => ({
				async mul(a: number, b: number) {
					return a * b
				},
			}),
		})
		const x = await cluster.work.add(2, 3)
		expect(x).is(5)
		cluster.terminate()
	}),

	"mocks": test(async() => {
		const {work, host} = Comrade.mocks<MySchematic>({
			setupWork: _shell => ({
				async add(a, b) {
					return a + b
				},
			}),
			setupHost: _shell => ({
				async mul(a, b) {
					return a * b
				},
			}),
		})
		expect(await work.add(2, 3)).is(5)
		expect(await host.mul(2, 3)).is(6)
	}),
})

