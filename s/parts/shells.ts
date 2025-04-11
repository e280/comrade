
import {Host, Schematic, Work} from "./types.js"

export class HostShell<S extends Schematic> {
	host!: Host<S>
	constructor(host?: Host<S>) {
		this.host = host!
	}
}

export class WorkShell<S extends Schematic> {
	work!: Work<S>
	constructor(work?: Work<S>) {
		this.work = work!
	}
}

