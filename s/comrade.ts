
import {mock, Remote, Rig} from "renraku"
import {worker} from "./worker.js"
import {Cluster} from "./cluster.js"
import {Thread} from "./parts/thread.js"
import {Mocks, Schematic, SetupHost, SetupWork} from "./parts/types.js"

export const Comrade = {
	work: <S extends Schematic>(fn: SetupWork<S>) => fn,
	host: <S extends Schematic>(fn: SetupHost<S>) => fn,

	worker,
	Cluster,
	thread: Thread.make,
	cluster: Cluster.make,

	mocks: <S extends Schematic>(options: {
			setupWork: SetupWork<S>
			setupHost: SetupHost<S>
		}): Mocks<S> => {

		const {setupWork, setupHost} = options

		let work!: Remote<S["work"]>
		let host!: Remote<S["host"]>

		work = mock(setupWork(host, new Rig()))
		host = mock(setupHost(work, new Rig()))

		return {work, host}
	},
}

