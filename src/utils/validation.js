// Validation schemas based on Swagger definitions
export const validationSchemas = {
  // Authentication schemas
  login: {
    username: {
      required: true,
      minLength: 3,
      maxLength: 50,
      message: 'Username must be 3-50 characters'
    },
    password: {
      required: true,
      minLength: 6,
      message: 'Password must be at least 6 characters'
    }
  },

  register: {
    username: {
      required: true,
      minLength: 3,
      maxLength: 50,
      message: 'Username must be 3-50 characters'
    },
    email: {
      required: true,
      type: 'email',
      message: 'Valid email is required'
    },
    password: {
      required: true,
      minLength: 6,
      message: 'Password must be at least 6 characters'
    },
    full_name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      message: 'Full name must be 2-100 characters'
    },
    role: {
      required: true,
      enum: ['admin', 'staff', 'viewer'],
      message: 'Role must be admin, staff, or viewer'
    }
  },

  // Customer schemas
  createCustomer: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      message: 'Name must be 2-100 characters'
    },
    phone: {
      required: true,
      minLength: 10,
      maxLength: 15,
      pattern: /^[\d\+\-\s\(\)]+$/,
      message: 'Phone must be 10-15 digits'
    },
    email: {
      required: false,
      type: 'email',
      message: 'Valid email format required'
    },
    address: {
      required: false,
      maxLength: 500,
      message: 'Address maximum 500 characters'
    }
  },

  updateCustomer: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      message: 'Name must be 2-100 characters'
    },
    phone: {
      required: true,
      minLength: 10,
      maxLength: 15,
      pattern: /^[\d\+\-\s\(\)]+$/,
      message: 'Phone must be 10-15 digits'
    },
    email: {
      required: false,
      type: 'email',
      message: 'Valid email format required'
    },
    address: {
      required: false,
      maxLength: 500,
      message: 'Address maximum 500 characters'
    }
  },

  // Service schemas
  createService: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      message: 'Service name must be 2-100 characters'
    },
    category: {
      required: true,
      message: 'Category is required'
    },
    price: {
      required: true,
      type: 'number',
      min: 0,
      message: 'Price must be a positive number'
    },
    unit: {
      required: true,
      message: 'Unit is required (e.g., pcs, kg)'
    },
    icon: {
      required: true,
      message: 'Icon is required'
    },
    description: {
      required: false,
      maxLength: 500,
      message: 'Description maximum 500 characters'
    },
    is_active: {
      required: false,
      type: 'boolean',
      message: 'Active status must be true or false'
    }
  },

  updateService: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      message: 'Service name must be 2-100 characters'
    },
    category: {
      required: true,
      message: 'Category is required'
    },
    price: {
      required: true,
      type: 'number',
      min: 0,
      message: 'Price must be a positive number'
    },
    unit: {
      required: true,
      message: 'Unit is required (e.g., pcs, kg)'
    },
    icon: {
      required: true,
      message: 'Icon is required'
    },
    description: {
      required: false,
      maxLength: 500,
      message: 'Description maximum 500 characters'
    },
    is_active: {
      required: false,
      type: 'boolean',
      message: 'Active status must be true or false'
    }
  },

  // Transaction schemas
  createTransaction: {
    customer_id: {
      required: true,
      type: 'number',
      message: 'Customer is required'
    },
    payment_method: {
      required: true,
      enum: ['cash', 'transfer', 'qris'],
      message: 'Payment method must be cash, transfer, or qris'
    },
    items: {
      required: true,
      type: 'array',
      minItems: 1,
      message: 'At least one item is required'
    },
    notes: {
      required: false,
      maxLength: 1000,
      message: 'Notes maximum 1000 characters'
    },
    paid_amount: {
      required: false,
      type: 'number',
      min: 0,
      message: 'Paid amount must be positive'
    }
  },

  createTransactionItem: {
    service_id: {
      required: true,
      type: 'number',
      message: 'Service is required'
    },
    quantity: {
      required: true,
      type: 'number',
      min: 1,
      message: 'Quantity must be at least 1'
    },
    price: {
      required: true,
      type: 'number',
      min: 0,
      message: 'Price must be positive'
    }
  },

  // Progress schemas
  addProgress: {
    status: {
      required: true,
      enum: ['received', 'check', 'washing', 'ironed', 'packaging', 'done', 'delivered', 'cancelled'],
      message: 'Valid status is required'
    },
    checked_by: {
      required: true,
      message: 'Checked by is required'
    },
    notes: {
      required: false,
      maxLength: 500,
      message: 'Notes maximum 500 characters'
    },
    metadata: {
      required: false,
      type: 'string',
      message: 'Metadata must be valid JSON string'
    }
  },

  updateTransactionStatus: {
    status: {
      required: true,
      enum: ['received', 'check', 'washing', 'ironed', 'packaging', 'done', 'delivered', 'cancelled'],
      message: 'Valid status is required'
    },
    checked_by: {
      required: true,
      message: 'Checked by is required'
    },
    notes: {
      required: false,
      maxLength: 500,
      message: 'Notes maximum 500 characters'
    }
  }
};

