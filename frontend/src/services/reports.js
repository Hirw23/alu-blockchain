import api from '../api';

export const reportsService = {
  createDefinition: (data) => api.post('/reports', data),
  getDefinitions: (params) => api.get('/reports', { params }),
  getDefinition: (id) => api.get(`/reports/${id}`),
  deleteDefinition: (id) => api.delete(`/reports/${id}`),
  exportReport: (id, format) => api.post(`/reports/${id}/export`, { format }),
  downloadReport: (id) => api.get(`/reports/${id}/download`, { responseType: 'blob' }),
  getExportHistory: (id) => api.get(`/reports/${id}/history`),

  createSchedule: (data) => api.post('/reports/schedules', data),
  getSchedules: (params) => api.get('/reports/schedules', { params }),
  updateSchedule: (id, data) => api.patch(`/reports/schedules/${id}`, data),
  deleteSchedule: (id) => api.delete(`/reports/schedules/${id}`),
};

export const REPORT_TYPES = [
  'BUSINESS',
  'PRODUCT',
  'SUPPLY_CHAIN',
  'VERIFICATION',
  'COOPERATIVE',
  'PLATFORM',
  'SYSTEM_ACTIVITY',
];

// PDF/EXCEL write placeholder text server-side, not real binary files (backend-review.md §3) —
// surfaced in the UI as "simulated download".
export const REPORT_FORMATS = ['CSV', 'JSON', 'PDF', 'EXCEL'];
export const SIMULATED_REPORT_FORMATS = ['PDF', 'EXCEL'];

export const REPORT_SCHEDULE_FREQUENCIES = ['DAILY', 'WEEKLY', 'MONTHLY'];

export default reportsService;
