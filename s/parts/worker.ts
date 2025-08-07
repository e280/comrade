
import {Messenger, PostableConduit} from "@e280/renraku"

import {shells} from "./shells.js"
import {Compat} from "../compat/types.js"
import {defaultTap} from "./default-tap.js"
import {MinistryFns, Schematic, SetupWork, WorkerOpts} from "./types.js"

/**
 * create a web worker
 */
export async function worker<S extends Schematic>(
		compat: Compat,
		setupWork: SetupWork<S>,
		options: WorkerOpts = {},
	) {

	const tap = options.tap ?? defaultTap

	const messenger = new Messenger<S["work"], MinistryFns<S>>({
		tap,
		timeout: options.timeout ?? Infinity,
		conduit: new PostableConduit(compat.getSelf()),
		rpc: async m => setupWork(
			shells.derive.host<S>(m),
		),
	})

	await messenger.remote.infra.ready()
	return messenger.remote.host
}

