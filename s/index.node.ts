
import {setupComrade} from "./comrade.js"
import {setupNodeCompat} from "./compat/node.js"

export const compat = setupNodeCompat()
export const Comrade = setupComrade(compat)

export * from "./exports.js"

