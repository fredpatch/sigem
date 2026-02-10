import { useState } from "react";
import { CommitResponse } from "../types/import";
import { UploadAndMappingStep } from "./upload-adn-mapping";
import { PreviewTableStep } from "./preview-table.step";
import { CommitResultStep } from "./commit-result.step";
import { useProviderImportPreview } from "../hooks/use-import";

type Step = 1 | 2 | 3;

export function ProviderImportWizard() {
  const [step, setStep] = useState<Step>(1);
  const [preview, setPreview] = useState<any | null>(null);
  const [commit, setCommit] = useState<CommitResponse | null>(null);

  const previewMut = useProviderImportPreview(); // ✅ pas de destructuring mutate

  const onGeneratePreview = async (payload: { file: File; mapping: any }) => {
    const res = await previewMut.mutateAsync(payload); // ✅ retourne la data
    setPreview(res);
    setStep(2);
  };

  const onReset = () => {
    setStep(1);
    setPreview(null);
    setCommit(null);
  };

  return (
    <div className="rounded-xl border bg-background">
      {step === 1 && (
        <UploadAndMappingStep onGeneratePreview={onGeneratePreview} />
      )}

      {step === 2 && preview && (
        <PreviewTableStep
          preview={preview}
          onBack={() => setStep(1)}
          onCommitted={(commit) => {
            setCommit(commit);
            setStep(3);
          }}
        />
      )}

      {step === 3 && commit && (
        <CommitResultStep
          commit={commit}
          onReset={onReset}
          onBackToPreview={() => setStep(2)}
        />
      )}
    </div>
  );
}
