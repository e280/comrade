
import {MessengerMeta, Remote} from "@e280/renraku"
import {Schematic} from "./types.js"

export type HostShell<S extends Schematic> = {
	host: Remote<S["host"]>
	transfer: Transferable[] | undefined
}

export type WorkShell<S extends Schematic> = {
	work: Remote<S["host"]>
	transfer: Transferable[] | undefined
}

export const shells = {
	derive: {
		host: <S extends Schematic>(meta: MessengerMeta<S["host"]>): HostShell<S> => ({
			host: meta.remote,
			get transfer() { return meta.transfer },
			set transfer(t) { meta.transfer = t },
		}),
		work: <S extends Schematic>(meta: MessengerMeta<S["work"]>): WorkShell<S> => ({
			work: meta.remote,
			get transfer() { return meta.transfer },
			set transfer(t) { meta.transfer = t },
		}),
	},
	mock: {
		host: <S extends Schematic>(): HostShell<S> => ({
			host: undefined as any,
			transfer: undefined,
		}),
		work: <S extends Schematic>(): WorkShell<S> => ({
			work: undefined as any,
			transfer: undefined,
		})
	},
}

