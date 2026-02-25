<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const documentId = ref<string>('');
const isProcessing = ref<boolean>(false);
const API_BASE = 'http://localhost:3000/workflow';

// สถานะของ Kanban Board
const kanbanData = ref({ waiting: [], processing: [], completed: [] });
let pollingInterval: number;

const fetchKanbanStatus = async () => {
  try {
    const res = await fetch(`${API_BASE}/status`);
    kanbanData.value = await res.json();
  } catch (error) {
    console.error('Cannot fetch status');
  }
};

onMounted(() => {
  fetchKanbanStatus();
  // อัปเดตข้อมูลทุกๆ 1 วินาที
  pollingInterval = setInterval(fetchKanbanStatus, 1000) as unknown as number;
});

onUnmounted(() => {
  clearInterval(pollingInterval);
});

const handleAction = async (endpoint: 'submit' | 'approve') => {
  if (!documentId.value) return;
  isProcessing.value = true;
  const payload = endpoint === 'submit'
    ? { docId: documentId.value, userId: 'EMP-001' }
    : { docId: documentId.value, approverId: 'MGR-999' };

  try {
    await fetch(`${API_BASE}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    documentId.value = ''; // ล้างช่องกรอกเมื่อส่งสำเร็จ
    fetchKanbanStatus(); // สั่งดึงสถานะทันทีไม่ต้องรอรอบบิล
  } finally {
    isProcessing.value = false;
  }
};
</script>

<template>
  <div class="max-w-6xl mx-auto mt-10 p-6 font-sans text-gray-800">
    <div class="flex justify-between items-end mb-8 border-b pb-4">
      <div>
        <h2 class="text-3xl font-bold text-gray-900">Redis Stream: Live Kanban</h2>
        <p class="text-gray-500 mt-2">Visualizing Event-Driven Architecture and Background Workers</p>
      </div>

      <div class="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm border">
        <input
          v-model="documentId" type="text" placeholder="Doc ID (e.g., DOC-001)"
          :disabled="isProcessing"
          class="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none w-48"
        />
        <button @click="handleAction('submit')" :disabled="isProcessing || !documentId" class="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 disabled:opacity-50 transition">
          Submit
        </button>
        <button @click="handleAction('approve')" :disabled="isProcessing || !documentId" class="px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600 disabled:opacity-50 transition">
          Approve
        </button>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-6">

      <div class="bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-inner h-[600px] overflow-y-auto">
        <h3 class="text-lg font-bold text-gray-700 mb-4 flex justify-between">
          <span>📝 1. In Queue</span>
          <span class="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-sm">{{ kanbanData.waiting.length }}</span>
        </h3>
        <div v-for="card in kanbanData.waiting" :key="card.id" class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-gray-400 mb-3 animate-pulse">
          <div class="text-xs text-gray-400 mb-1">ID: {{ card.id }}</div>
          <div class="font-bold text-gray-800">{{ card.docId }}</div>
          <div class="text-sm font-semibold text-blue-600 mt-2">{{ card.event }}</div>
        </div>
      </div>

      <div class="bg-blue-50 rounded-xl p-4 border border-blue-100 shadow-inner h-[600px] overflow-y-auto">
        <h3 class="text-lg font-bold text-blue-800 mb-4 flex justify-between">
          <span>⚙️ 2. Processing (Worker Active)</span>
          <span class="bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full text-sm">{{ kanbanData.processing.length }}</span>
        </h3>
        <div v-for="card in kanbanData.processing" :key="card.id" class="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500 mb-3 ring-2 ring-blue-200">
          <div class="text-xs text-gray-400 mb-1">ID: {{ card.id }}</div>
          <div class="font-bold text-gray-800">{{ card.docId }}</div>
          <div class="text-sm font-semibold text-blue-600 mt-2 flex items-center gap-2">
            <svg class="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Working on {{ card.event }}
          </div>
        </div>
      </div>

      <div class="bg-green-50 rounded-xl p-4 border border-green-100 shadow-inner h-[600px] overflow-y-auto">
        <h3 class="text-lg font-bold text-green-800 mb-4 flex justify-between">
          <span>✅ 3. Acknowledged (XACK)</span>
          <span class="bg-green-200 text-green-800 px-2 py-0.5 rounded-full text-sm">{{ kanbanData.completed.length }}</span>
        </h3>
        <div v-for="card in kanbanData.completed" :key="card.id" class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500 mb-3 opacity-75">
          <div class="text-xs text-gray-400 mb-1">ID: {{ card.id }}</div>
          <div class="font-bold text-gray-800 line-through decoration-gray-300">{{ card.docId }}</div>
          <div class="text-sm font-semibold text-green-600 mt-2">Done: {{ card.event }}</div>
        </div>
      </div>

    </div>
  </div>
</template>
