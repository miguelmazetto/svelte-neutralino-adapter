import { onMount } from 'svelte';

/**
 * @type {import("@neutralinojs/lib/dist/neutralino").Neutralino | undefined}
 */
var _Neutralino;
export default _Neutralino;

onMount(() => window.Neutralino && (_Neutralino = window.Neutralino))