
# `@e280/comrade` changelog
- 🟥 breaking change
- 🔶 deprecation or possible breaking change
- 🍏 harmless addition, fix, or enhancement

<br/>

## v0.0

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

