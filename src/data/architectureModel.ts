export type NodeId =
  | 'user' | 'web' | 'api' | 'database'
  | 'automation' | 'notifications' | 'analytics'
  | 'storage' | 'external';

export type EdgeType = 'request' | 'data' | 'event' | 'async' | 'response';
export type ViewMode = 'overview' | 'request' | 'event' | 'data';
export type SimStatus = 'idle' | 'running' | 'success' | 'failed';
export type IssueType = 'none' | 'database_unavailable' | 'notification_failure' | 'external_timeout';
export type NodeExecState = 'idle' | 'queued' | 'processing' | 'success' | 'failed' | 'unused';
export type EdgeExecState = 'idle' | 'active' | 'complete' | 'failed';

export interface ArchNode {
  id: NodeId;
  label: string;
  category: string;
  simple: string;
  technical: string;
  responsibilities: string[];
  impacts: string[];
}

export interface ArchEdge {
  from: NodeId;
  to: NodeId;
  type: EdgeType;
}

export interface ScenarioOutput {
  title: string;
  fields: { label: string; value: string }[];
  message: string;
  icon: string;
}

export interface ArchScenario {
  id: string;
  label: string;
  route: NodeId[];
  stepDetails: string[];
  result: string;
  output: ScenarioOutput;
}

export interface TraceEntry {
  time: string;
  nodeId: NodeId | null;
  label: string;
  detail: string;
}

export interface SimResult {
  scenarioId: string;
  scenarioLabel: string;
  status: 'completed' | 'failed';
  finalNode: NodeId;
  route: NodeId[];
  selectedNode: NodeId | null;
  selectedParticipated: boolean;
  output: ScenarioOutput | null;
  failedAt: NodeId | null;
  failedReason: string;
}

export const NODE_POSITIONS: Record<NodeId, { x: number; y: number }> = {
  user:          { x: 6,  y: 18 },
  web:           { x: 26, y: 18 },
  api:           { x: 50, y: 18 },
  database:      { x: 74, y: 18 },
  storage:       { x: 14, y: 52 },
  automation:    { x: 34, y: 52 },
  external:      { x: 54, y: 52 },
  analytics:     { x: 74, y: 52 },
  notifications: { x: 50, y: 82 },
};

export const nodes: ArchNode[] = [
  {
    id: 'user', label: 'USER', category: 'CLIENT',
    simple: 'The person using the application.',
    technical: 'Initiates requests through the browser interface.',
    responsibilities: ['initiate requests', 'display state', 'handle input'],
    impacts: ['user interaction', 'forms', 'dashboards'],
  },
  {
    id: 'web', label: 'WEB APP', category: 'CLIENT',
    simple: 'The application running in the browser.',
    technical: 'Client-side application that manages UI state and communicates with the API.',
    responsibilities: ['render UI', 'local state', 'input validation', 'API communication'],
    impacts: ['user interaction', 'forms', 'dashboards', 'data display'],
  },
  {
    id: 'api', label: 'API', category: 'SERVER',
    simple: 'The layer that handles application rules and connects services.',
    technical: 'Receives requests, validates input, applies logic, reads/writes data, triggers services.',
    responsibilities: ['validation', 'business rules', 'data access', 'service orchestration'],
    impacts: ['all server-side operations', 'data integrity', 'business logic'],
  },
  {
    id: 'database', label: 'DATABASE', category: 'DATA',
    simple: 'Where information is stored safely.',
    technical: 'Stores structured application state, enforces constraints, supports queries.',
    responsibilities: ['data storage', 'query processing', 'constraints', 'transactions'],
    impacts: ['records', 'reporting', 'approvals', 'automation state'],
  },
  {
    id: 'automation', label: 'AUTOMATION', category: 'SERVER',
    simple: 'Things that happen without manual work.',
    technical: 'Event-driven workflow engine that processes triggers and executes automations.',
    responsibilities: ['event handling', 'workflow execution', 'scheduling', 'integration'],
    impacts: ['automated workflows', 'scheduled tasks', 'event processing'],
  },
  {
    id: 'notifications', label: 'NOTIFICATIONS', category: 'SERVER',
    simple: 'Alerts and messages sent to people.',
    technical: 'Dispatches alerts, emails, and real-time updates based on system events.',
    responsibilities: ['alert dispatch', 'email delivery', 'real-time updates', 'channel routing'],
    impacts: ['alerts', 'email delivery', 'workflow notifications'],
  },
  {
    id: 'analytics', label: 'ANALYTICS', category: 'DATA',
    simple: 'Insights and reports from data.',
    technical: 'Aggregates, transforms, and surfaces operational insights through dashboards.',
    responsibilities: ['data aggregation', 'report generation', 'dashboards', 'trend analysis'],
    impacts: ['reports', 'dashboards', 'business intelligence'],
  },
  {
    id: 'storage', label: 'FILE STORAGE', category: 'DATA',
    simple: 'Where files and documents live.',
    technical: 'Object storage for files, documents, and media with CDN distribution.',
    responsibilities: ['file upload', 'file retrieval', 'CDN distribution', 'versioning'],
    impacts: ['file access', 'document management', 'media delivery'],
  },
  {
    id: 'external', label: 'EXTERNAL API', category: 'EXTERNAL',
    simple: 'Third-party services the system talks to.',
    technical: 'External service integrations for payments, auth, or third-party data.',
    responsibilities: ['third-party integration', 'webhook handling', 'data sync'],
    impacts: ['external data', 'third-party features'],
  },
];

