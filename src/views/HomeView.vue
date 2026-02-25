<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { useWorkflowStore } from '@/stores/workflow'
import { storeToRefs } from 'pinia'

const store = useWorkflowStore()
const { kanbanData } = storeToRefs(store)
const { setKanbanData } = store

const documentId = ref<string>('')
const isProcessingLocal = ref<boolean>(false)
const API_BASE = 'http://localhost:3000/workflow'

// ตัวแปรเก็บ Connection ของ SSE
let eventSource: EventSource | null = null

const fetchKanbanStatus = async () => {
  try {
    const response = await axios.get(`${API_BASE}/status`)
    setKanbanData(response.data)
  } catch (error) {
    console.error('Failed to fetch initial status:', error)
    // Mock Mode: ถ้าเชื่อมต่อ Backend ไม่ได้ ให้ใส่ข้อมูลจำลองไว้ก่อน
    if (kanbanData.value.waiting.length === 0 && kanbanData.value.processing.length === 0) {
      console.warn('Backend unavailable, using mock data mode')
    }
  }
}

onMounted(async () => {
  // 1. ดึงข้อมูลเริ่มต้นทันทีที่โหลดหน้า
  await fetchKanbanStatus()

  // 2. เปิดการเชื่อมต่อ Server-Sent Events สำหรับ Real-time updates
  eventSource = new EventSource(`${API_BASE}/status-stream`)

  eventSource.onmessage = (event) => {
    // อัปเดตข้อมูลลง Store
    setKanbanData(JSON.parse(event.data))
  }

  eventSource.onerror = (error) => {
    console.error('SSE Connection Error:', error)
  }
})

onUnmounted(() => {
  if (eventSource) {
    eventSource.close()
  }
})

const handleAction = async (endpoint: 'submit' | 'approve') => {
  if (!documentId.value) return
  isProcessingLocal.value = true

  const payload =
    endpoint === 'submit'
      ? { docId: documentId.value, userId: 'EMP-001' }
      : { docId: documentId.value, approverId: 'MGR-999' }

  try {
    await axios.post(`${API_BASE}/${endpoint}`, payload)
    documentId.value = ''
    // หลังส่ง Action สำเร็จ เราไม่จำเป็นต้อง fetch ใหม่ เพราะ SSE จะส่งข้อมูลใหม่มาให้เอง
  } catch (error) {
    console.error('Action failed:', error)
  } finally {
    isProcessingLocal.value = false
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto mt-10 p-6 font-sans text-gray-800">
    <div class="flex justify-between items-end mb-8 border-b pb-4">
      <div>
        <h2 class="text-3xl font-bold text-gray-900">Redis Stream: Live Kanban</h2>
        <p class="text-gray-500 mt-2">Powered by Axios & Server-Sent Events (SSE)</p>
      </div>

      <div class="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm border">
        <input
          v-model="documentId"
          type="text"
          placeholder="Doc ID (e.g., DOC-001)"
          :disabled="isProcessing"
          class="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none w-48"
        />
        <button
          @click="handleAction('submit')"
          :disabled="isProcessing || !documentId"
          class="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 disabled:opacity-50 transition"
        >
          Submit
        </button>
        <button
          @click="handleAction('approve')"
          :disabled="isProcessing || !documentId"
          class="px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600 disabled:opacity-50 transition"
        >
          Approve
        </button>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-6">
      <div
        class="bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-inner h-[600px] overflow-y-auto"
      >
        <h3 class="text-lg font-bold text-gray-700 mb-4 flex justify-between">
          <span>📝 1. In Queue</span>
          <span class="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-sm">{{
            kanbanData.waiting.length
          }}</span>
        </h3>
        <div
          v-for="card in kanbanData.waiting"
          :key="card.id"
          class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-gray-400 mb-3 animate-pulse"
        >
          <div class="text-xs text-gray-400 mb-1">ID: {{ card.id }}</div>
          <div class="font-bold text-gray-800">{{ card.docId }}</div>
          <div class="text-sm font-semibold text-blue-600 mt-2">{{ card.event }}</div>
        </div>
      </div>

      <div
        class="bg-blue-50 rounded-xl p-4 border border-blue-100 shadow-inner h-[600px] overflow-y-auto"
      >
        <h3 class="text-lg font-bold text-blue-800 mb-4 flex justify-between">
          <span>⚙️ 2. Processing (Worker Active)</span>
          <span class="bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full text-sm">{{
            kanbanData.processing.length
          }}</span>
        </h3>
        <div
          v-for="card in kanbanData.processing"
          :key="card.id"
          class="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500 mb-3 ring-2 ring-blue-200"
        >
          <div class="text-xs text-gray-400 mb-1">ID: {{ card.id }}</div>
          <div class="font-bold text-gray-800">{{ card.docId }}</div>
          <div class="text-sm font-semibold text-blue-600 mt-2 flex items-center gap-2">
            <svg
              class="animate-spin h-4 w-4 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Working on {{ card.event }}
          </div>
        </div>
      </div>

      <div
        class="bg-green-50 rounded-xl p-4 border border-green-100 shadow-inner h-[600px] overflow-y-auto"
      >
        <h3 class="text-lg font-bold text-green-800 mb-4 flex justify-between">
          <span>✅ 3. Acknowledged (XACK)</span>
          <span class="bg-green-200 text-green-800 px-2 py-0.5 rounded-full text-sm">{{
            kanbanData.completed.length
          }}</span>
        </h3>
        <div
          v-for="card in kanbanData.completed"
          :key="card.id"
          class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500 mb-3 opacity-75"
        >
          <div class="text-xs text-gray-400 mb-1">ID: {{ card.id }}</div>
          <div class="font-bold text-gray-800 line-through decoration-gray-300">
            {{ card.docId }}
          </div>
          <div class="text-sm font-semibold text-green-600 mt-2">Done: {{ card.event }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
