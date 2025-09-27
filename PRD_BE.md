# Waw Laundry Backend - Product Requirements Document (PRD)

## 📋 Project Overview

### Product Name
**Waw Laundry Management System Backend**

### Product Vision
Developing a robust, scalable, and secure backend API system for modern laundry business management, supporting customer management, service catalog, transaction processing, and comprehensive reporting.

### Target Users
- **Laundry Business Owners**: Complete business management
- **Cashiers/Staff**: Daily transaction processing
- **Customers**: Service tracking (future scope)
- **Administrators**: System configuration and reporting

---

## 🎯 Core Features & Requirements

### 1. Authentication & Authorization System

#### 1.1 User Authentication
- **JWT-based authentication** with Access Token (15 minutes) + Refresh Token (7 days)
- **CSRF Token protection** for all POST/PUT/DELETE operations
- **Role-based access control** (Admin, Staff, Viewer)
- **Secure password hashing** using bcrypt
- **Login attempt limiting** (5 attempts per 15 minutes)
- **Session management** with Redis (optional)

#### 1.2 User Management
- User registration (Admin only)
- User profile management
- Password reset functionality
- User role assignment
- Active session tracking

### 2. Customer Management System

#### 2.1 Customer Operations
- **Create customer** with complete profile
- **Search customers** by name, phone, or email
- **Update customer** information
- **Customer transaction history**
- **Customer loyalty tracking**

