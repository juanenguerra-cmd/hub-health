// Template Version History Types

export interface TemplateChange {
  id: string;
  templateId: string;
  version: string;
  previousVersion: string;
  changedAt: string;
  changedBy: string;
  changeType: 'created' | 'question_added' | 'question_removed' | 'question_modified' | 'settings_changed' | 'archived' | 'restored';
  changeDescription: string;
  details: TemplateChangeDetail[];
}

export interface TemplateChangeDetail {
  field: string;
  oldValue?: string | number | boolean;
  newValue?: string | number | boolean;
  questionKey?: string;
  questionLabel?: string;
}

export interface TemplateHistoryState {
  changes: TemplateChange[];
}
