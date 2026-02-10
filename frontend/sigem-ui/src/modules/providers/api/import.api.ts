import { api } from "@/lib/axios";
import { ImportCommitPayload } from "../types/import";

export class ImportAPI {
  async importProvidersPreview(params: {
    file: File;
    mapping: Record<string, string>;
  }) {
    const form = new FormData();
    form.append("file", params.file);
    form.append("mapping", JSON.stringify(params.mapping));

    const res = await api.post("/providers/import/preview", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  }

  async importProvidersInspect(file: File) {
    const form = new FormData();
    form.append("file", file);
    const res = await api.post("/providers/import/inspect", form);

    // console.log("Inspect response", res);

    return res.data; // { ok, headers, sample }
  }

  async importProvidersCommit(payloads: ImportCommitPayload) {
    const res = await api.post("/providers/import/commit", payloads);
    return res.data;
  }
}

export const importAPI = new ImportAPI();
