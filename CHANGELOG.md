
# `@e280/comrade` changelog
- 🟥 breaking change
- 🔶 deprecation or possible breaking change
- 🍏 harmless addition, fix, or enhancement

<br/>

## v0.1.0
- 🍏 update dependencies

## v0.0.0-24
- 🍏 update dependencies

## v0.0.0-23
- 🍏 fix bug that caused calls to `shell.work` and `shell.host` to fail

## v0.0.0-22
- 🍏 update dependencies

## v0.0.0-21
- 🟥 merged `rig` into `shell`
  - old and bad
    ```ts
    await Comrade.worker<MySchematic>((shell, rig) => ({
      async exampleFn() {
        await shell.host.sum(1, 2)
        const buffer = new Uint8Array([0xDE, 0xAD, 0xBE, 0xEF]).buffer

        rig.transfer = [buffer]
        return buffer
      },
    }))
    ```
  - new and good
    ```ts
    //                                 👇
    await Comrade.worker<MySchematic>(shell => ({
      async exampleFn() {
        await shell.host.sum(1, 2)
        const buffer = new Uint8Array([0xDE, 0xAD, 0xBE, 0xEF]).buffer
        //👇
        shell.transfer = [buffer]
        return buffer
      },
    }))
    ```
    - `(shell, rig)` => `shell`
    - `rig.transfer` => `shell.transfer`

### v0.0.0-20
- 🍏 update dependencies

### v0.0.0-19
- 🍏 update dependencies

### v0.0.0-18
- 🔶 reworked browser/node compat layer
  - we used to do runtime detection, and dynamic imports of node modules
  - now, we explicitly delineate separate entrypoints
    - `index.node.js`
    - `index.browser.js`
  - we use the package.json `exports` field to export one of these entrypoints based on the detected environments
    - this should 'just work' if your bundler build tooling has proper node16 exports support

### v0.0.0-17
- 🍏 fix: logging taps

### v0.0.0-16
- 🍏 export ErrorTap

### v0.0.0-15
- 🍏 add logging via taps, default ErrorTap logs errors

### v0.0.0-13
- 🔶 updating to experimental new `@e280/renraku`

### v0.0.0-7
- 🟥 bigly rework names and ergonomics, see readme

### v0.0.0-0
- 🍏 first release

