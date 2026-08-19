export type Need = 'manage' | 'automate' | 'monitor' | 'connect' | 'collect';
export type Users = 'solo' | 'team' | 'roles' | 'locations';
export type Priority = 'speed' | 'visibility' | 'fewer-errors' | 'automation' | 'control';

export interface SystemDirection {
  title: string;
  subtitle: string;
  desc: string;
  flow: string[];
  relatedLab: string;
  relatedLabel: string;
  capabilities: string[];
}

export const needOptions: { id: Need; label: string; icon: string }[] = [
  { id: 'manage', label: 'MANAGE SOMETHING', icon: '◻' },
  { id: 'automate', label: 'AUTOMATE SOMETHING', icon: '→' },
  { id: 'monitor', label: 'MONITOR SOMETHING', icon: '◎' },
  { id: 'connect', label: 'CONNECT TOOLS', icon: '⬡' },
  { id: 'collect', label: 'COLLECT DATA', icon: '▤' },
];

export const userOptions: { id: Users; label: string }[] = [
  { id: 'solo', label: 'ONLY ME' },
  { id: 'team', label: 'SMALL TEAM' },
  { id: 'roles', label: 'MULTIPLE ROLES' },
  { id: 'locations', label: 'MULTIPLE LOCATIONS' },
];

export const priorityOptions: { id: Priority; label: string }[] = [
  { id: 'speed', label: 'SPEED' },
  { id: 'visibility', label: 'VISIBILITY' },
  { id: 'fewer-errors', label: 'FEWER ERRORS' },
  { id: 'automation', label: 'AUTOMATION' },
  { id: 'control', label: 'CONTROL' },
];

// Rule table: [need, users, priority] → result
const ruleTable: [Need | null, Users | null, Priority | null, SystemDirection][] = [
  ['automate', null, null, {
    title: 'WORKFLOW AUTOMATION LAYER', subtitle: 'AUTOMATION',
    desc: 'Automate repetitive handoffs. Connect existing tools so information flows without manual steps.',
    flow: ['FORM', 'TRIGGER', 'AUTOMATION', 'STRUCTURED DATA', 'NOTIFICATION'],
    relatedLab: 'workflow', relatedLabel: 'TRY THE WORKFLOW',
    capabilities: ['Event triggers', 'Multi-step flows', 'Conditional routing', 'Notifications'],
  }],
  ['automate', 'team', 'speed', {
    title: 'TEAM AUTOMATION SUITE', subtitle: 'AUTOMATION + SPEED',
    desc: 'Fast automation for small teams. Remove daily manual work and keep everyone aligned.',
    flow: ['TRIGGER', 'AUTO-VALIDATE', 'AUTO-ASSIGN', 'NOTIFY TEAM', 'DASHBOARD'],
    relatedLab: 'workflow', relatedLabel: 'TRY THE WORKFLOW',
    capabilities: ['Team triggers', 'Auto-assignment', 'Speed optimization', 'Team dashboards'],
  }],
  ['monitor', null, 'visibility', {
    title: 'OPERATIONS DASHBOARD', subtitle: 'VISIBILITY LAYER',
    desc: 'Turn scattered data into structured views. Connect sources, define metrics, surface what matters.',
    flow: ['DATA SOURCES', 'PROCESSING', 'METRICS', 'DASHBOARD', 'ALERTS'],
    relatedLab: 'dashboard', relatedLabel: 'OPEN THE CONSOLE',
    capabilities: ['Real-time metrics', 'Drill-down views', 'Alert rules', 'Trend analysis'],
  }],
  ['monitor', 'locations', 'visibility', {
    title: 'MULTI-LOCATION OPERATIONS CONSOLE', subtitle: 'LOCATION VISIBILITY',
    desc: 'Monitor operations across multiple locations with location-specific data and unified reporting.',
    flow: ['LOCATION DATA', 'AGGREGATION', 'LOCATION VIEWS', 'UNIFIED DASHBOARD', 'ALERTS'],
    relatedLab: 'dashboard', relatedLabel: 'OPEN THE CONSOLE',
    capabilities: ['Location filtering', 'Cross-location metrics', 'Location alerts', 'Comparative views'],
  }],
  [null, 'roles', 'control', {
    title: 'ROLE-BASED INTERNAL SYSTEM', subtitle: 'ACCESS CONTROL',
    desc: 'A system with role-based access so each person sees exactly what they need — nothing more, nothing less.',
    flow: ['USER ROLES', 'APPLICATION', 'OPERATIONAL DATA', 'ROLE-BASED VIEWS', 'REPORTING'],
    relatedLab: 'permission', relatedLabel: 'EXPLORE PERMISSIONS',
    capabilities: ['Role management', 'Permission matrix', 'Access audit', 'Override controls'],
  }],
  ['connect', null, 'automation', {
    title: 'INTEGRATION WORKFLOW', subtitle: 'CONNECTION LAYER',
    desc: 'Connect existing tools so information flows automatically instead of being manually copied.',
    flow: ['SOURCE TOOL', 'TRIGGER', 'AUTOMATION', 'DESTINATION', 'NOTIFICATION'],
    relatedLab: 'workflow', relatedLabel: 'TRY THE WORKFLOW',
    capabilities: ['Tool connectors', 'Data mapping', 'Sync rules', 'Error handling'],
  }],
  ['manage', null, 'control', {
    title: 'CUSTOM MANAGEMENT PLATFORM', subtitle: 'CUSTOM SYSTEM',
    desc: 'A focused application built around your specific workflow — roles, approvals, data, and reporting.',
    flow: ['INPUT', 'VALIDATION', 'PROCESSING', 'APPROVAL', 'REPORTING'],
    relatedLab: 'process', relatedLabel: 'DESIGN A PROCESS',
    capabilities: ['Custom workflow', 'Approval chains', 'Role-based access', 'Operational reports'],
  }],
  ['manage', 'roles', 'control', {
    title: 'STRUCTURED PROCESS SYSTEM', subtitle: 'RULE-BASED SYSTEM',
    desc: 'Build a system where business rules, roles, and approval chains govern how work flows.',
    flow: ['REQUEST', 'ROLE CHECK', 'RULE EVALUATION', 'APPROVAL', 'COMPLETE'],
    relatedLab: 'process', relatedLabel: 'DESIGN A PROCESS',
    capabilities: ['Rule engine', 'Conditional routing', 'Approval chains', 'Audit trail'],
  }],
  ['collect', null, null, {
    title: 'DATA COLLECTION SYSTEM', subtitle: 'DATA LAYER',
    desc: 'Structure how information enters your system. From forms to validation to organized data.',
    flow: ['COLLECTION', 'VALIDATION', 'STRUCTURED DATA', 'VIEWS', 'EXPORT'],
    relatedLab: 'architecture', relatedLabel: 'EXPLORE ARCHITECTURE',
    capabilities: ['Form builder', 'Validation rules', 'Data views', 'Export/reporting'],
  }],
];

