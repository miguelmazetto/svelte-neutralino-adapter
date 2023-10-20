
import { onMount } from 'svelte';

/**
 * @type {import("@neutralinojs/lib/dist/neutralino.d.ts") | undefined}
 */

/** @type {(() => void)[]} */
let cbs = [];
let neut_loaded = false;

export function onNeutralino(/** @type {() => void} */ cb) {
    if(neut_loaded)
        cb();
    else
        cbs.push(cb);
}

 /**
  * @param {{ logErrors: boolean }} [options]
  */
export function initNeutralino(options)
{
    onMount(() => {

        // Add neutralino.js to all files that requires it
        var s = document.createElement('script');
        s.setAttribute('src', '/neutralino.js')
        s.onload = () => {
            Neutralino.init()

            if(options?.logErrors ?? true){
                window.addEventListener('unhandledrejection', event => { 
                    Neutralino.debug.log(`UnhandledRejection: ${event.reason}`,
                        Neutralino.debug.LoggerType.ERROR)
                }); 
            }

            neut_loaded = true;
            cbs.forEach(cb => cb())
        }
        document.body.appendChild(s);

    })
}