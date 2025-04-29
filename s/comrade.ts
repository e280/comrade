
import {mock, Rig} from "renraku"
import {Cluster} from "./parts/cluster.js"
import {Thread} from "./parts/thread.js"
import {HostShell, WorkShell} from "./parts/shells.js"
import {Mocks, Schematic, SetupHost, SetupWork} from "./parts/types.js"

export {worker} from "./parts/worker.js"
export {Cluster} from "./parts/cluster.js"
export {Thread} from "./parts/thread.js"
export {loadWasm, loadWorker} from "./parts/compat.js"

export const thread = Thread.make.bind(Thread)
export const cluster = Cluster.make.bind(Cluster)

export const work = <S extends Schematic>(fn: SetupWork<S>) => fn
export const host = <S extends Schematic>(fn: SetupHost<S>) => fn

export function mocks<S extends Schematic>(options: {
		setupWork: SetupWork<S>
		setupHost: SetupHost<S>
	}): Mocks<S> {

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
}

export function mockWork<S extends Schematic>(setupWork: SetupWork<S>) {
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
}

