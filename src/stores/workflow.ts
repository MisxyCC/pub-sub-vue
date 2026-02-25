import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface WorkflowEvent {
  timestamp: string
  message: string
  type: 'info' | 'success' | 'error'
  docId: string
}

export interface KanbanItem {
  id: string
  docId: string
  event: string
}

export interface KanbanData {
  waiting: KanbanItem[]
  processing: KanbanItem[]
  completed: KanbanItem[]
}

export const useWorkflowStore = defineStore('workflow', () => {
  const logs = ref<WorkflowEvent[]>([])
  const isProcessing = ref(false)
  const kanbanData = ref<KanbanData>({
    waiting: [],
    processing: [],
    completed: [],
  })

  const setKanbanData = (data: KanbanData) => {
    kanbanData.value = data
  }

  const addLog = (message: string, docId: string, type: WorkflowEvent['type'] = 'info') => {
    logs.value.unshift({
      timestamp: new Date().toLocaleTimeString(),
      message,
      type,
      docId,
    })
  }

  const clearLogs = () => {
    logs.value = []
  }

  return {
    logs,
    isProcessing,
    kanbanData,
    setKanbanData,
    addLog,
    clearLogs,
  }
})
