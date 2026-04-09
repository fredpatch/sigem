import { createBackendTsupConfig } from "../../configs/tsup.backend.base";

export default createBackendTsupConfig({
  entry: ["src/server.ts"],

  noExternal: ["@sigem/shared"],
});
