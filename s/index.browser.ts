
import {setupComrade} from "./comrade.js"
import {setupBrowserCompat} from "./compat/browser.js"

export const compat = setupBrowserCompat()
export const Comrade = setupComrade(compat)

export * from "./exports.js"

