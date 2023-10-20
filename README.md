
# svelte-neutralino-adapter
Allows SvelteKit applications to be compiled into executables using [Neutralino](https://neutralino.js.org/)

The advantage of Neutralino compared to Electron, is that the browser is not included, it will use the OS browser (e.g. for Windows it will be Edge). That means that instead of 100+ MB, it will be only 15 MB (For all OS included, for just one its maximum 4 MB). And the compile step is miles faster as well.

## Installation

```
npm install --save-dev @miguelmazetto/svelte-neutralino-adapter
```
```javascript
// svelte.config.js
import adapter from '@miguelmazetto/svelte-neutralino-adapter/adapter.js'

export default {
    kit: {
        adapter: adapter()
    },
}
```
```javascript
// routes/+layout.js or routes/+layout.js
export const prerender = true;
```


## Usage

After building the first time, it generates a neutralino.config.json at your project's root folder, there you can change all [neutralino configurations](https://neutralino.js.org/docs/configuration/neutralino.config.json).

## Native API
Neutralino offers a way to manipulate files and start processes, disable it if not using (it is disabled by default), because it can be a vulnerability if your application runs remote code.

Enable it at:
```javascript
// neutralino.config.json
{
	...,
	"enableNativeAPI": true,
	...,
}
```
Initialize it at:
```html
<script>
	import { initNeutralino, onNeutralino } from "@miguelmazetto/svelte-neutralino-adapter";
	
	// Calls the initialization of the Native API socket
	initNeutralino();
	
	// Adds a callback for when the NativeAPI is ready.
	// If called after it is already ready, it will just
	// immediately call it. In doubt, just use it.
	onNeutralino(()=>{
		// Here you can use native api functions
		
		Neutralino.debug.log("SvelteKit :D",
			Neutralino.debug.LoggerType.INFO)
	})
</script>
```
The documentation for every function is available at the [Neutralino Documentation](https://neutralino.js.org/docs/api/overview).