import { onMount } from 'svelte';
import '@neutralinojs/lib/dist/neutralino.d.ts'

/**
 * @type {typeof globalThis.Neutralino | undefined}
 */
var _Neutralino;
export default _Neutralino;

onMount(() => window.Neutralino && (_Neutralino = window.Neutralino))