// Fallback results
const fallbackResults: Record<string, SystemDirection> = {
  default: {
    title: 'INTEGRATED WORKFLOW', subtitle: 'STARTING POINT',
    desc: 'Map the current process, identify bottlenecks, and build a system that connects steps automatically.',
    flow: ['TRIGGER', 'VALIDATION', 'PROCESSING', 'NOTIFICATION', 'ARCHIVE'],
    relatedLab: 'permission', relatedLabel: 'EXPLORE THE LAB',
    capabilities: ['Process mapping', 'Step automation', 'Notifications', 'Reporting'],
  },
};

export function generateSystemDirection(need: Need | null, users: Users | null, priority: Priority | null): SystemDirection {
  // Try exact match first
  for (const [rNeed, rUsers, rPriority, result] of ruleTable) {
    if (rNeed === need && rUsers === users && rPriority === priority) return result;
  }
  // Try partial matches (need + users)
  if (need && users) {
    for (const [rNeed, rUsers, rPriority, result] of ruleTable) {
      if (rNeed === need && rUsers === users && !rPriority) return result;
    }
  }
  // Try need + priority
  if (need && priority) {
    for (const [rNeed, rUsers, rPriority, result] of ruleTable) {
      if (rNeed === need && !rUsers && rPriority === priority) return result;
    }
  }
  // Try need only
  if (need) {
    for (const [rNeed, rUsers, rPriority, result] of ruleTable) {
      if (rNeed === need && !rUsers && !rPriority) return result;
    }
  }
  // Try users + priority
  if (users && priority) {
    for (const [rNeed, rUsers, rPriority, result] of ruleTable) {
      if (!rNeed && rUsers === users && rPriority === priority) return result;
    }
  }
  // Try priority only
  if (priority) {
    for (const [rNeed, rUsers, rPriority, result] of ruleTable) {
      if (!rNeed && !rUsers && rPriority === priority) return result;
    }
  }

  return fallbackResults.default;
}
