import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'], // Build for commonJS and ESmodules
  dts: true, // Generate declaration file (.d.ts)
  splitting: true, // Split output files
  sourcemap: true,
  clean: true,
  tsconfig: 'tsconfig.build.json',
})
