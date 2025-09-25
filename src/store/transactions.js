import { defineStore } from 'pinia';
import api from '../services/api';

export const useTransactionStore = defineStore('transaction', {
  state: () => ({
    transactions: [],
    cart: [],
    error: null,
    loading: false,
  }),
  actions: {
    // Actions for managing transactions will be added here
    // e.g., fetchTransactions, createTransaction, etc.
  },
});
