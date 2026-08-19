export type Period = 'today' | '7days' | '30days';
export type Location = 'all' | 'north' | 'central' | 'south';

export interface MetricsData {
  revenue: number;
  orders: { completed: number; processing: number; cancelled: number };
  tasks: { open: number; inProgress: number; blocked: number };
  alerts: { lowStock: number; pendingApproval: number; syncWarning: number };
  approvals: { pending: number; approved: number; rejected: number };
  chart: number[];
  activities: ActivityItem[];
}

export interface ActivityItem {
  text: string;
  location: Location;
  type: 'order' | 'inventory' | 'report' | 'approval' | 'alert' | 'task' | 'sync' | 'login';
  time: string;
}

export const locationLabels: Record<Location, string> = {
  all: 'ALL', north: 'NORTH', central: 'CENTRAL', south: 'SOUTH',
};

export const periodLabels: Record<Period, string> = {
  today: 'TODAY', '7days': '7 DAYS', '30days': '30 DAYS',
};

const northActivities: ActivityItem[] = [
  { text: 'Order completed — #4821', location: 'north', type: 'order', time: '14:32' },
  { text: 'Inventory low — SKU 3091', location: 'north', type: 'inventory', time: '14:18' },
  { text: 'Report generated — North Daily', location: 'north', type: 'report', time: '13:45' },
  { text: 'Approval completed — Task #87', location: 'north', type: 'approval', time: '13:22' },
  { text: 'Stock alert — Item 2091', location: 'north', type: 'alert', time: '12:58' },
  { text: 'Sync completed — API North', location: 'north', type: 'sync', time: '12:30' },
];

const centralActivities: ActivityItem[] = [
  { text: 'Order completed — #4798', location: 'central', type: 'order', time: '14:28' },
  { text: 'Task assigned — Q4 Review', location: 'central', type: 'task', time: '14:10' },
  { text: 'Report generated — Central Weekly', location: 'central', type: 'report', time: '13:50' },
  { text: 'Approval pending — Invoice #204', location: 'central', type: 'approval', time: '13:30' },
  { text: 'Inventory updated — Central Hub', location: 'central', type: 'inventory', time: '12:45' },
  { text: 'User login — central_shift', location: 'central', type: 'login', time: '12:15' },
];

const southActivities: ActivityItem[] = [
  { text: 'Order completed — #4805', location: 'south', type: 'order', time: '14:35' },
  { text: 'Report generated — South Summary', location: 'south', type: 'report', time: '14:00' },
  { text: 'Task blocked — Waiting on review', location: 'south', type: 'task', time: '13:40' },
  { text: 'Sync warning — South API lag', location: 'south', type: 'alert', time: '13:15' },
  { text: 'Approval completed — Task #91', location: 'south', type: 'approval', time: '12:50' },
  { text: 'Inventory updated — South SKU', location: 'south', type: 'inventory', time: '12:20' },
];

const allActivities = [...northActivities, ...centralActivities, ...southActivities]
  .sort((a, b) => b.time.localeCompare(a.time));

