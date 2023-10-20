import staticAdapter from "@sveltejs/adapter-static"
import { join, relative, resolve } from "path"
import { writeFileSync, existsSync, readFileSync, symlinkSync, rmSync } from "fs"
import chalk from "chalk"

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

/**
 * @param {string} path
 */
function importJson(path){ return JSON.parse(readFileSync(require.resolve(path), 'utf-8')) }

import neu_downloader from '@neutralinojs/neu/src/modules/downloader.js'
import neu_bundler from '@neutralinojs/neu/src/modules/bundler.js'

const neupackage = importJson('@neutralinojs/neu/package.json')
const libpackage = importJson('@neutralinojs/lib/package.json')
const defaultConfig = importJson('./default_neutralino.config.json')

const hiddenConfig = {
    documentRoot: "pages/",
    cli: {
        resourcesPath: "/pages/",
        extensionsPath: "/",
        clientLibrary: "/pages/neutralino.js",
        binaryVersion: "4.14.0",
        clientVersion: libpackage.version
     }
}
const cliVersion = neupackage.version

/**
 * @param {Record<string, any>} obj 
 * @param {Record<string, any>} overrideobj 
 */
function mergeObject(obj, overrideobj){
    for (const key in overrideobj) {
        const e = overrideobj[key];
        if(typeof(e) == 'object'){
            if(obj[key])
                mergeObject(obj[key], e)
            else
                obj[key] = e;
        }else
            obj[key] = e;
    }
}

 /**
 * @typedef {object} NeutralinoOptions
 * @extends {import("@sveltejs/adapter-static").AdapterOptions}
 * @property {Record<string, any>} [neutralino]
 */

/**
 * @param {NeutralinoOptions} options
 */
export default function (options) {
    return {
        name: "@miguelmazetto/svelte-neutralino-adapter",

        /**
         * @type {import('@sveltejs/kit').Adapter}
         * @param {{ getBuildDirectory: (arg0: string) => any; mkdirp: (arg0: string) => void; copy: (arg0: string, arg1: string) => void; }} builder
         */
        // @ts-ignore
        async adapt(builder) {
            
            const rootdir = process.cwd()
            const rootconfig = join(rootdir, 'neutralino.config.json')

            let config = defaultConfig;

            // Load saved config
            if(existsSync(rootconfig))
                mergeObject(config, JSON.parse(readFileSync(rootconfig, 'utf-8')))
            else
                writeFileSync(rootconfig, JSON.stringify(config, null, 2))

            if(options.neutralino)
                mergeObject(config, options.neutralino)

            mergeObject(config, hiddenConfig)

            console.log(
                chalk.bgCyan(" INFO ") +
                    " Using Neutralinojs with version:" +
                    ("\n\t- Client: " + chalk.gray(libpackage.version)) +
                    ("\n\t- Binary: " + chalk.gray(hiddenConfig.cli.binaryVersion)) +
                    ("\n\t- CLI: "    + chalk.gray(cliVersion))
            )

            // Create bin dir 
            const binPath = builder.getBuildDirectory("neutralino")
            builder.mkdirp(binPath)

            // Download binaries
            async function doupdate(){

                writeFileSync(
                    join(binPath, "neutralino.config.json"),
                    JSON.stringify({ cli: {
                            binaryVersion: hiddenConfig.cli.binaryVersion,
                            clientVersion: hiddenConfig.cli.clientVersion
                         }}))

                console.log(chalk.bgYellow(" Building ") + " Downloading Neutralinojs dependencies")
                process.chdir(binPath)
                await neu_downloader.downloadAndUpdateBinaries();
                await neu_downloader.downloadAndUpdateClient();
                process.chdir(rootdir)

                writeFileSync(
                    join(binPath, "neutralino.config.json"),
                    JSON.stringify({ cli: {
                            binaryVersion: hiddenConfig.cli.binaryVersion,
                            clientVersion: hiddenConfig.cli.clientVersion
                         }, done: true}))
            }

            // Prepare root 'neutralino.config.json'
            const binCfg = join(binPath, "neutralino.config.json")
            if(existsSync(binCfg)){
                const existent = JSON.parse(readFileSync(binCfg, 'utf-8'))

                if(existent.done &&
                    (existent.cli.binaryVersion !== hiddenConfig.cli.binaryVersion ||
                     existent.cli.clientVersion !== hiddenConfig.cli.clientVersion))

                    await doupdate()

            }else await doupdate()

            // Create output dir
            const outdir = join(rootdir, config.output)
            builder.mkdirp(outdir)

            // Prepare output 'neutralino.config.json'
            config.modes.window.icon = 'pages' + config.modes.window.icon
            writeFileSync(
                join(outdir, "neutralino.config.json"),
                JSON.stringify(config, null, 2)
            )

            // Prepare 'pages' path
            console.log(chalk.bgYellow(" Building ") + " Generating static build")

            const adapter = new staticAdapter(
                mergeObject(mergeObject({strict: false}, options), { pages: join(outdir, "pages") }))
            await adapter.adapt(builder)

            // Prepare 'bin' path
            rmSync(join(outdir, 'bin'), { recursive: true, force: true })
            symlinkSync(join(binPath, 'bin'), join(outdir, 'bin'), 'junction')

            // Prepare 'neutralino.js' file
            rmSync(join(outdir, 'pages/neutralino.js'), { recursive: true, force: true })
            builder.copy(
                require.resolve('@neutralinojs/lib/dist/neutralino.js'),
                join(outdir, 'pages/neutralino.js'))

            // Run bundler
            console.log(chalk.bgYellow(" Building ") + " Generating Neutralinojs release")
            process.chdir(outdir)
            await neu_bundler.bundleApp(false, false)
            process.chdir(rootdir)

            // Remove 'bin' symlink to avoid confusion
            rmSync(join(outdir, 'bin'), { recursive: true, force: true })

            console.log(
                chalk.bgGreen(" Success ") + " Application is available in " +
                    chalk.cyan(join(outdir, 'dist/'+config.cli.binaryName))
            )
        }
    }
}