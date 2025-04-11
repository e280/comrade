
import {deferPromise, endpoint, Messenger} from "renraku"
import {CompatWorker, loadWorker} from "./compat.js"
import {Meta, Schematic, ThreadOptions} from "./types.js"

export class Thread<S extends Schematic> {
	constructor(
		public worker: CompatWorker,
		public messenger: Messenger<S["work"]>,
	) {}

	static async make<S extends Schematic>(options: ThreadOptions<S>) {
		const worker = await loadWorker(options.workerUrl, options.label)
		const readyprom = deferPromise<void>()

		const meta: Meta = {
			async ready() {
				readyprom.resolve()
			},
		}

		const messenger = new Messenger<S["work"]>({
			timeout: options.timeout ?? Infinity,
			getLocalEndpoint: (remote, rig) => endpoint({
				meta,
				host: options.setupHost(remote, rig),
			}),
		})

		messenger.attach(worker)

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

