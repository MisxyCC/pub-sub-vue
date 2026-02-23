<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useWorkflowStore } from '@/stores/workflow';

const workflowStore = useWorkflowStore();
const documentId = ref<string>('');
const isMockMode = ref<boolean>(true);

const API_BASE = 'http://localhost:3000/workflow';

interface WorkflowResponse {
  success: boolean;
  messageId?: string;
  status?: string;
  message?: string;
}

const mockResponse = (docId: string, action: string): WorkflowResponse => ({
  success: true,
  messageId: `EVT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
  status: action === 'submit' ? 'SUBMITTED' : 'APPROVED',
  message: `Mock action ${action} for ${docId} completed.`
});

const handleSubmit = async () => {
  if (!documentId.value) return;
  workflowStore.isProcessing = true;

  try {
    if (isMockMode.value) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const data = mockResponse(documentId.value, 'submit');
      workflowStore.addLog(`Submitted Document: ${documentId.value} (EventID: ${data.messageId})`, documentId.value, 'success');
    } else {
      const response = await axios.post<WorkflowResponse>(`${API_BASE}/submit`, {
        docId: documentId.value,
        userId: 'EMP-001'
      });
      const data = response.data;
      if (data.success) {
        workflowStore.addLog(`Submitted Document: ${documentId.value} (EventID: ${data.messageId})`, documentId.value, 'success');
      } else {
        workflowStore.addLog(`Failed: ${data.message}`, documentId.value, 'error');
      }
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'API connection failed';
    workflowStore.addLog(`Error: ${errorMsg}. Reverting to Mock Mode.`, documentId.value, 'error');
    isMockMode.value = true;
  } finally {
    workflowStore.isProcessing = false;
  }
};

const handleApprove = async () => {
  if (!documentId.value) return;
  workflowStore.isProcessing = true;

  try {
    if (isMockMode.value) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const data = mockResponse(documentId.value, 'approve');
      workflowStore.addLog(`Approved Document: ${documentId.value} (EventID: ${data.messageId})`, documentId.value, 'success');
    } else {
      const response = await axios.post<WorkflowResponse>(`${API_BASE}/approve`, {
        docId: documentId.value,
        approverId: 'MGR-999'
      });
      const data = response.data;
      if (data.success) {
        workflowStore.addLog(`Approved Document: ${documentId.value} (EventID: ${data.messageId})`, documentId.value, 'success');
      } else {
        workflowStore.addLog(`Failed: ${data.message}`, documentId.value, 'error');
      }
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'API connection failed';
    workflowStore.addLog(`Error: ${errorMsg}. Reverting to Mock Mode.`, documentId.value, 'error');
    isMockMode.value = true;
  } finally {
    workflowStore.isProcessing = false;
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-12">
    <div class="mb-12">
      <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
        Workflow Pub/Sub Demo
      </h1>
      <p class="text-lg text-gray-600">
        Simulate document approval events using Redis Streams-like architecture.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div class="space-y-8">
        <section class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 class="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
            Document Controls
          </h2>

          <div class="space-y-6">
            <div class="flex flex-col gap-2">
              <label for="docId" class="text-sm font-medium text-gray-700">Document ID</label>
              <input
                id="docId"
                v-model="documentId"
                type="text"
                placeholder="e.g., DOC-2026-001"
                :disabled="workflowStore.isProcessing"
                class="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 transition-all text-lg font-mono"
              />
            </div>

            <div class="flex flex-wrap gap-4 pt-2">
              <button
                @click="handleSubmit"
                :disabled="workflowStore.isProcessing || !documentId"
                class="flex-1 px-6 py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-0.5 focus:ring-4 focus:ring-blue-500/20 active:translate-y-0 disabled:opacity-50 disabled:translate-y-0 transition-all cursor-pointer"
              >
                Submit Request
              </button>
              <button
                @click="handleApprove"
                :disabled="workflowStore.isProcessing || !documentId"
                class="flex-1 px-6 py-3.5 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 hover:-translate-y-0.5 focus:ring-4 focus:ring-emerald-500/20 active:translate-y-0 disabled:opacity-50 disabled:translate-y-0 transition-all cursor-pointer"
              >
                Approve Action
              </button>
            </div>
          </div>
        </section>

        <section class="bg-gray-100 p-6 rounded-2xl border border-gray-200">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-gray-700">Environment Settings</h3>
            <div class="flex items-center gap-3">
              <span class="text-sm text-gray-500">{{ isMockMode ? 'Mock Mode' : 'Live API' }}</span>
              <button
                @click="isMockMode = !isMockMode"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                :class="isMockMode ? 'bg-blue-600' : 'bg-gray-300'"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="isMockMode ? 'translate-x-6' : 'translate-x-1'"
                />
              </button>
            </div>
          </div>
        </section>
      </div>

      <div class="flex flex-col h-150">
        <div class="bg-slate-900 rounded-2xl shadow-2xl flex flex-col h-full overflow-hidden border border-slate-800">
          <div class="px-6 py-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Event Stream
            </h3>
            <button
              @click="workflowStore.clearLogs"
              class="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Clear Logs
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-6 space-y-4">
            <div
              v-for="(log, index) in workflowStore.logs"
              :key="index"
              class="group flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <div class="shrink-0 pt-1">
                <div
                  class="w-1.5 h-1.5 rounded-full"
                  :class="{
                    'bg-emerald-400': log.type === 'success',
                    'bg-rose-400': log.type === 'error',
                    'bg-slate-500': log.type === 'info'
                  }"
                ></div>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-[11px] font-mono text-slate-500 group-hover:text-slate-400 transition-colors">
                  {{ log.timestamp }} • {{ log.docId }}
                </span>
                <p
                  class="text-sm leading-relaxed"
                  :class="{
                    'text-emerald-300': log.type === 'success',
                    'text-rose-300': log.type === 'error',
                    'text-slate-300': log.type === 'info'
                  }"
                >
                  {{ log.message }}
                </p>
              </div>
            </div>

            <div v-if="workflowStore.logs.length === 0" class="flex flex-col items-center justify-center h-full text-slate-500 gap-4 opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p class="text-sm font-medium">No events captured yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
