Here's the updated comprehensive implementation plan with enhanced admin user management:

---

## **Comprehensive Subscription & Admin Management System**

### **Phase 1: Database Schema Extensions**

**New Prisma Models:**
1. **Subscription Plans** - Define Basic, Pro, Enterprise tiers with credit allocations
2. **User Subscriptions** - Track active subscriptions, start/end dates, status
3. **Transactions** - Payment history with PayPal integration
4. **Credit Transactions** - Credit consumption history
5. **Support Tickets** - Ticket system with status, priority, categories
6. **API Keys** - Secure storage for AI provider keys
7. **API Usage Logs** - Track usage per API key
8. **User Activity Logs** - Track user actions and sessions

### **Phase 2: Payment Integration (PayPal)**

**API Routes:**
- `POST /api/payments/create-subscription` - Create PayPal subscription
- `POST /api/payments/webhook` - Handle PayPal webhooks
- `POST /api/payments/cancel` - Cancel subscription
- `GET /api/payments/history` - Get payment history

**Features:**
- Three pricing tiers: Basic ($9/mo - 100 credits), Pro ($29/mo - 500 credits), Enterprise ($99/mo - 2000 credits)
- Automatic credit allocation on successful payment
- Subscription renewal handling

### **Phase 3: User Subscription Dashboard**

**Pages:**
- `/dashboard/subscription` - Current plan, credits remaining
- `/dashboard/billing` - Payment history, upgrade/downgrade

**Components:**
- Credit balance display with progress bar
- Usage history chart
- Plan comparison/upgrade UI

### **Phase 4: Credit Consumption System**

**API Routes:**
- `POST /api/credits/deduct` - Deduct credits before AI operations
- `GET /api/credits/balance` - Check current balance

**Features:**
- Configurable credit cost per AI operation
- Real-time credit deduction
- Usage tracking per feature

### **Phase 5: Admin Panel - Enhanced User Management**

**Pages:**
- `/admin` - Admin dashboard home
- `/admin/users` - User management with search/filter
- `/admin/users/[id]` - User details, manual credit adjustment
- `/admin/tickets` - Support ticket management
- `/admin/tickets/[id]` - Ticket details, response interface
- `/admin/api-keys` - AI API key configuration
- `/admin/settings` - System settings

**Enhanced User Management Features:**
1. **User List View:**
   - Search by name, email, user ID
   - Filter by subscription status (active, expired, none)
   - Filter by date range (registered date)
   - Sort by name, email, credits, subscription status, last active
   - Pagination with configurable page size

2. **User Detail View:**
   - Profile information (name, email, image, created date)
   - Current subscription plan and status
   - Credit balance and usage history
   - Purchase history
   - Activity log/session history
   - Design systems created count

3. **User Actions:**
   - View full activity log
   - Manual credit adjustment (add/deduct)
   - Change subscription status
   - Ban/suspend user
   - Export user data (JSON/CSV)
   - Delete user

4. **Bulk Actions:**
   - Select multiple users
   - Bulk export to CSV
   - Bulk delete (with confirmation)

5. **User Status Management:**
   - Active (normal status)
   - Suspended (temporary block)
   - Banned (permanent block)
   - Each with reason tracking

### **Phase 6: Admin Panel - Support Tickets**

**Features:**
- Ticket status workflow: Open → In Progress → Resolved → Closed
- Priority levels: Low, Medium, High, Urgent
- Category tags: Billing, Technical, Account, Feature Request, Bug
- Admin response interface
- User notification on status changes

### **Phase 7: Admin Panel - AI API Key Management**

**Features:**
- Secure key storage (encrypted)
- Support for Google Gemini, OpenAI, Anthropic
- Key rotation and versioning
- Rate limit configuration
- Cost tracking per key
- Usage monitoring dashboard

### **Phase 8: Role-Based Access Control**

- Admin routes protected via Clerk publicMetadata
- Middleware checks for admin role
- Only users with admin role can access /admin routes

---

## **Technical Implementation Summary**

| Component | Technology |
|-----------|------------|
| Auth | Clerk (with publicMetadata roles) |
| Database | PostgreSQL + Prisma |
| Payments | PayPal SDK |
| UI | Existing shadcn/ui components |
| State | Zustand (existing) |

---

## **Pricing Tiers**

| Plan | Price | Credits | Features |
|------|-------|---------|----------|
| Basic | $9/mo | 100 credits | Basic AI features |
| Pro | $29/mo | 500 credits | All features + priority |
| Enterprise | $99/mo | 2000 credits | All features + dedicated support |

---

**Ready to implement?** Please toggle to Act Mode and I'll start building the complete system.