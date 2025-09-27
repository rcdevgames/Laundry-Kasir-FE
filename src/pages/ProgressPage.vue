<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-4 touch-manipulation">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-800">Progress Tracking</h1>
        <button 
          @click="refreshData"
          class="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg active:scale-95"
        >
          <FontAwesomeIcon icon="sync-alt" class="h-5 w-5" />
        </button>
      </div>
      
      <!-- Status Filter Tabs -->
      <div class="flex flex-wrap gap-2 mb-4">
        <button
          v-for="status in progressStatuses"
          :key="`tab-${status.key}`"
          @click="selectedStatus = status.key"
          :class="[
            'px-4 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95',
            selectedStatus === status.key
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
          ]"
        >
          <FontAwesomeIcon :icon="status.icon" class="mr-2" />
          {{ status.label }}
          <span 
            v-if="getStatusCount(status.key) > 0"
            class="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full"
          >
            {{ getStatusCount(status.key) }}
          </span>
        </button>
      </div>
    </div>

    <!-- Orders Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
      <div 
        v-for="transaction in filteredTransactions" 
        :key="transaction.id"
        class="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all cursor-pointer active:scale-98"
        @click="openProgressModal(transaction)"
      >
        <!-- Order Header -->
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-bold text-gray-800 text-lg">{{ transaction.transactionNo }}</h3>
            <p class="text-sm text-gray-600">{{ transaction.customer.name }}</p>
          </div>
          <div class="text-right">
            <div :class="getStatusBadgeClass(transaction.currentStatus)" class="px-3 py-1 rounded-full text-xs font-semibold">
              {{ getStatusLabel(transaction.currentStatus) }}
            </div>
            <p class="text-xs text-gray-500 mt-1">{{ formatTime(transaction.createdAt) }}</p>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mb-4">
          <div class="flex justify-between text-xs text-gray-600 mb-2">
            <span>Progress</span>
            <span>{{ getProgressPercentage(transaction.currentStatus) }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div 
              :class="getProgressBarClass(transaction.currentStatus)"
              class="h-3 rounded-full transition-all duration-300"
              :style="{ width: getProgressPercentage(transaction.currentStatus) + '%' }"
            ></div>
          </div>
        </div>

        <!-- Items Summary -->
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600">{{ transaction.items.length }} item(s)</span>
          <span class="font-semibold text-indigo-600">Rp {{ transaction.totalAmount.toLocaleString() }}</span>
        </div>

        <!-- Estimated Time -->
        <div v-if="transaction.estimatedDone" class="mt-3 text-xs text-gray-500">
          <FontAwesomeIcon icon="clock" class="mr-1" />
          Est. {{ formatEstimatedTime(transaction.estimatedDone) }}
        </div>

        <!-- Action Buttons -->
        <div class="mt-4 flex gap-2">
          <button
            v-if="getNextStatus(transaction.currentStatus)"
            @click.stop="quickUpdateProgress(transaction, getNextStatus(transaction.currentStatus))"
            class="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors active:scale-95"
          >
            {{ getNextStatusLabel(transaction.currentStatus) }}
          </button>
          
          <button
            v-else-if="transaction.currentStatus === 'done'"
            @click.stop="showCompletionOptions(transaction)"
            class="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors active:scale-95"
          >
            Mark Complete
          </button>
        </div>
      </div>
    </div>

    <!-- Progress Update Modal -->
    <div 
      v-if="showProgressModal" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeProgressModal"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-bold text-gray-800">{{ selectedTransaction?.transactionNo }}</h2>
              <p class="text-gray-600">{{ selectedTransaction?.customer.name }}</p>
            </div>
            <button 
              @click="closeProgressModal"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FontAwesomeIcon icon="times" class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- Progress Timeline -->
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Progress Timeline</h3>
          
          <div class="space-y-4 mb-6">
            <div 
              v-for="(status, index) in progressStatuses.filter(s => s.key !== 'all')" 
              :key="status.key"
              class="flex items-start space-x-4"
            >
              <div class="flex flex-col items-center">
                <div 
                  :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm',
                    isStatusCompleted(status.key) ? 'bg-green-500' : 
                    isCurrentStatus(status.key) ? 'bg-indigo-600' : 'bg-gray-300'
                  ]"
                >
                  <FontAwesomeIcon :icon="status.icon" class="h-4 w-4" />
                </div>
                <div 
                  v-if="index < progressStatuses.filter(s => s.key !== 'all').length - 1"
                  :class="[
                    'w-0.5 h-12 mt-2',
                    isStatusCompleted(status.key) ? 'bg-green-500' : 'bg-gray-300'
                  ]"
                ></div>
              </div>
              
              <div class="flex-1 pb-8">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-semibold text-gray-800">{{ status.label }}</h4>
                  <button
                    v-if="canUpdateToStatus(status.key)"
                    @click="updateProgress(status.key)"
                    class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors active:scale-95"
                  >
                    Mark Complete
                  </button>
                </div>
                
                <div v-if="getProgressEntry(status.key)" class="text-sm text-gray-600">
                  <p class="mb-1">
                    <FontAwesomeIcon icon="clock" class="mr-1" />
                    {{ formatDateTime(getProgressEntry(status.key).timestamp) }}
                  </p>
                  <p v-if="getProgressEntry(status.key).checkedBy" class="mb-1">
                    <FontAwesomeIcon icon="user" class="mr-1" />
                    {{ getProgressEntry(status.key).checkedBy }}
                  </p>
                  <p v-if="getProgressEntry(status.key).notes" class="text-gray-700 font-medium">
                    {{ getProgressEntry(status.key).notes }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Add Notes for Current Status -->
          <div v-if="showNotesInput" class="mb-6">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Add Notes</label>
            <textarea
              v-model="progressNotes"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows="3"
              placeholder="Add notes for this progress step..."
            ></textarea>
          </div>

          <!-- Special Check Stage -->
          <div v-if="isCheckStage" class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 class="font-semibold text-yellow-800 mb-3">
              <FontAwesomeIcon icon="search" class="mr-2" />
              Check Items Found
            </h4>
            
            <div class="grid grid-cols-2 gap-3 mb-4">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="checkFindings.money" 
                  class="rounded text-yellow-600 focus:ring-yellow-500"
                />
                <span class="text-sm">💰 Money found</span>
              </label>
              
              <label class="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="checkFindings.receipts" 
                  class="rounded text-yellow-600 focus:ring-yellow-500"
                />
                <span class="text-sm">🧾 Receipts/Cards</span>
              </label>
              
              <label class="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="checkFindings.damage" 
                  class="rounded text-red-600 focus:ring-red-500"
                />
                <span class="text-sm">⚠️ Damage found</span>
              </label>
              
              <label class="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="checkFindings.stains" 
                  class="rounded text-orange-600 focus:ring-orange-500"
                />
                <span class="text-sm">🟤 Difficult stains</span>
              </label>
            </div>

            <textarea
              v-model="checkFindings.notes"
              class="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
              rows="2"
              placeholder="Describe any findings in detail..."
            ></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- Completion Options Modal -->
    <div 
      v-if="showCompletionModal" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeCompletionModal"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Order Completion</h3>
          <p class="text-gray-600 mb-6">
            How was order <strong>{{ selectedTransaction?.transactionNo }}</strong> completed?
          </p>
          
          <div class="space-y-3">
            <button
              @click="completeOrder('pickup')"
              class="w-full p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-left transition-colors"
            >
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-blue-600 rounded-lg">
                  <FontAwesomeIcon icon="user" class="h-5 w-5 text-white" />
                </div>
                <div>
                  <p class="font-semibold text-gray-800">Customer Pickup</p>
                  <p class="text-sm text-gray-600">Customer came to pick up the order</p>
                </div>
              </div>
            </button>
            
            <button
              @click="completeOrder('delivery')"
              class="w-full p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl text-left transition-colors"
            >
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-green-600 rounded-lg">
                  <FontAwesomeIcon icon="truck" class="h-5 w-5 text-white" />
                </div>
                <div>
                  <p class="font-semibold text-gray-800">Home Delivery</p>
                  <p class="text-sm text-gray-600">Order was delivered to customer</p>
                </div>
              </div>
            </button>
          </div>
          
          <div class="mt-6 flex justify-end">
            <button
              @click="closeCompletionModal"
              class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredTransactions.length === 0" class="text-center py-12">
      <div class="mb-4">
        <FontAwesomeIcon icon="clipboard-list" class="h-16 w-16 text-gray-300" />
      </div>
      <p class="text-gray-500 text-lg">No orders found for {{ getStatusLabel(selectedStatus) }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useTransactionStore } from '../store/transaction';
import { storeToRefs } from 'pinia';

// Store
const transactionStore = useTransactionStore();
const { transactions } = storeToRefs(transactionStore);

// Reactive data
const selectedStatus = ref('all');
const showProgressModal = ref(false);
const showCompletionModal = ref(false);
const selectedTransaction = ref(null);
const showNotesInput = ref(false);
const progressNotes = ref('');
const checkFindings = ref({
  money: false,
  receipts: false,
  damage: false,
  stains: false,
  notes: ''
});

// Progress statuses configuration
const progressStatuses = ref([
  { key: 'all', label: 'All Active', icon: 'list', color: 'gray' },
  { key: 'received', label: 'Received', icon: 'inbox', color: 'blue' },
  { key: 'check', label: 'Check Items', icon: 'search', color: 'yellow' },
  { key: 'washing', label: 'Washing', icon: 'tint', color: 'cyan' },
  { key: 'ironed', label: 'Ironed', icon: 'shirt', color: 'purple' },
  { key: 'packaging', label: 'Packaging', icon: 'box', color: 'indigo' },
  { key: 'done', label: 'Ready', icon: 'check-circle', color: 'green' },
  { key: 'completed', label: 'Completed', icon: 'check', color: 'emerald' }
]);

// Computed properties
const filteredTransactions = computed(() => {
  if (!transactions.value) return [];
  
  if (selectedStatus.value === 'all') {
    // Show only active orders (exclude completed)
    return transactions.value.filter(t => t.currentStatus !== 'completed');
  }
  
  return transactions.value.filter(t => t.currentStatus === selectedStatus.value);
});

const isCheckStage = computed(() => {
  return selectedTransaction.value?.currentStatus === 'check';
});

// Methods
const getStatusCount = (status) => {
  if (!transactions.value) return 0;
  if (status === 'all') {
    // Count only active orders (exclude completed)
    return transactions.value.filter(t => t.currentStatus !== 'completed').length;
  }
  return transactions.value.filter(t => t.currentStatus === status).length;
};

const getStatusLabel = (status) => {
  if (status === 'all') return 'All Active';
  const statusObj = progressStatuses.value.find(s => s.key === status);
  return statusObj?.label || status;
};

const getStatusBadgeClass = (status) => {
  const statusObj = progressStatuses.value.find(s => s.key === status);
  const color = statusObj?.color || 'gray';
  
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    cyan: 'bg-cyan-100 text-cyan-800',
    purple: 'bg-purple-100 text-purple-800',
    indigo: 'bg-indigo-100 text-indigo-800',
    green: 'bg-green-100 text-green-800',
    emerald: 'bg-emerald-100 text-emerald-800',
    gray: 'bg-gray-100 text-gray-800'
  };
  
  return colorClasses[color];
};

