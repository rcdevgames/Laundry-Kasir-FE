import { createRouter, createWebHistory } from 'vue-router';

import LoginPage from '../pages/LoginPage.vue';
import DashboardPage from '../pages/DashboardPage.vue';
import CustomerManagementPage from '../pages/CustomerManagementPage.vue';
import ServiceManagementPage from '../pages/ServiceManagementPage.vue';
import TransactionPage from '../pages/TransactionPage.vue';
import ProgressPage from '../pages/ProgressPage.vue';
import ReportPage from '../pages/ReportPage.vue';
import DefaultLayout from '../layouts/DefaultLayout.vue';
import LoginLayout from '../layouts/LoginLayout.vue';

const routes = [
  {
    path: '/login',
    component: LoginLayout,
    children: [
      { path: '', component: LoginPage, name: 'login' }
    ]
  },
  {
    path: '/',
    component: DefaultLayout,
    children: [
      { path: '', component: DashboardPage, name: 'dashboard' },
      { path: 'customers', component: CustomerManagementPage, name: 'customers' },
      { path: 'services', component: ServiceManagementPage, name: 'services' },
      { path: 'transactions', component: TransactionPage, name: 'transactions' },
      { path: 'progress', component: ProgressPage, name: 'progress' },
      { path: 'reports', component: ReportPage, name: 'reports' }
    ]
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard to redirect authenticated users away from login page
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  
  if (to.name === 'login' && token) {
    // If trying to access login and already authenticated, redirect to dashboard
    next({ name: 'dashboard' });
  } else if (to.name !== 'login' && !token) {
    // For all routes except login, if not authenticated, redirect to login
    next({ name: 'login' });
  } else {
    next();
  }
});

export default router;
