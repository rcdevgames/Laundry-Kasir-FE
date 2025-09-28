# Form Validation Implementation - Waw Laundry Management

## 📋 Overview
Implementasi lengkap form validation berdasarkan Swagger JSON schema untuk semua endpoint POST, PUT, PATCH di aplikasi Laundry Management System.

## 🎯 Features Implemented

### ✅ Schema-Based Validation
- **File**: `src/utils/validation.js`
- **Schemas**: Berdasarkan Swagger definitions untuk semua request body
- **Coverage**: Authentication, Customer, Service, Transaction, Progress, User Registration

### ✅ Form Components
1. **CustomerForm.vue** - Create/Update customer
2. **ServiceFormNew.vue** - Create/Update service  
3. **ProgressForm.vue** - Update transaction progress
4. **UserRegisterForm.vue** - Register new user (admin only)
5. **LoginPage.vue** - Login form (updated with validation)

### ✅ Validation Rules Implemented

#### Authentication Schemas
```javascript
// LoginRequest
login: {
  username: { required: true, minLength: 3, maxLength: 50 },
  password: { required: true, minLength: 6 }
}

// RegisterRequest  
register: {
  username: { required: true, minLength: 3, maxLength: 50 },
  email: { required: true, type: 'email' },
  password: { required: true, minLength: 6 },
  full_name: { required: true, minLength: 2, maxLength: 100 },
  role: { required: true, enum: ['admin', 'staff', 'viewer'] }
}
```

#### Customer Schemas
```javascript
// CreateCustomerRequest & UpdateCustomerRequest
createCustomer: {
  name: { required: true, minLength: 2, maxLength: 100 },
  phone: { required: true, minLength: 10, maxLength: 15, pattern: /^[\d\+\-\s\(\)]+$/ },
  email: { required: false, type: 'email' },
  address: { required: false, maxLength: 500 }
}
```

#### Service Schemas
```javascript
// CreateServiceRequest & UpdateServiceRequest
createService: {
  name: { required: true, minLength: 2, maxLength: 100 },
  category: { required: true },
  price: { required: true, type: 'number', min: 0 },
  unit: { required: true },
  icon: { required: true },
  description: { required: false, maxLength: 500 },
  is_active: { required: false, type: 'boolean' }
}
```

#### Transaction & Progress Schemas
```javascript
// CreateTransactionRequest
createTransaction: {
  customer_id: { required: true, type: 'number' },
  payment_method: { required: true, enum: ['cash', 'transfer', 'qris'] },
  items: { required: true, type: 'array', minItems: 1 },
  notes: { required: false, maxLength: 1000 },
  paid_amount: { required: false, type: 'number', min: 0 }
}

// AddProgressRequest
addProgress: {
  status: { required: true, enum: ['received', 'check', 'washing', 'ironed', 'packaging', 'done', 'delivered', 'cancelled'] },
  checked_by: { required: true },
  notes: { required: false, maxLength: 500 },
  metadata: { required: false, type: 'string' }
}
```

## 🎨 UI/UX Features

### Visual Feedback
- **Success State**: Green border dan background untuk field valid
- **Error State**: Red border dan background untuk field dengan error
- **Neutral State**: Gray border untuk field belum disentuh
- **Loading State**: Spinner animation dan disabled state saat submit

### Real-time Validation
- **onBlur**: Validasi saat user meninggalkan field
- **onInput**: Update validasi saat user mengetik
- **onSubmit**: Validasi semua field sebelum submit

### Error Messages
- **Field-level**: Error message spesifik untuk setiap field
- **Form-level**: Validasi keseluruhan form sebelum submit
- **SweetAlert2**: Toast notifications untuk success/error

## 📁 File Structure

```
src/
├── utils/
│   └── validation.js           # Schema validation utilities
├── components/
│   ├── CustomerForm.vue        # Customer form with validation
│   ├── ServiceFormNew.vue      # Service form with validation
│   ├── ProgressForm.vue        # Progress update form
│   └── UserRegisterForm.vue    # User registration form
├── pages/
│   ├── LoginPage.vue           # Login form (updated)
│   └── FormValidationDemo.vue  # Demo page untuk testing
└── router/
    └── index.js               # Route untuk /form-demo
```

## 🔧 Helper Functions

### `validateForm(data, schemaName)`
Validasi data berdasarkan schema yang dipilih
```javascript
const validation = validateForm(formData, 'createCustomer');
if (validation.isValid) {
  // Submit form
} else {
  // Show errors: validation.errors
}
```

### `sanitizeFormData(data, schemaName)`
Membersihkan dan mengkonversi data sesuai schema
```javascript
const sanitized = sanitizeFormData(formData, 'createCustomer');
// Hasil: data yang sudah di-trim, convert tipe data, dll
```

### `getFieldClass(fieldName, errors, touched)`
Generate CSS class untuk field berdasarkan validation state
```javascript
const fieldClass = getFieldClass('name', errors, touched);
// Hasil: class CSS dengan warna border sesuai state
```

## 🌐 API Integration

Semua form sudah terintegrasi dengan:
- **API Service Files**: Menggunakan struktur response sesuai Swagger
- **Pinia Stores**: State management dengan error handling
- **SweetAlert2**: User-friendly notifications
- **CSRF Protection**: Auto-retry dengan CSRF token

## 🧪 Testing & Demo

### Demo Page: `/form-demo`
- Preview semua form validation
- Test individual forms
- Schema information
- Implementation details

### Manual Testing
1. Buka `/form-demo` di browser
2. Test setiap form dengan data valid/invalid
3. Lihat real-time validation dan error messages
4. Periksa console untuk data yang di-submit

## 📝 Usage Example

```vue
<template>
  <CustomerForm 
    :visible="showForm" 
    :customer="editingCustomer"
    @close="showForm = false"
    @save="handleCustomerSave"
  />
</template>

<script setup>
import CustomerForm from '@/components/CustomerForm.vue';

const handleCustomerSave = (customerData) => {
  // customerData sudah ter-validasi dan ter-sanitasi
  console.log('Valid customer data:', customerData);
  
  // Call API
  customerStore.addCustomer(customerData);
};
</script>
```

## 🚀 Next Steps

1. **Form Testing**: Test semua form dengan berbagai edge cases
2. **Performance**: Optimize validation untuk form yang kompleks  
3. **Internationalization**: Tambah multi-language error messages
4. **Advanced Validation**: Custom validation rules per business logic

## 📚 Dependencies

- **Vue 3**: Composition API, Reactivity
- **Pinia**: State management
- **SweetAlert2**: Notifications
- **TailwindCSS**: Styling
- **FontAwesome**: Icons

---

**Status**: ✅ **IMPLEMENTASI LENGKAP**
Semua form sudah mengimplementasikan validation berdasarkan Swagger schema dengan real-time feedback dan user-friendly error handling.