const getProgressPercentage = (status) => {
  const statusIndex = progressStatuses.value.findIndex(s => s.key === status);
  if (statusIndex === -1) return 0;
  // Exclude 'all' from calculation
  const actualStatuses = progressStatuses.value.filter(s => s.key !== 'all');
  const actualIndex = actualStatuses.findIndex(s => s.key === status);
  return Math.round(((actualIndex + 1) / actualStatuses.length) * 100);
};

const getProgressBarClass = (status) => {
  const statusObj = progressStatuses.value.find(s => s.key === status);
  const color = statusObj?.color || 'gray';
  
  const colorClasses = {
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    cyan: 'bg-cyan-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500',
    green: 'bg-green-500',
    emerald: 'bg-emerald-500',
    gray: 'bg-gray-500'
  };
  
  return colorClasses[color];
};

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const formatDateTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatEstimatedTime = (timestamp) => {
  const now = new Date();
  const estimated = new Date(timestamp);
  const diff = estimated - now;
  
  if (diff <= 0) return 'Ready now';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const openProgressModal = (transaction) => {
  selectedTransaction.value = transaction;
  showProgressModal.value = true;
  resetProgressForm();
};

const closeProgressModal = () => {
  showProgressModal.value = false;
  selectedTransaction.value = null;
  resetProgressForm();
};

const resetProgressForm = () => {
  showNotesInput.value = false;
  progressNotes.value = '';
  checkFindings.value = {
    money: false,
    receipts: false,
    damage: false,
    stains: false,
    notes: ''
  };
};

const isStatusCompleted = (status) => {
  if (!selectedTransaction.value) return false;
  const actualStatuses = progressStatuses.value.filter(s => s.key !== 'all');
  const currentIndex = actualStatuses.findIndex(s => s.key === selectedTransaction.value.currentStatus);
  const statusIndex = actualStatuses.findIndex(s => s.key === status);
  return statusIndex < currentIndex;
};

const isCurrentStatus = (status) => {
  return selectedTransaction.value?.currentStatus === status;
};

const canUpdateToStatus = (status) => {
  if (!selectedTransaction.value) return false;
  const actualStatuses = progressStatuses.value.filter(s => s.key !== 'all');
  const currentIndex = actualStatuses.findIndex(s => s.key === selectedTransaction.value.currentStatus);
  const statusIndex = actualStatuses.findIndex(s => s.key === status);
  return statusIndex === currentIndex;
};

const getProgressEntry = (status) => {
  if (!selectedTransaction.value?.progress) return null;
  return selectedTransaction.value.progress.find(p => p.status === status);
};

const updateProgress = async (newStatus) => {
  showNotesInput.value = true;
  
  // For check stage, show special form
  if (newStatus === 'check') {
    // The checkFindings form is already visible
    return;
  }
  
  // For other stages, proceed with update
  const progressData = {
    status: newStatus,
    notes: progressNotes.value,
    checkedBy: 'Current User', // TODO: Get from auth store
  };
  
  if (newStatus === 'check') {
    progressData.metadata = JSON.stringify(checkFindings.value);
  }
  
  try {
    await transactionStore.updateTransactionProgress(selectedTransaction.value.id, progressData);
    
    // Update local state
    selectedTransaction.value.currentStatus = newStatus;
    if (!selectedTransaction.value.progress) {
      selectedTransaction.value.progress = [];
    }
    selectedTransaction.value.progress.push({
      status: newStatus,
      notes: progressNotes.value,
      checkedBy: 'Current User',
      timestamp: new Date(),
      metadata: newStatus === 'check' ? JSON.stringify(checkFindings.value) : null
    });
    
    resetProgressForm();
    
    // Auto-close modal after delivery
    if (newStatus === 'delivered') {
      setTimeout(() => {
        closeProgressModal();
      }, 1500);
    }
  } catch (error) {
    console.error('Failed to update progress:', error);
    // TODO: Show error toast
  }
};

const refreshData = async () => {
  try {
    await transactionStore.fetchTransactions();
  } catch (error) {
    console.error('Failed to refresh data:', error);
  }
};

// New methods for quick actions
const getNextStatus = (currentStatus) => {
  const actualStatuses = progressStatuses.value.filter(s => s.key !== 'all');
  const currentIndex = actualStatuses.findIndex(s => s.key === currentStatus);
  if (currentIndex === -1 || currentIndex >= actualStatuses.length - 1) return null;
  return actualStatuses[currentIndex + 1].key;
};

const getNextStatusLabel = (currentStatus) => {
  const nextStatus = getNextStatus(currentStatus);
  if (!nextStatus) return '';
  const statusObj = progressStatuses.value.find(s => s.key === nextStatus);
  return `→ ${statusObj?.label}`;
};

const quickUpdateProgress = async (transaction, newStatus) => {
  try {
    const progressData = {
      status: newStatus,
      notes: `Quick update to ${newStatus}`,
      checkedBy: 'Current User'
    };
    
    await transactionStore.updateTransactionProgress(transaction.id, progressData);
    
    // Update local state
    transaction.currentStatus = newStatus;
    if (!transaction.progress) {
      transaction.progress = [];
    }
    transaction.progress.push({
      status: newStatus,
      notes: progressData.notes,
      checkedBy: 'Current User',
      timestamp: new Date()
    });
    
  } catch (error) {
    console.error('Failed to update progress:', error);
  }
};

const showCompletionOptions = (transaction) => {
  selectedTransaction.value = transaction;
  showCompletionModal.value = true;
};

const closeCompletionModal = () => {
  showCompletionModal.value = false;
  selectedTransaction.value = null;
};

const completeOrder = async (completionType) => {
  if (!selectedTransaction.value) return;
  
  try {
    const completionNotes = completionType === 'pickup' 
      ? 'Order picked up by customer'
      : 'Order delivered to customer address';
    
    const progressData = {
      status: 'completed',
      notes: completionNotes,
      checkedBy: 'Current User',
      completionType: completionType
    };
    
    await transactionStore.updateTransactionProgress(selectedTransaction.value.id, progressData);
    
    // Update local state
    selectedTransaction.value.currentStatus = 'completed';
    selectedTransaction.value.completionType = completionType;
    selectedTransaction.value.completedAt = new Date();
    
    if (!selectedTransaction.value.progress) {
      selectedTransaction.value.progress = [];
    }
    selectedTransaction.value.progress.push({
      status: 'completed',
      notes: completionNotes,
      checkedBy: 'Current User',
      timestamp: new Date(),
      completionType: completionType
    });
    
    closeCompletionModal();
    
  } catch (error) {
    console.error('Failed to complete order:', error);
  }
};

// Lifecycle
onMounted(() => {
  // Load transactions if not already loaded
  if (!transactions.value || transactions.value.length === 0) {
    refreshData();
  }
});
</script>

<style scoped>
.touch-manipulation {
  touch-action: manipulation;
}

.active\:scale-95:active {
  transform: scale(0.95);
}

.active\:scale-98:active {
  transform: scale(0.98);
}
</style>