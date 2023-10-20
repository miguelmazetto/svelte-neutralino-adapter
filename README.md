# svelte-neutralino-adapter
Allows SvelteKit applications to be compiled into executables using [Neutralino](https://neutralino.js.org/)

The advantage of Neutralino compared to Electron, is that the browser is not included, it will use the OS browser (e.g for Windows it will be Edge). That means that instead of 100+ MB, it will be only 15 MB (For all OS included, for just one its maximum 4 MB). And the compile step is miles faster as well.

## Installation

```
npm install --save-dev @miguelmazetto/svelte-neutralino-adapter
```

## Usage

```javascript
// svelte.config.js
import adapter from 'svelte-neutralino-adapter/adapter.js'

export default {
    kit: {
        adapter: adapter(),
        prerender: { default: true },
    },
}
```

After running the first time, it generates a neutralino.config.json at your project's root folder, there you can change all [neutralino configurations](https://neutralino.js.org/docs/configuration/neutralino.config.json).