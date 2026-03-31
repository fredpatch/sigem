import { createBackendTsupConfig } from "../../configs/tsup.backend.base";

export default createBackendTsupConfig({
  entry: ["src/server.ts"],
  noExternal: ["@sigem/shared"],
  // Native modules must stay external — tsup bundles their JS but the .node
  // binary can only be resolved correctly from node_modules at runtime.
  external: ["bcrypt", "snappy"],
});

//  entry: options.entry,
//     format: ["cjs"],
//     platform: "node",
//     target: "node20",
//     outDir: options.outDir ?? "dist",
//     sourcemap: false,
//     clean: true,
//     splitting: false,
//     bundle: true,
//     dts: false,
//     treeshake: true,
//     minify: false,
//     noExternal: options.noExternal ?? [],
//     external: options.external ?? [],