// Validation function
export function validateForm(data, schemaName) {
  const schema = validationSchemas[schemaName];
  if (!schema) {
    throw new Error(`Schema '${schemaName}' not found`);
  }

  const errors = {};
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    // Check required
    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors[field] = rules.message || `${field} is required`;
      continue;
    }

    // Skip validation if field is empty and not required
    if (!value && !rules.required) continue;

    // Type validation
    if (rules.type) {
      switch (rules.type) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors[field] = rules.message || 'Invalid email format';
          }
          break;
        case 'number':
          if (isNaN(value) || typeof value !== 'number') {
            errors[field] = rules.message || `${field} must be a number`;
          }
          break;
        case 'boolean':
          if (typeof value !== 'boolean') {
            errors[field] = rules.message || `${field} must be true or false`;
          }
          break;
        case 'array':
          if (!Array.isArray(value)) {
            errors[field] = rules.message || `${field} must be an array`;
          }
          break;
      }
    }

    // Length validation
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        errors[field] = rules.message || `${field} must be at least ${rules.minLength} characters`;
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors[field] = rules.message || `${field} must be at most ${rules.maxLength} characters`;
      }
    }

    // Number validation
    if (typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        errors[field] = rules.message || `${field} must be at least ${rules.min}`;
      }
      if (rules.max !== undefined && value > rules.max) {
        errors[field] = rules.message || `${field} must be at most ${rules.max}`;
      }
    }

    // Array validation
    if (Array.isArray(value)) {
      if (rules.minItems && value.length < rules.minItems) {
        errors[field] = rules.message || `${field} must have at least ${rules.minItems} items`;
      }
      if (rules.maxItems && value.length > rules.maxItems) {
        errors[field] = rules.message || `${field} must have at most ${rules.maxItems} items`;
      }
    }

    // Pattern validation
    if (rules.pattern && typeof value === 'string') {
      if (!rules.pattern.test(value)) {
        errors[field] = rules.message || `${field} format is invalid`;
      }
    }

    // Enum validation
    if (rules.enum && !rules.enum.includes(value)) {
      errors[field] = rules.message || `${field} must be one of: ${rules.enum.join(', ')}`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Helper function to get form field class based on validation state
export function getFieldClass(fieldName, errors, touched = {}) {
  const baseClass = 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200';
  
  if (!touched[fieldName]) {
    return `${baseClass} border-gray-300 focus:ring-indigo-500 focus:border-indigo-500`;
  }
  
  if (errors[fieldName]) {
    return `${baseClass} border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50`;
  }
  
  return `${baseClass} border-green-300 focus:ring-green-500 focus:border-green-500 bg-green-50`;
}

// Helper function to sanitize form data before API call
export function sanitizeFormData(data, schemaName) {
  const schema = validationSchemas[schemaName];
  if (!schema) return data;

  const sanitized = {};
  
  // Always preserve ID field for update operations
  if (data.id !== undefined && data.id !== null) {
    sanitized.id = data.id;
  }
  
  for (const [field, rules] of Object.entries(schema)) {
    let value = data[field];
    
    if (value === undefined || value === null) continue;
    
    // Trim strings
    if (typeof value === 'string') {
      value = value.trim();
      if (value === '') continue; // Skip empty strings
    }
    
    // Convert numbers
    if (rules.type === 'number' && typeof value === 'string') {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        value = num;
      }
    }
    
    // Convert booleans
    if (rules.type === 'boolean') {
      if (typeof value === 'string') {
        value = value === 'true' || value === '1';
      }
    }
    
    sanitized[field] = value;
  }
  
  return sanitized;
}

// Specific validation functions for different forms
export function validateLogin(data) {
  return validateForm(data, 'login');
}

export function validateRegister(data) {
  return validateForm(data, 'register');
}

export function validateCustomerCreate(data) {
  return validateForm(data, 'createCustomer');
}

export function validateCustomerUpdate(data) {
  return validateForm(data, 'updateCustomer');
}

export function validateServiceCreate(data) {
  return validateForm(data, 'createService');
}

export function validateServiceUpdate(data) {
  return validateForm(data, 'updateService');
}

export function validateTransactionCreate(data) {
  return validateForm(data, 'createTransaction');
}

export function validateTransactionItemCreate(data) {
  return validateForm(data, 'createTransactionItem');
}

export function validateProgressAdd(data) {
  return validateForm(data, 'addProgress');
}

export function validateTransactionStatusUpdate(data) {
  return validateForm(data, 'updateTransactionStatus');
}

// Alias for getFieldClass to match expected import name
export function getInputClass(fieldName, errors = {}, touched = {}) {
  return getFieldClass(fieldName, errors, touched);
}