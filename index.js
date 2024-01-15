
import { onMount } from 'svelte';
import * as Neutralino from '@neutralinojs/lib'
import { building } from '$app/environment';

/**
 * @typedef {typeof import('@neutralinojs/lib')} NeutType
 */

/** @type {((n: NeutType) => void)[]} */
let cbs = [];
let neut_loaded = false;
let neut_loading = false;

export function onNeutralino(/** @type {(n: NeutType) => void} */ cb) {
    if(neut_loaded)
        cb(Neutralino);
    else
        cbs.push(cb);
}

 /**
  * @param {((n: NeutType) => void)|undefined} [cb]
  * @param {{ logErrors: boolean }|undefined} [options]
  * @returns {any}
  */
export function initNeutralino(cb, options)
{
    if(building) return

    if(neut_loaded) return cb && cb(Neutralino)
    if(neut_loading) return cb && onNeutralino(cb)

    neut_loading = true;

    onMount(async () => {
        try{
            const res = await fetch('/__neutralino_globals.js')
            eval((await res.text()).replaceAll('var ', 'window.'))
            Neutralino.init()
        }catch(e){
            neut_loading = false;
            console.error("Neutralino.init Error:", e)
        }

        if(options?.logErrors ?? true){
            window.addEventListener('unhandledrejection', event => { 
                Neutralino.debug.log(`UnhandledRejection: ${event.reason}`,
                    Neutralino.debug.LoggerType.ERROR)
            }); 
        }

        neut_loaded = true;
        neut_loading = false;
        cb && cb(Neutralino);
        cbs.forEach(ocb => ocb(Neutralino));
        cbs = [];
    })
}