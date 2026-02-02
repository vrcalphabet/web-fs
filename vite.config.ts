import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/main.ts"),
      name: "main",
      fileName: "main",
    },
    // watch: {
    //   include: "src/**/*.ts"
    // },
  },
  plugins: [
    dts({ rollupTypes: true }),
    nodePolyfills({
      include: ["node:path"],
    }),
  ],
});
