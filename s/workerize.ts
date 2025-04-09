
import {endpoint, Messenger} from "renraku"
import {MinistryFns, Schematic, SetupFns} from "./parts/types.js"

/**
 * create a web worker
 */
export async function workerize<S extends Schematic>(
		setup: SetupFns<S["workerFns"], S["clusterFns"]>,
	) {

	const messenger = new Messenger<MinistryFns<S>>({
		timeout: 120_000,
		getLocalEndpoint: (remote, rig) => endpoint(setup(remote.clusterFns, rig))
	})

	messenger.attach(self)

	await messenger.remote.metaFns.ready()
	return messenger.remote.clusterFns
}