#### 2.2 Customer Data Model
```go
type Customer struct {
    ID          uint      `json:"id" gorm:"primaryKey"`
    Name        string    `json:"name" validate:"required,min=2,max=100"`
    Phone       string    `json:"phone" validate:"required,min=10,max=15"`
    Email       string    `json:"email" validate:"omitempty,email"`
    Address     string    `json:"address" validate:"max=500"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
    DeletedAt   *time.Time `json:"-" gorm:"index"`
}
```

### 3. Service Management System

#### 3.1 Service Operations
- **Create services** with pricing and categories
- **Update service** details and pricing
- **Service category management**
- **Service status** (Active/Inactive)
- **Bulk price updates**

#### 3.2 Service Data Model
```go
type Service struct {
    ID          uint      `json:"id" gorm:"primaryKey"`
    Name        string    `json:"name" validate:"required,min=2,max=100"`
    Description string    `json:"description" validate:"max=500"`
    Price       float64   `json:"price" validate:"required,gt=0"`
    Unit        string    `json:"unit" validate:"required"` // pcs, kg, etc
    Category    string    `json:"category" validate:"required"`
    Icon        string    `json:"icon" validate:"required"`
    IsActive    bool      `json:"is_active" gorm:"default:true"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
    DeletedAt   *time.Time `json:"-" gorm:"index"`
}
```

### 4. Transaction Management System

#### 4.1 Transaction Operations
- **Create transactions** with multiple services
- **Progress workflow tracking** (Received → Check → Washing → Ironed → Packaging → Done)
- **Update transaction status** with detailed progress steps
- **Payment processing** (Cash, Transfer, QRIS)
- **Transaction search and filtering**
- **Invoice generation**
- **Progress timeline tracking** with timestamps

#### 4.2 Transaction Data Models
```go
type Transaction struct {
    ID              uint                `json:"id" gorm:"primaryKey"`
    CustomerID      uint                `json:"customer_id" validate:"required"`
    Customer        Customer            `json:"customer" gorm:"foreignKey:CustomerID"`
    TransactionNo   string              `json:"transaction_no" gorm:"uniqueIndex"`
    Status          TransactionStatus   `json:"status" gorm:"default:'pending'"`
    PaymentMethod   PaymentMethod       `json:"payment_method" validate:"required"`
    TotalAmount     float64             `json:"total_amount" validate:"gt=0"`
    PaidAmount      float64             `json:"paid_amount" validate:"gte=0"`
    ChangeAmount    float64             `json:"change_amount" gorm:"default:0"`
    Notes           string              `json:"notes" validate:"max=1000"`
    Items           []TransactionItem     `json:"items" gorm:"foreignKey:TransactionID"`
    Progress        []TransactionProgress `json:"progress" gorm:"foreignKey:TransactionID"`
    CurrentStatus   TransactionStatus     `json:"current_status" gorm:"default:'received'"`
    EstimatedDone   *time.Time           `json:"estimated_done"`
    CreatedAt       time.Time            `json:"created_at"`
    UpdatedAt       time.Time            `json:"updated_at"`
    DeletedAt       *time.Time           `json:"-" gorm:"index"`
}

type TransactionItem struct {
    ID            uint    `json:"id" gorm:"primaryKey"`
    TransactionID uint    `json:"transaction_id"`
    ServiceID     uint    `json:"service_id" validate:"required"`
    Service       Service `json:"service" gorm:"foreignKey:ServiceID"`
    Quantity      int     `json:"quantity" validate:"required,gt=0"`
    Price         float64 `json:"price" validate:"required,gt=0"`
    Subtotal      float64 `json:"subtotal" validate:"required,gt=0"`
}

type TransactionStatus string
const (
    StatusReceived   TransactionStatus = "received"      // Order received
    StatusCheck      TransactionStatus = "check"         // Checking items (pockets, damage)
    StatusWashing    TransactionStatus = "washing"       // In washing process
    StatusIroned     TransactionStatus = "ironed"        // Ironing process
    StatusPackaging  TransactionStatus = "packaging"     // Packaging items
    StatusDone       TransactionStatus = "done"          // Ready for pickup/delivery
    StatusDelivered  TransactionStatus = "delivered"     // Delivered to customer
    StatusCancelled  TransactionStatus = "cancelled"     // Cancelled order
)

type TransactionProgress struct {
    ID            uint              `json:"id" gorm:"primaryKey"`
    TransactionID uint              `json:"transaction_id"`
    Status        TransactionStatus `json:"status" validate:"required"`
    Notes         string            `json:"notes" validate:"max=500"`
    CheckedBy     string            `json:"checked_by"`
    Timestamp     time.Time         `json:"timestamp" gorm:"autoCreateTime"`
    Metadata      string            `json:"metadata"` // JSON field for status-specific data
}

type PaymentMethod string
const (
    PaymentCash     PaymentMethod = "cash"
    PaymentTransfer PaymentMethod = "transfer"
    PaymentQRIS     PaymentMethod = "qris"
)
```

### 5. Progress Flow System

#### 5.1 Workflow Stages
The laundry process follows a structured workflow with the following stages:

1. **Received** 🛍️
   - Order received from customer
   - Initial item logging
   - Generate tracking number

2. **Check** 🔍
   - Check items for damage, stains, or forgotten items in pockets
   - Document any findings (money, receipts, personal items)
   - Note special treatment requirements
   - Photo documentation for valuable items found

3. **Washing** 🧼
   - Items in washing machine
   - Track washing cycle progress
   - Monitor wash quality and completion

4. **Ironed** 👔
   - Ironing and pressing process
   - Quality check for wrinkles and finish
   - Folding preparation

5. **Packaging** 📦
   - Final packaging and tagging
   - Quality assurance check
   - Ready for pickup notification

6. **Done** ✅
   - Ready for customer pickup or delivery
   - Customer notification sent
   - Awaiting collection

7. **Delivered** 🚚 (Optional)
   - Order delivered to customer
   - Payment confirmation
   - Order completion

#### 5.2 Progress Features
- **Real-time status updates** with timestamps
- **Staff assignment** for each stage
- **Photo documentation** for check stage findings
- **Estimated completion time** calculation
- **Customer notifications** at key milestones
- **Progress history** with detailed timeline
- **Touchscreen-friendly interface** for staff updates

### 6. Reporting & Analytics System

#### 6.1 Report Features
- **Daily sales reports** with revenue breakdown
- **Monthly/yearly revenue trends**
- **Service popularity analytics**
- **Customer transaction frequency**
- **Payment method statistics**
- **Export to CSV/PDF**

#### 5.2 Dashboard Metrics
- Today's revenue and transaction count
- Pending orders count
- Top-selling services
- Customer growth metrics
- Revenue comparison (day/week/month)

---

## 🛠 Technical Architecture

### Tech Stack Requirements
- **Language**: Go 1.21+
- **Framework**: Gin (HTTP web framework)
- **Database**: PostgreSQL 14+
- **ORM**: GORM v1.25+
- **Authentication**: JWT-go v4
- **Caching**: Redis 7+ (optional for session management)
- **Validation**: Go Validator v10
- **Documentation**: Swagger/OpenAPI with gin-swagger
- **Testing**: Go testing package + Testify
- **Logging**: Logrus or Zap
- **Configuration**: Viper
- **Database Migration**: GORM Auto-Migration + Custom SQL

### Project Structure
```
waw-laundry-backend/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── config/
│   ├── handlers/
│   │   ├── auth.go
│   │   ├── customer.go
│   │   ├── service.go
│   │   ├── transaction.go
│   │   └── report.go
│   ├── middleware/
│   │   ├── auth.go
│   │   ├── cors.go
│   │   ├── csrf.go
│   │   └── logger.go
│   ├── models/
│   ├── repository/
│   ├── services/
│   └── utils/
├── pkg/
│   ├── database/
│   ├── jwt/
│   ├── validator/
│   └── redis/
├── migrations/
├── docs/
├── tests/
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── README.md
```

---

## 🔌 API Endpoints Specification

### Authentication Endpoints
```
POST   /api/v1/auth/login           # User login
POST   /api/v1/auth/logout          # User logout
POST   /api/v1/auth/refresh         # Refresh access token
GET    /api/v1/auth/me              # Get current user info
POST   /api/v1/auth/csrf-token      # Get CSRF token
```

### Customer Management
```
GET    /api/v1/customers            # List customers (with pagination & search)
POST   /api/v1/customers            # Create customer
GET    /api/v1/customers/:id        # Get customer by ID
PUT    /api/v1/customers/:id        # Update customer
DELETE /api/v1/customers/:id        # Soft delete customer
GET    /api/v1/customers/:id/transactions # Get customer transaction history
```

### Service Management
```
GET    /api/v1/services             # List services (with category filter)
POST   /api/v1/services             # Create service (Admin only)
GET    /api/v1/services/:id         # Get service by ID
PUT    /api/v1/services/:id         # Update service (Admin only)
DELETE /api/v1/services/:id         # Soft delete service (Admin only)
GET    /api/v1/services/categories  # Get service categories
```

### Transaction Management
```
GET    /api/v1/transactions         # List transactions (with filters)
POST   /api/v1/transactions         # Create transaction
GET    /api/v1/transactions/:id     # Get transaction by ID
PUT    /api/v1/transactions/:id     # Update transaction
DELETE /api/v1/transactions/:id     # Cancel transaction
GET    /api/v1/transactions/:id/invoice # Generate invoice
```

### Progress Tracking System
```
GET    /api/v1/transactions/:id/progress    # Get progress timeline
POST   /api/v1/transactions/:id/progress    # Add progress step
PATCH  /api/v1/transactions/:id/status      # Update current status
GET    /api/v1/progress/dashboard           # Progress overview (all orders)
GET    /api/v1/progress/by-status/:status   # Get orders by status
PUT    /api/v1/progress/:id                 # Update progress entry
```

### Reporting & Analytics
```
GET    /api/v1/reports/dashboard    # Dashboard metrics
GET    /api/v1/reports/daily        # Daily sales report
GET    /api/v1/reports/monthly      # Monthly sales report
GET    /api/v1/reports/services     # Service analytics
GET    /api/v1/reports/customers    # Customer analytics
GET    /api/v1/reports/export       # Export reports (CSV/PDF)
```

---

## 🔒 Security Requirements

### 1. Authentication Security
- JWT tokens with short expiration (15 min access, 7 day refresh)
- Secure token storage and rotation
- CSRF protection for state-changing operations
- Rate limiting on authentication endpoints

### 2. Data Security
- Input validation on all endpoints
- SQL injection prevention (GORM built-in protection)
- XSS prevention through proper data sanitization
- HTTPS enforcement in production
- Sensitive data encryption at rest

### 3. API Security
- CORS configuration for frontend domain only
- Request size limiting
- API rate limiting (100 requests per minute per IP)
- Request logging and monitoring
- Error handling without information leakage

---

## 📊 Database Schema

### Core Tables
1. **users** - System users (admin, staff)
2. **customers** - Laundry customers
3. **services** - Available laundry services
4. **transactions** - Main transaction records
5. **transaction_items** - Transaction line items
6. **transaction_progress** - Progress tracking with timeline
7. **user_sessions** - Active user sessions (if using Redis alternative)

### Indexes for Performance
- `customers.phone` (unique)
- `customers.email` (unique, partial)
- `transactions.transaction_no` (unique)
- `transactions.customer_id, created_at`
- `transactions.current_status, created_at`
- `transaction_items.transaction_id`
- `transaction_progress.transaction_id, timestamp`
- `transaction_progress.status, timestamp`
- `services.category, is_active`

---

## 🧪 Testing Strategy

### Unit Testing (Target: 80% Coverage)
- Model validation testing
- Service layer business logic
- Utility function testing
- JWT token generation/validation

### Integration Testing
- Database operations (CRUD)
- API endpoint testing
- Authentication flow testing
- Transaction processing workflow

### Performance Testing
- API response time benchmarks
- Database query performance
- Concurrent request handling
- Memory usage optimization

---

## 🚀 Deployment & Infrastructure

### Development Environment
- Docker Compose setup with PostgreSQL, Redis, and API server
- Hot reload with Air
- Database seeding with sample data
- API documentation served locally

### Production Requirements
- Container deployment (Docker/Kubernetes)
- PostgreSQL with connection pooling
- Redis for caching and sessions
- Reverse proxy (Nginx)
- SSL/TLS termination
- Health check endpoints
- Monitoring and logging (Prometheus/Grafana)

### Environment Configuration
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=waw_laundry
DB_USER=postgres
DB_PASSWORD=password

# Redis (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-key
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=168h

# Server
PORT=8080
GIN_MODE=debug
CORS_ORIGINS=http://localhost:3000

# Security
CSRF_SECRET=your-csrf-secret
RATE_LIMIT=100
```

---

## 📈 Performance Requirements

### Response Time Targets
- Authentication: < 200ms
- Customer CRUD: < 150ms
- Service CRUD: < 100ms
- Transaction creation: < 300ms
- Report generation: < 500ms
- Dashboard metrics: < 200ms

### Scalability Targets
- Support 1000+ concurrent users
- Handle 10,000+ transactions per day
- Database query optimization for large datasets
- Efficient pagination for large result sets

---

## 🔄 Development Phases

### Phase 1: Core Foundation (Week 1-2)
- Project setup and structure
- Database schema and migrations
- Authentication system implementation
- Basic CRUD operations for customers and services

### Phase 2: Transaction System (Week 3-4)
- Transaction management implementation
- Payment processing logic
- Status tracking and updates
- Basic validation and error handling

### Phase 3: Reporting & Analytics (Week 5-6)
- Dashboard metrics implementation
- Report generation (daily, monthly)
- Data export functionality
- Performance optimization

### Phase 4: Security & Testing (Week 7-8)
- Comprehensive security implementation
- Unit and integration testing
- API documentation completion
- Production deployment preparation

---

## 📋 Success Criteria

### Functional Requirements
- ✅ All CRUD operations working correctly
- ✅ Secure authentication and authorization
- ✅ Transaction processing with proper validation
- ✅ Accurate reporting and analytics
- ✅ Data integrity and consistency

### Technical Requirements
- ✅ 99.9% API uptime
- ✅ Response times within targets
- ✅ 80%+ test coverage
- ✅ Zero security vulnerabilities
- ✅ Proper error handling and logging

### Business Requirements
- ✅ Support for multiple concurrent cashiers
- ✅ Real-time transaction processing
- ✅ Accurate financial reporting
- ✅ Customer data management
- ✅ Service catalog flexibility

---

## 🎯 Future Enhancements

### Short-term (3 months)
- SMS/WhatsApp notifications
- Customer loyalty program
- Advanced reporting with charts
- Backup and restore functionality

### Medium-term (6 months)
- Mobile app API support
- Real-time notifications via WebSocket
- Advanced analytics and insights
- Multi-branch support

### Long-term (1 year)
- Customer self-service portal
- Integration with payment gateways
- Inventory management
- AI-powered business insights

---

*This PRD serves as the comprehensive guide for developing the Waw Laundry Backend system, ensuring alignment with the frontend features and business requirements.*