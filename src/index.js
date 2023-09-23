
// Adapter only
import adapter from './adapter.js'
export const adapter = adapter;

// Runtime only
import { building } from '$app/environment'
import { onMount } from 'svelte';
import '@neutralinojs/lib/dist/neutralino.d.ts'

/**
 * @type {typeof globalThis.Neutralino | undefined}
 */
export var Neutralino;

if(building)
    onMount(() => window.Neutralino && (Neutralino = window.Neutralino))