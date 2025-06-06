
import {mock, Rig, Tap} from "@e280/renraku"
import {Thread} from "./parts/thread.js"
import {Cluster} from "./parts/cluster.js"
import {ErrorTap} from "./parts/error-tap.js"
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
		tap?: Tap
	}): Mocks<S> {

	const {setupWork, setupHost, tap = new ErrorTap()} = options

	const hostShell = new HostShell<S>()
	const workShell = new WorkShell<S>()

	workShell.work = mock({tap, fns: setupWork(hostShell, new Rig())})
	hostShell.host = mock({tap, fns: setupHost(workShell, new Rig())})

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

	workShell.work = mock({fns: setupWork(hostShell, new Rig())})

	return {
		workShell,
		hostShell,
		work: workShell.work,
		mockHost: (setupHost: SetupHost<S>): Mocks<S> => {
			hostShell.host = mock({fns: setupHost(workShell, new Rig())})
			return {
				workShell,
				hostShell,
				work: workShell.work,
				host: hostShell.host,
			}
		},
	}
}

