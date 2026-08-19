export type FieldType = 'AMOUNT' | 'PRIORITY' | 'CATEGORY';
export type Operator = 'GREATER THAN' | 'LESS THAN' | 'EQUALS' | 'DOES NOT EQUAL';
export type RuleAction = 'REQUIRE APPROVAL' | 'SKIP REVIEW' | 'FLAG REQUEST' | 'STOP PROCESS';

export interface ProcessStep {
  id: string;
  name: string;
  enabled: boolean;
  type: 'request' | 'review' | 'approval' | 'action' | 'complete';
}

export interface ProcessRule {
  enabled: boolean;
  field: FieldType;
  operator: Operator;
  value: string;
  action: RuleAction;
}

export interface ProcessTestInput {
  amount: string;
  priority: string;
  category: string;
}

export type ProcessStatus = 'idle' | 'running' | 'success' | 'stopped';

export interface StepExecution {
  stepId: string;
  name: string;
  status: 'pending' | 'active' | 'completed' | 'skipped' | 'blocked';
  triggeredRule?: string;
}

const defaultSteps: ProcessStep[] = [
  { id: '1', name: 'REQUEST', enabled: true, type: 'request' },
  { id: '2', name: 'REVIEW', enabled: true, type: 'review' },
  { id: '3', name: 'APPROVAL', enabled: true, type: 'approval' },
  { id: '4', name: 'COMPLETE', enabled: true, type: 'complete' },
];

export { defaultSteps };

let counter = 5;

export function createStep(name: string): ProcessStep {
  return { id: String(counter++), name: name.toUpperCase(), enabled: true, type: 'action' };
}

function evaluateRule(rule: ProcessRule, input: ProcessTestInput): boolean {
  if (!rule.enabled) return false;

  let fieldValue: number;
  if (rule.field === 'AMOUNT') {
    fieldValue = parseFloat(input.amount.replace(/,/g, '')) || 0;
  } else if (rule.field === 'PRIORITY') {
    fieldValue = parseInt(input.priority) || 0;
  } else {
    fieldValue = 0;
  }

  const threshold = parseFloat(rule.value.replace(/,/g, '')) || 0;

  switch (rule.operator) {
    case 'GREATER THAN': return fieldValue > threshold;
    case 'LESS THAN': return fieldValue < threshold;
    case 'EQUALS': return fieldValue === threshold;
    case 'DOES NOT EQUAL': return fieldValue !== threshold;
    default: return false;
  }
}

export function getProcessRoute(
  steps: ProcessStep[],
  rule: ProcessRule,
  input: ProcessTestInput
): string[] {
  const enabledSteps = steps.filter((s) => s.enabled);
  const ruleTriggered = evaluateRule(rule, input);

  if (!ruleTriggered) {
    return enabledSteps.map((s) => s.name);
  }

  // Rule action determines path modification
  const result: string[] = [];
  for (const step of enabledSteps) {
    if (rule.action === 'SKIP REVIEW' && step.type === 'review') continue;
    if (rule.action === 'STOP PROCESS' && step.type === 'review') {
      result.push(step.name);
      result.push('BLOCKED');
      return result;
    }
    result.push(step.name);
  }
  return result;
}

export function executeProcess(
  steps: ProcessStep[],
  rule: ProcessRule,
  input: ProcessTestInput
): { route: string[]; execution: StepExecution[]; logs: string[]; status: ProcessStatus; ruleTriggered: boolean } {
  const enabledSteps = steps.filter((s) => s.enabled);
  const ruleTriggered = evaluateRule(rule, input);
  const execution: StepExecution[] = [];
  const logs: string[] = [];
  let status: ProcessStatus = 'running';

  const requestId = 100 + Math.floor(Math.random() * 900);
  logs.push(`request.created #${requestId}`);
  logs.push(`input.amount = ${input.amount}`);

  if (rule.enabled && ruleTriggered) {
    logs.push(`rule.matched → ${rule.field} ${rule.operator} ${rule.value}`);
    logs.push(`action → ${rule.action}`);
  } else if (rule.enabled) {
    logs.push(`rule.evaluated → condition not met`);
  }

  for (const step of enabledSteps) {
    // Check if rule stops before this step
    if (rule.enabled && ruleTriggered && rule.action === 'STOP PROCESS' && step.type === 'review') {
      execution.push({ stepId: step.id, name: step.name, status: 'blocked', triggeredRule: 'STOP PROCESS' });
      logs.push(`${step.name.toLowerCase()} → BLOCKED by rule`);
      status = 'stopped';
      break;
    }

    // Check if rule skips this step
    if (rule.enabled && ruleTriggered && rule.action === 'SKIP REVIEW' && step.type === 'review') {
      execution.push({ stepId: step.id, name: step.name, status: 'skipped', triggeredRule: 'SKIP REVIEW' });
      logs.push(`${step.name.toLowerCase()} → SKIPPED by rule`);
      continue;
    }

    execution.push({ stepId: step.id, name: step.name, status: 'active' });
    logs.push(`${step.name.toLowerCase()} → processing`);

    // Mark completed
    execution[execution.length - 1].status = 'completed';
    logs.push(`${step.name.toLowerCase()} → done`);
  }

  if (status !== 'stopped') {
    status = 'success';
    logs.push('process.complete');
  }

  return { route: enabledSteps.map((s) => s.name), execution, logs, status, ruleTriggered };
}
