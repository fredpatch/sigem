import { defineConfig, type Options } from "tsup";

type CreateBackendTsupConfigOptions = {
  entry: string[];
  noExternal?: string[];
  external?: string[];
  outDir?: string;
};

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
    external: options.external ?? [],
  });
}
