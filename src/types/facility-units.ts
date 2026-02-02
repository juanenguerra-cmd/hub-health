// Facility Unit Types - Hierarchical unit structure

export interface FacilityUnit {
  id: string;
  name: string; // e.g., "Unit 2"
  wings: string[]; // e.g., ["East Unit 2", "West Unit 2"]
}

// Flatten units to get all selectable options
export function getAllUnitOptions(units: FacilityUnit[]): string[] {
  const options: string[] = [];
  
  for (const unit of units) {
    // Add the parent unit
    options.push(unit.name);
    // Add all wings
    options.push(...unit.wings);
  }
  
  return options;
}

// Get parent unit name for a given wing
export function getParentUnit(units: FacilityUnit[], wingOrUnit: string): string | null {
  for (const unit of units) {
    if (unit.name === wingOrUnit) return unit.name;
    if (unit.wings.includes(wingOrUnit)) return unit.name;
  }
  return null;
}

// Get all wings for a parent unit
export function getWingsForUnit(units: FacilityUnit[], parentName: string): string[] {
  const unit = units.find(u => u.name === parentName);
  return unit?.wings || [];
}

// Check if a value matches a parent unit or any of its wings
export function matchesUnitOrWings(units: FacilityUnit[], filterUnit: string, sessionUnit: string): boolean {
  // Direct match
  if (filterUnit === sessionUnit) return true;
  
  // Check if filterUnit is a parent and sessionUnit is one of its wings
  const parent = units.find(u => u.name === filterUnit);
  if (parent && parent.wings.includes(sessionUnit)) return true;
  
  return false;
}
