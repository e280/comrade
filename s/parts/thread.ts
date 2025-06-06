
import {defer} from "@e280/stz"
import {endpoint, Messenger, PostableConduit} from "@e280/renraku"

import {WorkShell} from "./shells.js"
import {ErrorTap} from "./error-tap.js"
import {CompatWorker, loadWorker} from "./compat.js"
import {Meta, Schematic, ThreadOptions} from "./types.js"

export class Thread<S extends Schematic> {
	constructor(
		public worker: CompatWorker,
		public messenger: Messenger<S["work"]>,
	) {}

	static async make<S extends Schematic>(options: ThreadOptions<S>) {
		const worker = await loadWorker(options.workerUrl, options.label)
		const readyprom = defer<void>()

		const meta: Meta = {
			async ready() {
				readyprom.resolve()
			},
		}

		const messenger = new Messenger<S["work"]>({
			timeout: options.timeout ?? Infinity,
			conduit: new PostableConduit(worker),
			getLocalEndpoint: (remote, rig) => endpoint({
				tap: options.tap ?? new ErrorTap(),
				fns: {
					meta,
					host: options.setupHost(new WorkShell(remote), rig),
				},
			}),
		})

		await readyprom.promise
		return new this<S>(worker, messenger)
	}

	get work() {
		return this.messenger.remote
	}

	terminate() {
		this.worker.terminate()
	}
}

