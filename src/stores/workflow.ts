import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface WorkflowEvent {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error';
  docId: string;
}

export const useWorkflowStore = defineStore('workflow', () => {
  const logs = ref<WorkflowEvent[]>([]);
  const isProcessing = ref(false);

  const addLog = (message: string, docId: string, type: WorkflowEvent['type'] = 'info') => {
    logs.value.unshift({
      timestamp: new Date().toLocaleTimeString(),
      message,
      type,
      docId
    });
  };

  const clearLogs = () => {
    logs.value = [];
  };

  return {
    logs,
    isProcessing,
    addLog,
    clearLogs
  };
});
