import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAutoSave } from '@/hooks/use-auto-save';

export type ValidationResult = {
  valid: boolean;
  errors?: string[];
};

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<{ data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }>;
  fields?: string[];
  optional?: boolean;
  canSkip?: boolean;
  validate?: (data: Record<string, unknown>) => ValidationResult;
}

interface StepWizardProps {
  steps: WizardStep[];
  initialData?: Record<string, unknown>;
  onComplete: (data: Record<string, unknown>) => void;
  onSaveDraft?: (data: Record<string, unknown>) => void;
  draftKey: string;
}

export function StepWizard({ steps, initialData = {}, onComplete, onSaveDraft, draftKey }: StepWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<string[]>([]);

  const { saveDraft, restoreDraft, clearDraft, lastSaved } = useAutoSave(draftKey, formData, { debounceMs: 30_000 });

  useEffect(() => {
    const restored = restoreDraft();
    if (restored) {
      setFormData(restored);
    }
  }, [restoreDraft]);

  useEffect(() => {
    const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', beforeUnloadHandler);
    return () => window.removeEventListener('beforeunload', beforeUnloadHandler);
  }, []);

  const currentStep = steps[currentStepIndex];
  const StepComponent = currentStep?.component;
  const isLastStep = currentStepIndex === steps.length - 1;
  const percent = useMemo(() => ((currentStepIndex + 1) / steps.length) * 100, [currentStepIndex, steps.length]);

  const handleStepValidation = () => {
    if (!currentStep?.validate) {
      setErrors([]);
      return true;
    }

    const result = currentStep.validate(formData);
    setErrors(result.errors ?? []);
    return result.valid;
  };

  const goNext = () => {
    if (!handleStepValidation()) return;
    setCurrentStepIndex((value) => Math.min(value + 1, steps.length - 1));
  };

  const goPrevious = () => {
    setErrors([]);
    setCurrentStepIndex((value) => Math.max(value - 1, 0));
  };

  const handleComplete = () => {
    if (!handleStepValidation()) return;
    clearDraft();
    onComplete(formData);
  };

  const handleSaveDraft = () => {
    saveDraft(formData);
    onSaveDraft?.(formData);
  };

  if (!currentStep || !StepComponent) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{currentStep.title}</CardTitle>
            <CardDescription>{currentStep.description}</CardDescription>
          </div>
          <div className="text-xs text-muted-foreground">
            Step {currentStepIndex + 1} of {steps.length}
          </div>
        </div>
        <Progress value={percent} aria-label="Wizard progress" />
        {lastSaved && <p className="text-xs text-muted-foreground">Draft saved: {new Date(lastSaved).toLocaleTimeString()}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Please fix the following</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-4">
                {errors.map((error) => <li key={error}>{error}</li>)}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <StepComponent data={formData} onChange={(nextData) => setFormData(nextData)} />

        <div className="flex flex-wrap justify-between gap-2 pt-4 border-t">
          <Button variant="outline" onClick={goPrevious} disabled={currentStepIndex === 0}>Previous</Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleSaveDraft}>Save Draft</Button>
            {isLastStep ? (
              <Button onClick={handleComplete}>Complete</Button>
            ) : (
              <Button onClick={goNext}>{currentStep.canSkip ? 'Next / Skip' : 'Next'}</Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
