import { createBackendTsupConfig } from "../../configs/tsup.backend.base";

export default createBackendTsupConfig({
  entry: ["src/server.ts"],
  noExternal: ["@sigem/shared"],
  // Native modules must stay external — tsup bundles their JS but the .node
  // binary can only be resolved correctly from node_modules at runtime.
  external: ["bcrypt", "snappy"],
});