export const operationsData: Record<Period, Record<Location, MetricsData>> = {
  today: {
    all: {
      revenue: 12847,
      orders: { completed: 98, processing: 32, cancelled: 12 },
      tasks: { open: 14, inProgress: 18, blocked: 6 },
      alerts: { lowStock: 2, pendingApproval: 2, syncWarning: 1 },
      approvals: { pending: 4, approved: 3, rejected: 1 },
      chart: [20,35,28,45,38,52,48,65,58,72,68,85],
      activities: allActivities,
    },
    north: {
      revenue: 5231,
      orders: { completed: 42, processing: 14, cancelled: 5 },
      tasks: { open: 6, inProgress: 8, blocked: 3 },
      alerts: { lowStock: 1, pendingApproval: 1, syncWarning: 0 },
      approvals: { pending: 2, approved: 1, rejected: 0 },
      chart: [12,22,18,30,25,35,32,42,38,48,44,55],
      activities: northActivities,
    },
    central: {
      revenue: 4892,
      orders: { completed: 36, processing: 12, cancelled: 4 },
      tasks: { open: 5, inProgress: 6, blocked: 2 },
      alerts: { lowStock: 1, pendingApproval: 1, syncWarning: 1 },
      approvals: { pending: 1, approved: 1, rejected: 1 },
      chart: [8,13,10,15,13,17,16,23,20,24,24,30],
      activities: centralActivities,
    },
    south: {
      revenue: 2724,
      orders: { completed: 20, processing: 6, cancelled: 3 },
      tasks: { open: 3, inProgress: 4, blocked: 1 },
      alerts: { lowStock: 0, pendingApproval: 0, syncWarning: 0 },
      approvals: { pending: 1, approved: 1, rejected: 0 },
      chart: [5,8,6,8,7,8,8,10,9,10,10,12],
      activities: southActivities,
    },
  },
  '7days': {
    all: {
      revenue: 89420,
      orders: { completed: 712, processing: 218, cancelled: 94 },
      tasks: { open: 82, inProgress: 108, blocked: 55 },
      alerts: { lowStock: 8, pendingApproval: 6, syncWarning: 4 },
      approvals: { pending: 28, approved: 18, rejected: 6 },
      chart: [40,55,62,48,72,80,68,85,78,92,88,95],
      activities: allActivities,
    },
    north: {
      revenue: 38200,
      orders: { completed: 310, processing: 92, cancelled: 40 },
      tasks: { open: 35, inProgress: 46, blocked: 22 },
      alerts: { lowStock: 3, pendingApproval: 3, syncWarning: 2 },
      approvals: { pending: 12, approved: 8, rejected: 2 },
      chart: [18,25,28,22,32,36,30,38,35,42,40,43],
      activities: northActivities,
    },
    central: {
      revenue: 32100,
      orders: { completed: 256, processing: 82, cancelled: 34 },
      tasks: { open: 30, inProgress: 40, blocked: 20 },
      alerts: { lowStock: 3, pendingApproval: 2, syncWarning: 1 },
      approvals: { pending: 10, approved: 6, rejected: 2 },
      chart: [15,20,22,18,27,30,26,32,30,34,32,35],
      activities: centralActivities,
    },
    south: {
      revenue: 19120,
      orders: { completed: 146, processing: 44, cancelled: 20 },
      tasks: { open: 17, inProgress: 22, blocked: 13 },
      alerts: { lowStock: 2, pendingApproval: 1, syncWarning: 1 },
      approvals: { pending: 6, approved: 4, rejected: 2 },
      chart: [7,10,12,8,13,14,12,15,13,16,16,17],
      activities: southActivities,
    },
  },
  '30days': {
    all: {
      revenue: 348910,
      orders: { completed: 2840, processing: 890, cancelled: 398 },
      tasks: { open: 320, inProgress: 425, blocked: 235 },
      alerts: { lowStock: 28, pendingApproval: 22, syncWarning: 14 },
      approvals: { pending: 112, approved: 68, rejected: 18 },
      chart: [60,72,68,85,78,92,88,95,90,98,96,105],
      activities: allActivities,
    },
    north: {
      revenue: 148200,
      orders: { completed: 1210, processing: 380, cancelled: 170 },
      tasks: { open: 136, inProgress: 180, blocked: 100 },
      alerts: { lowStock: 12, pendingApproval: 10, syncWarning: 6 },
      approvals: { pending: 48, approved: 28, rejected: 8 },
      chart: [26,32,30,38,34,42,38,42,40,44,42,48],
      activities: northActivities,
    },
    central: {
      revenue: 124310,
      orders: { completed: 1008, processing: 320, cancelled: 140 },
      tasks: { open: 114, inProgress: 150, blocked: 82 },
      alerts: { lowStock: 10, pendingApproval: 8, syncWarning: 5 },
      approvals: { pending: 40, approved: 24, rejected: 6 },
      chart: [22,27,26,30,30,32,32,33,32,34,34,37],
      activities: centralActivities,
    },
    south: {
      revenue: 76400,
      orders: { completed: 622, processing: 190, cancelled: 88 },
      tasks: { open: 70, inProgress: 95, blocked: 53 },
      alerts: { lowStock: 6, pendingApproval: 4, syncWarning: 3 },
      approvals: { pending: 24, approved: 16, rejected: 4 },
      chart: [12,13,12,17,14,18,18,20,18,20,20,20],
      activities: southActivities,
    },
  },
};

export function getOperationsDataset(period: Period, location: Location): MetricsData {
  return operationsData[period][location];
}

export function fmt(n: number): string {
  return n >= 1000 ? '$' + n.toLocaleString() : '$' + n;
}
