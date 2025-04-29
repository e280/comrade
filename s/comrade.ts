
import {mock, Rig} from "renraku"
import {worker} from "./worker.js"
import {Cluster} from "./cluster.js"
import {Thread} from "./parts/thread.js"
import {loadWasm, loadWorker} from "./parts/compat.js"
import {HostShell, WorkShell} from "./parts/shells.js"
import {Mocks, Schematic, SetupHost, SetupWork} from "./parts/types.js"

export const Comrade = {
	work: <S extends Schematic>(fn: SetupWork<S>) => fn,
	host: <S extends Schematic>(fn: SetupHost<S>) => fn,

	loadWasm: loadWasm,
	loadWorker: loadWorker,

	worker,
	Thread,
	Cluster,
	thread: Thread.make.bind(Thread),
	cluster: Cluster.make.bind(Cluster),

	mocks: <S extends Schematic>(options: {
			setupWork: SetupWork<S>
			setupHost: SetupHost<S>
		}): Mocks<S> => {

		const {setupWork, setupHost} = options

		const hostShell = new HostShell<S>()
		const workShell = new WorkShell<S>()

		workShell.work = mock(setupWork(hostShell, new Rig()))
		hostShell.host = mock(setupHost(workShell, new Rig()))

		return {
			workShell,
			hostShell,
			work: workShell.work,
			host: hostShell.host,
		}
	},

	mockWork: <S extends Schematic>(setupWork: SetupWork<S>) => {
		const hostShell = new HostShell<S>()
		const workShell = new WorkShell<S>()
		workShell.work = mock(setupWork(hostShell, new Rig()))
		return {
			workShell,
			hostShell,
			work: workShell.work,
			mockHost: (setupHost: SetupHost<S>): Mocks<S> => {
				hostShell.host = mock(setupHost(workShell, new Rig()))
				return {
					workShell,
					hostShell,
					work: workShell.work,
					host: hostShell.host,
				}
			},
		}
	},
}

