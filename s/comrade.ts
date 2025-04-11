
import {worker} from "./worker.js"
import {Cluster} from "./cluster.js"
import {mock, Remote, Rig} from "renraku"
import {Schematic, SetupHost, SetupWork} from "./parts/types.js"

export const Comrade = {
	work: <S extends Schematic>(fn: SetupWork<S>) => fn,
	host: <S extends Schematic>(fn: SetupHost<S>) => fn,

	workerize: worker,
	Cluster,
	cluster: Cluster.setup,

	mocks: <S extends Schematic>(options: {
			setupWork: SetupWork<S>
			setupHost: SetupHost<S>
		}) => {

		const {setupWork, setupHost} = options

		let work!: Remote<S["work"]>
		let host!: Remote<S["host"]>

		work = mock(setupWork(host, new Rig()))
		host = mock(setupHost(work, new Rig()))

		return {host, work}
	},
}