export const edges: ArchEdge[] = [
  { from: 'user', to: 'web', type: 'request' },
  { from: 'web', to: 'api', type: 'request' },
  { from: 'api', to: 'database', type: 'data' },
  { from: 'api', to: 'automation', type: 'event' },
  { from: 'api', to: 'notifications', type: 'event' },
  { from: 'api', to: 'analytics', type: 'data' },
  { from: 'api', to: 'storage', type: 'data' },
  { from: 'api', to: 'external', type: 'async' },
  { from: 'automation', to: 'api', type: 'event' },
  { from: 'automation', to: 'notifications', type: 'event' },
  { from: 'database', to: 'analytics', type: 'data' },
  { from: 'api', to: 'web', type: 'response' },
  { from: 'database', to: 'api', type: 'response' },
  { from: 'analytics', to: 'api', type: 'response' },
  { from: 'storage', to: 'database', type: 'data' },
];

export const EDGE_CURVES: Record<string, number> = {
  'database-api': 4,
  'api-web': 4,
  'analytics-api': 4,
};

export const scenarios: ArchScenario[] = [
  {
    id: 'save', label: 'SAVE RECORD',
    route: ['user', 'web', 'api', 'database', 'api', 'web'],
    stepDetails: ['Request initiated', 'Payload created', 'Request validated', 'Record persisted', 'Response prepared', 'UI updated'],
    result: 'Record saved successfully.',
    output: {
      title: 'RECORD CREATED', icon: '📄',
      fields: [
        { label: 'ID', value: '#1042' },
        { label: 'STATUS', value: 'PENDING' },
        { label: 'OWNER', value: 'OPERATIONS' },
        { label: 'UPDATED', value: 'JUST NOW' },
      ],
      message: 'Record validated, written to database, and confirmed.',
    },
  },
  {
    id: 'report', label: 'GENERATE REPORT',
    route: ['user', 'web', 'api', 'database', 'analytics', 'api', 'web'],
    stepDetails: ['Report requested', 'Parameters sent', 'Query initiated', 'Data retrieved', 'Report rendered', 'Delivered', 'Displayed'],
    result: 'Report generated.',
    output: {
      title: 'REPORT GENERATED', icon: '📊',
      fields: [
        { label: 'ORDERS', value: '142' },
        { label: 'PENDING', value: '12' },
        { label: 'AVG TIME', value: '4.8m' },
        { label: 'PERIOD', value: 'LAST 7 DAYS' },
      ],
      message: 'Data queried, processed through analytics, delivered as report.',
    },
  },
  {
    id: 'notify', label: 'SEND NOTIFICATION',
    route: ['user', 'web', 'api', 'database', 'api', 'notifications'],
    stepDetails: ['Requested', 'Queued', 'Processing', 'Audit logged', 'Dispatched', 'Received'],
    result: 'Notification sent.',
    output: {
      title: 'NOTIFICATION SENT', icon: '🔔',
      fields: [
        { label: 'TO', value: 'OPERATIONS TEAM' },
        { label: 'TYPE', value: 'ORDER ALERT' },
        { label: 'STATUS', value: '✓ DELIVERED' },
        { label: 'CHANNEL', value: 'EMAIL + PUSH' },
      ],
      message: '"Order #1042 requires review."',
    },
  },
  {
    id: 'upload', label: 'UPLOAD FILE',
    route: ['user', 'web', 'api', 'storage', 'database', 'api', 'web'],
    stepDetails: ['Initiated', 'Data sent', 'Authorized', 'Stored', 'Metadata saved', 'Confirmed', 'Complete'],
    result: 'File uploaded and indexed.',
    output: {
      title: 'FILE STORED', icon: '📁',
      fields: [
        { label: 'FILE', value: 'INVOICE-1042.PDF' },
        { label: 'SIZE', value: '248 KB' },
        { label: 'STATUS', value: '✓ STORED' },
        { label: 'INDEXED', value: 'YES' },
      ],
      message: 'File uploaded to storage, metadata saved to database.',
    },
  },
  {
    id: 'automate', label: 'RUN AUTOMATION',
    route: ['automation', 'api', 'database', 'api', 'notifications'],
    stepDetails: ['Triggered', 'Rules evaluated', 'State updated', 'Result dispatched', 'Notification sent'],
    result: 'Automation executed.',
    output: {
      title: 'JOB TRIGGERED', icon: '⚡',
      fields: [
        { label: 'TYPE', value: 'ORDER PROCESSING' },
        { label: 'STATUS', value: 'COMPLETE' },
        { label: 'ACTIONS', value: '3 COMPLETED' },
        { label: 'DURATION', value: '1.2s' },
      ],
      message: 'Record created, notification sent, state updated.',
    },
  },
  {
    id: 'dashboard', label: 'LOAD DASHBOARD',
    route: ['user', 'web', 'api', 'analytics', 'api', 'web'],
    stepDetails: ['Requested', 'Query sent', 'Queries initiated', 'Metrics calculated', 'Data returned', 'Rendered'],
    result: 'Dashboard loaded.',
    output: {
      title: 'DASHBOARD LOADED', icon: '📈',
      fields: [
        { label: 'METRICS', value: '4 DISPLAYED' },
        { label: 'SOURCES', value: '2 CONNECTED' },
        { label: 'LOAD TIME', value: '1.2s' },
        { label: 'STATUS', value: '✓ LIVE' },
      ],
      message: 'Dashboard data queried from analytics and rendered.',
    },
  },
];

