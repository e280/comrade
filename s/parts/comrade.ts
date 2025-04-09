
import {endpoint, Messenger} from "renraku"
import {MinistryFns, Schematic, SetupFns} from "../types.js"

export async function comrade<S extends Schematic>(
		setup: SetupFns<S["comradeFns"], S["commissarFns"]>,
	) {

	const messenger = new Messenger<MinistryFns<S>>({
		timeout: 120_000,
		getLocalEndpoint: (remote, rig) => endpoint(setup(remote.commissar, rig))
	})

	messenger.attach(self)

	await messenger.remote.apparatchik.ready()
	return messenger.remote.commissar
}

