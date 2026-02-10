import { useMutation } from "@tanstack/react-query";
import { importAPI } from "../api/import.api";
import { ImportCommitPayload } from "../types/import";

export function useProviderImportPreview() {
  return useMutation({
    mutationFn: (params: { file: File; mapping: Record<string, string> }) =>
      importAPI.importProvidersPreview(params),
  });
}

export function useProvidersImportCommit() {
  return useMutation({
    mutationFn: (payloads: ImportCommitPayload) =>
      importAPI.importProvidersCommit(payloads),
  });
}

export function useProviderImportInspect() {
  return useMutation({
    mutationFn: (file: File) => importAPI.importProvidersInspect(file),
  });
}

// const previewMut = useProvidersImportPreview();
// const commitMut = useProvidersImportCommit();

// // Step preview
// const handlePreview = async (file: File, mapping: any) => {
//   const data = await previewMut.mutateAsync({ file, mapping });
//   setPreview(data);
//   setStep(2);
// };

// // Step commit
// const handleCommit = async (rows: CommitRow[]) => {
//   const data = await commitMut.mutateAsync({ rows });
//   setCommit(data);
//   setStep(3);
// };
