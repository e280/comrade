
import {mock, Rig} from "renraku"
import {worker} from "./worker.js"
import {Cluster} from "./cluster.js"
import {Thread} from "./parts/thread.js"
import {HostShell, WorkShell} from "./parts/shells.js"
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

		const hostShell = new HostShell<S>()
		const workShell = new WorkShell<S>()

		workShell.work = mock(setupWork(hostShell, new Rig()))
		hostShell.host = mock(setupHost(workShell, new Rig()))

		return {work: workShell.work, host: hostShell.host}
	},

	mockWork: <S extends Schematic>(setupWork: SetupWork<S>) => {
		const hostShell = new HostShell<S>()
		const workShell = new WorkShell<S>()
		workShell.work = mock(setupWork(hostShell, new Rig()))
		return {
			work: workShell.work,
			mockHost: (setupHost: SetupHost<S>) => {
				hostShell.host = mock(setupHost(workShell, new Rig()))
				return {work: workShell.work, host: hostShell.host}
			},
		}
	},
}

