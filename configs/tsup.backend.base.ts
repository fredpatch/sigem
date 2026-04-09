import { defineConfig, type Options } from "tsup";

type CreateBackendTsupConfigOptions = {
  entry: string[];
  noExternal?: string[];
  external?: string[];
  outDir?: string;
};

const nativeNodeModules = ["bcrypt", "snappy"];

export function createBackendTsupConfig(
  options: CreateBackendTsupConfigOptions,
) {
  return defineConfig({
    entry: options.entry,
    format: ["cjs"],
    platform: "node",
    target: "node20",
    outDir: options.outDir ?? "dist",
    sourcemap: false,
    clean: true,
    splitting: false,
    bundle: true,
    dts: false,
    treeshake: true,
    minify: false,
    noExternal: options.noExternal ?? [],
    // Keep native add-ons external so Node resolves their platform-specific
    // `.node` binaries from `node_modules` at runtime instead of esbuild trying
    // to bundle them.
    external: [...new Set([...nativeNodeModules, ...(options.external ?? [])])],
  });
}
