
import {endpoint, Messenger} from "renraku"
import {MinistryFns, Schematic, SetupFns} from "../types.js"

export async function comrade<S extends Schematic>(
		setup: SetupFns<S["comradeFns"], S["commissarFns"]>,
	) {

	const messenger = new Messenger<MinistryFns<S>>({
		timeout: 120_000,
		remotePortal: new Messenger.MessagePortal(self),
		getLocalEndpoint: (remote, rig, event) => endpoint(setup(remote.commissar, rig, event)),
	})

	await messenger.remote.apparatchik.ready()
	return messenger.remote.commissar
}

