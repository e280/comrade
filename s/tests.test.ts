
import {Science, test, expect} from "@e280/science"

import {Comrade} from "./index.node.js"
import {MathSchematic, setupHost} from "./demo/math.js"

const workerUrl = new URL("./demo/math-node.worker.js", import.meta.url)

await Science.run({
	"thread fn call": test(async() => {
		const thread = await Comrade.thread<MathSchematic>({
			workerUrl,
			setupHost,
		})
		const x = await thread.work.add(2, 3)
		expect(x).is(5)
		thread.terminate()
	}),

	"cluster fn call": test(async() => {
		const cluster = await Comrade.cluster<MathSchematic>({
			workerUrl,
			setupHost,
		})
		const x = await cluster.work.add(2, 3)
		expect(x).is(5)
		cluster.terminate()
	}),

	"mocks": test(async() => {
		const {work, host} = Comrade.mocks<MathSchematic>({
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

