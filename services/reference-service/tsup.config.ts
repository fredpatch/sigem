import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  platform: "node",
  target: "node20",
  outDir: "dist",
  sourcemap: false,
  clean: true,
  splitting: false,
  bundle: true,
  dts: false,
  treeshake: true,
  minify: false,
  noExternal: ["@sigem/shared"],
});
