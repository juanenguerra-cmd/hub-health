import type { StaffDirectory } from '@/types/nurse-educator';

export function validateStaffName(
  name: string,
  staffDirectory: StaffDirectory
): { valid: boolean; message: string; suggestion?: string } {
  const trimmed = name.trim();
  if (!trimmed) return { valid: false, message: 'Staff name is required' };

  const exactMatch = staffDirectory.rows.find((s) => s.name === trimmed && s.status === 'Active');
  if (exactMatch) return { valid: true, message: '' };

  const lowerInput = trimmed.toLowerCase();
  const closeMatch = staffDirectory.rows.find(
    (s) => s.status === 'Active' && s.name.toLowerCase().includes(lowerInput)
  );
  if (closeMatch) {
    return {
      valid: false,
      message: `Staff not found. Did you mean "${closeMatch.name}"?`,
      suggestion: closeMatch.name,
    };
  }

  const inactive = staffDirectory.rows.find((s) => s.name === trimmed);
  if (inactive) {
    return {
      valid: false,
      message: `"${trimmed}" is marked as ${inactive.status}. Cannot use for new actions.`,
    };
  }

  return { valid: false, message: 'Staff not found in directory. Add to Staff Directory first.' };
}

export function getStaffSuggestions(
  query: string,
  staffDirectory: StaffDirectory,
  limit = 10
): Array<{ name: string; position: string; department: string }> {
  if (!query) {
    return staffDirectory.rows
      .filter((s) => s.status === 'Active')
      .slice(0, limit)
      .map((s) => ({ name: s.name, position: s.position, department: s.department }));
  }

  const lowerQuery = query.toLowerCase();
  return staffDirectory.rows
    .filter(
      (s) =>
        s.status === 'Active' &&
        (s.name.toLowerCase().includes(lowerQuery) || s.position.toLowerCase().includes(lowerQuery))
    )
    .slice(0, limit)
    .map((s) => ({ name: s.name, position: s.position, department: s.department }));
}
