
import {Messenger} from "renraku"
import {Schematic} from "./types.js"

export class Thread<S extends Schematic> {
	constructor(
		public worker: Worker,
		public messenger: Messenger<S["workerFns"]>,
	) {}

	dispose() {
		this.worker.terminate()
		this.dispose()
	}
}

