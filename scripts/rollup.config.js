import { terser } from 'rollup-plugin-terser';
import { dataurl } from './rollup-plugin-dataurl';
import { roadrolled } from './rollup-plugin-roadroller';

const { DEBUG = false, MINIFY = false } = process.env

export default {
  // bundle all imported modules together, discarding unused code
  input: './src/js/game.js',
    onwarn(warning, warn) {
      // suppress eval warnings
      if (warning.code === 'EVAL') return
      if (warning.code === 'SOURCEMAP_ERROR') return
      warn(warning)
    },
  output: {
    file: './dist/game-rollup.js',
    // wrap global variables/functions into in IIFE so terser will rename them
    format: 'iife',
    freeze: DEBUG,
    indent: DEBUG ? '  ' : false,
    preferConst: true,
    // generate sourcemaps (development mode only)
    //sourcemap: DEBUG,
    // allow the use of onresize=onrotate=... and other space saver hacks
    strict: false,
    useStrict: false,
  },
  plugins: [
    // embed images into source files as data URI
    dataurl(),
    // TODO shouldn't I always run terser to debug the game I use?
    MINIFY &&
      terser({
        ecma: 2016,
        module: true,
        toplevel: true,
        compress: {
          keep_fargs: false,
          passes: 4,
          pure_funcs: ['assert', 'debug'],
          pure_getters: true,
          unsafe: true,
          unsafe_arrows: true,
          unsafe_comps: true,
          unsafe_math: true,
          unsafe_methods: true,
        },
        mangle: true
        // TODO sourceMap???
      }),
  ],
}