export const issueTypes: { id: IssueType; label: string; description: string; affected: string[]; unaffected: string[] }[] = [
  { id: 'none', label: 'NO ISSUES', description: '', affected: [], unaffected: [] },
  { id: 'database_unavailable', label: 'DATABASE DOWN', description: 'Database unreachable. All data operations fail.', affected: ['Save Record', 'Reports', 'Automation state', 'Analytics'], unaffected: ['Static UI', 'Cached data'] },
  { id: 'notification_failure', label: 'NOTIFICATION DOWN', description: 'Notification service not responding.', affected: ['Alerts', 'Email delivery', 'Workflow notifications'], unaffected: ['Core data operations', 'Report generation'] },
  { id: 'external_timeout', label: 'EXTERNAL TIMEOUT', description: 'Third-party service unresponsive.', affected: ['External data sync', 'Third-party features'], unaffected: ['Internal operations', 'Core logic'] },
];

export function getNeighbors(nodeId: NodeId): { upstream: NodeId[]; downstream: NodeId[] } {
  return {
    upstream: edges.filter(e => e.to === nodeId).map(e => e.from),
    downstream: edges.filter(e => e.from === nodeId).map(e => e.to),
  };
}

export function getRelatedNodes(nodeId: NodeId): Set<NodeId> {
  const { upstream, downstream } = getNeighbors(nodeId);
  return new Set([nodeId, ...upstream, ...downstream]);
}

export function getScenarioRoute(scenarioId: string, issue: IssueType): NodeId[] {
  const scenario = scenarios.find(s => s.id === scenarioId);
  if (!scenario || issue === 'none') return scenario?.route || [];
  const failNode: Record<string, NodeId> = { database_unavailable: 'database', notification_failure: 'notifications', external_timeout: 'external' };
  const failAt = failNode[issue];
  if (!failAt) return scenario.route;
  const idx = scenario.route.indexOf(failAt);
  return idx === -1 ? scenario.route : scenario.route.slice(0, idx + 1);
}

export function getRelatedScenarios(nodeId: NodeId): ArchScenario[] {
  return scenarios.filter(s => s.route.includes(nodeId));
}

export function isEdgeInRoute(from: NodeId, to: NodeId, route: NodeId[]): boolean {
  for (let i = 0; i < route.length - 1; i++) {
    if (route[i] === from && route[i + 1] === to) return true;
  }
  return false;
}

export function getEdgePathD(from: NodeId, to: NodeId): string {
  const p1 = NODE_POSITIONS[from];
  const p2 = NODE_POSITIONS[to];
  const curve = EDGE_CURVES[`${from}-${to}`] || 0;
  if (curve === 0) return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
  const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
  const dx = p2.x - p1.x, dy = p2.y - p1.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return `M ${p1.x} ${p1.y} Q ${mx + (-dy / len) * curve} ${my + (dx / len) * curve} ${p2.x} ${p2.y}`;
}

export function getFailingNode(issue: IssueType): NodeId | null {
  const map: Record<string, NodeId> = { database_unavailable: 'database', notification_failure: 'notifications', external_timeout: 'external' };
  return map[issue] || null;
}
