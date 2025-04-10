
import {endpoint, Messenger} from "renraku"

import {getSelf} from "./parts/compat.js"
import {MinistryFns, Schematic, SetupFns} from "./parts/types.js"

/**
 * create a web worker
 */
export async function worker<S extends Schematic>(
		setup: SetupFns<S["workerFns"], S["mainFns"]>,
		options: {timeout?: number} = {}
	) {

	const messenger = new Messenger<MinistryFns<S>>({
		timeout: options.timeout ?? Infinity,
		getLocalEndpoint: (remote, rig) => endpoint(setup(remote.mainFns, rig))
	})

	messenger.attach(await getSelf())

	await messenger.remote.metaFns.ready()
	return messenger.remote.mainFns
}

