export type NodeType = 'trigger' | 'filter' | 'transform' | 'approval' | 'action' | 'notification' | 'delay';
export type NodeStatus = 'idle' | 'processing' | 'success' | 'filtered' | 'denied' | 'error';
export type WorkflowStatus = 'idle' | 'running' | 'success' | 'filtered' | 'denied';

export interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  config: Record<string, string>;
}

export interface Payload {
  name: string;
  amount: number;
  customer: string;
  paid: boolean;
  [key: string]: unknown;
}

export interface NodeExecution {
  nodeId: string;
  input: string;
  output: string;
  status: NodeStatus;
  duration: number;
}

export interface WorkflowExecution {
  status: WorkflowStatus;
  nodes: NodeExecution[];
  logs: string[];
  totalDuration: number;
}

const triggers = ['Form Submitted', 'New Order', 'New Email'];
const filterConditions = ['Amount > 1000', 'Amount > 5000', 'Paid = Yes', 'Paid = No'];
const transformOps = ['Capitalize Name', 'Add Status Field', 'Format Currency', 'Lowercase All'];
const approvalActions = ['Auto Approve', 'Require Manual', 'Escalate'];
const actionTypes = ['Create Record', 'Update Spreadsheet', 'Generate Report'];
const notificationTypes = ['Email Alert', 'Dashboard Update', 'Slack Message'];

export function getOptionsForType(type: NodeType): string[] {
  switch (type) {
    case 'trigger': return triggers;
    case 'filter': return filterConditions;
    case 'transform': return transformOps;
    case 'approval': return approvalActions;
    case 'action': return actionTypes;
    case 'notification': return notificationTypes;
    case 'delay': return ['1 second', '5 seconds', '30 seconds'];
  }
}

export function getDefaultNode(type: NodeType): WorkflowNode {
  const opts = getOptionsForType(type);
  return { id: 'n' + Date.now(), type, label: opts[0], config: {} };
}

function evaluateFilter(condition: string, payload: Payload): boolean {
  if (condition === 'Amount > 1000') return payload.amount > 1000;
  if (condition === 'Amount > 5000') return payload.amount > 5000;
  if (condition === 'Paid = Yes') return payload.paid;
  if (condition === 'Paid = No') return !payload.paid;
  return true;
}

function applyTransform(op: string, payload: Payload): Payload {
  const p = { ...payload };
  if (op === 'Capitalize Name') p.name = p.name.charAt(0).toUpperCase() + p.name.slice(1);
  if (op === 'Add Status Field') (p as Record<string, unknown>).status = 'normalized';
  if (op === 'Format Currency') (p as Record<string, unknown>).formattedAmount = '$' + p.amount.toLocaleString();
  if (op === 'Lowercase All') p.name = p.name.toLowerCase();
  return p;
}

function evaluateApproval(action: string, _payload: Payload): 'approved' | 'denied' {
  if (action === 'Auto Approve') return 'approved';
  if (action === 'Require Manual') return 'approved';
  if (action === 'Escalate') return 'approved';
  return 'approved';
}

const now = () => {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
};

export function executeWorkflow(nodes: WorkflowNode[], payload: Payload): WorkflowExecution {
  const execNodes: NodeExecution[] = [];
  const logs: string[] = [];
  let currentPayload = { ...payload };
  let filtered = false;
  let denied = false;

  logs.push(`${now()} workflow.started`);
  logs.push(`${now()} payload.amount = ${payload.amount}, paid = ${payload.paid}`);

  for (const node of nodes) {
    const start = Date.now();
    let status: NodeStatus = 'processing';
    let input = JSON.stringify(currentPayload, null, 0);
    let output = input;

    if (node.type === 'filter') {
      const passed = evaluateFilter(node.label, currentPayload);
      status = passed ? 'success' : 'filtered';
      logs.push(`${now()} ${node.label.toLowerCase().replace(/\s+/g, '.')} → ${passed ? 'PASSED' : 'FILTERED OUT'}`);
      if (!passed) {
        filtered = true;
        execNodes.push({ nodeId: node.id, input, output: 'BLOCKED', status, duration: Date.now() - start + Math.floor(Math.random() * 20 + 5) });
        break;
      }
    } else if (node.type === 'transform') {
      currentPayload = applyTransform(node.label, currentPayload);
      output = JSON.stringify(currentPayload, null, 0);
      status = 'success';
      logs.push(`${now()} ${node.label.toLowerCase().replace(/\s+/g, '.')} → applied`);
    } else if (node.type === 'approval') {
      const result = evaluateApproval(node.label, currentPayload);
      status = result === 'approved' ? 'success' : 'denied';
      if (result === 'denied') {
        denied = true;
        logs.push(`${now()} approval.rejected`);
        execNodes.push({ nodeId: node.id, input, output: 'REJECTED', status, duration: Date.now() - start + Math.floor(Math.random() * 20 + 5) });
        break;
      }
      logs.push(`${now()} approval.granted`);
    } else if (node.type === 'delay') {
      status = 'success';
      logs.push(`${now()} delay.applied (${node.label})`);
    } else if (node.type === 'notification') {
      status = 'success';
      logs.push(`${now()} notification.sent → ${node.label}`);
    } else {
      status = 'success';
      logs.push(`${now()} ${node.type}.processed → ${node.label}`);
    }

    execNodes.push({ nodeId: node.id, input, output, status, duration: Date.now() - start + Math.floor(Math.random() * 30 + 8) });
  }

  const totalDuration = execNodes.reduce((sum, n) => sum + n.duration, 0);

  if (filtered) {
    logs.push(`${now()} workflow.stopped (filter)`);
    return { status: 'filtered', nodes: execNodes, logs, totalDuration };
  }
  if (denied) {
    logs.push(`${now()} workflow.stopped (denied)`);
    return { status: 'denied', nodes: execNodes, logs, totalDuration };
  }

  logs.push(`${now()} workflow.complete · ${totalDuration}ms`);
  return { status: 'success', nodes: execNodes, logs, totalDuration };
}
