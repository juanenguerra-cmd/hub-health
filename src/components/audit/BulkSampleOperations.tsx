import { useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface BulkSampleOperationsProps {
  onQuickAdd: (count: number) => void;
  onCsvImport: (csvText: string) => void;
}

export function BulkSampleOperations({ onQuickAdd, onCsvImport }: BulkSampleOperationsProps) {
  const [csvText, setCsvText] = useState('');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Bulk sample operations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => onQuickAdd(5)}>
            <Plus className="w-4 h-4 mr-1" /> Quick add 5
          </Button>
          <Button variant="outline" size="sm" onClick={() => onQuickAdd(10)}>
            <Plus className="w-4 h-4 mr-1" /> Quick add 10
          </Button>
        </div>

        <div className="space-y-2">
          <Input
            aria-label="CSV input"
            placeholder="Paste CSV rows here"
            value={csvText}
            onChange={(event) => setCsvText(event.target.value)}
          />
          <Button variant="secondary" size="sm" onClick={() => onCsvImport(csvText)} disabled={!csvText.trim()}>
            <Upload className="w-4 h-4 mr-1" /> Import CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
