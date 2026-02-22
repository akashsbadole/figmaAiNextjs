# Subscription & Admin Management System

This document describes the comprehensive subscription and admin management system implemented for the DesignAI application.

## Overview

The system includes:
- User subscription plans with AI credit allocations
- PayPal payment integration
- Credit consumption tracking
- Admin panel with user management, support tickets, and API key configuration

## Database Models

### New Models Added

1. **SubscriptionPlan** - Defines subscription tiers
2. **Subscription** - User subscriptions
3. **Transaction** - Payment records
4. **CreditTransaction** - Credit usage history
5. **SupportTicket** - User support tickets
6. **TicketResponse** - Ticket responses
7. **UserActivityLog** - User activity tracking
8. **APIKey** - AI provider API keys (encrypted)
9. **APIUsageLog** - API usage tracking
10. **SystemSetting** - System configuration

### User Model Extensions

Added fields:
- `status` - User status (active, suspended, banned)
- `statusReason` - Reason for status change
- `statusUpdatedAt` - Timestamp of status change

## Subscription Plans

| Plan | Price | Credits | Features |
|------|-------|---------|----------|
| Basic | $9/mo | 100 | Basic AI features, 10 projects |
| Pro | $29/mo | 500 | All features, 50 projects, Figma export |
| Enterprise | $99/mo | 2000 | Unlimited projects, priority support, API access |

## Credit System

### Credit Costs

| Operation | Credits |
|-----------|---------|
| Design System Generation | 5 |
| Figma Generation | 3 |
| System Design Generation | 4 |
| Conversation Message | 1 |
| Agent Task | 2 |

### Free Tier
- 10 credits default
- No subscription required

## API Routes

### User Routes

```
GET  /api/credits/balance          - Get current credit balance
GET  /api/subscriptions/plans      - List available plans
POST /api/payments/create-order    - Create PayPal order
POST /api/payments/capture-order   - Capture PayPal payment
GET  /api/support/tickets          - Get user's tickets
POST /api/support/tickets          - Create support ticket
```

### Admin Routes

```
GET  /api/admin/check-auth         - Verify admin access
GET  /api/admin/stats              - Dashboard statistics
GET  /api/admin/users              - List users (search, filter, pagination)
POST /api/admin/users              - Bulk user operations
GET  /api/admin/tickets            - List support tickets
GET  /api/admin/api-keys           - List API keys
POST /api/admin/api-keys           - Create API key
PUT  /api/admin/api-keys           - Update API key
DELETE /api/admin/api-keys         - Delete API key
```

## Pages

### User Pages

- `/dashboard/subscription` - View plan, credits, upgrade options
- `/dashboard/support` - Support ticket management

### Admin Pages

- `/admin` - Admin dashboard
- `/admin/users` - User management with search, filter, bulk actions
- `/admin/tickets` - Support ticket management
- `/admin/api-keys` - AI API key configuration

## Admin Features

### User Management
- Search by name, email, user ID
- Filter by status (active, suspended, banned)
- View subscription and credit details
- Adjust credits manually
- Suspend/ban users
- Export user data (JSON/CSV)
- Bulk actions (suspend, activate, export)

### Support Tickets
- Ticket submission for users
- Status workflow: Open → In Progress → Resolved → Closed
- Priority levels: Low, Medium, High, Urgent
- Category tagging
- Admin response interface

### API Key Management
- Secure key storage (AES-256 encryption)
- Support for Google Gemini, OpenAI, Anthropic
- Key rotation and versioning
- Rate limit configuration
- Cost tracking per key
- Usage monitoring

## Role-Based Access Control

Uses Clerk's `publicMetadata` for admin roles:
- `admin` - Standard admin access
- `super_admin` - Full access including role management

### Setting Admin Role

```typescript
// Via Clerk dashboard or API
await clerkClient.users.updateUser(userId, {
  publicMetadata: { role: 'admin' }
})
```

## Setup Instructions

### 1. Update Database

```bash
# Stop the dev server first
npx prisma generate
npx prisma db push
```

### 2. Seed Default Plans

```bash
npx tsx prisma/seed.ts
```

### 3. Environment Variables

Add to `.env`:

```
# PayPal
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=sandbox  # or 'live' for production

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set Admin User

```typescript
// Run in browser console or create a setup route
await fetch('/api/admin/setup', {
  method: 'POST',
  body: JSON.stringify({ clerkId: 'your_clerk_user_id' })
})
```

## Integration with AI Operations

To deduct credits before AI operations:

```typescript
import { deductCredits, hasEnoughCredits } from '@/lib/subscription'

// Check credits
const { hasCredits, required, available } = await hasEnoughCredits('design_system_generate')

if (!hasCredits) {
  return { error: 'Insufficient credits', required, available }
}

// Deduct credits
const result = await deductCredits('design_system_generate', userId, entityId, 'design_system')

if (!result.success) {
  return { error: 'Failed to deduct credits' }
}

// Proceed with AI operation
```

## Security Considerations

1. **API Keys**: Encrypted at rest using AES-256-CBC
2. **Admin Routes**: Protected via middleware checking Clerk publicMetadata
3. **Payments**: Handled via PayPal's secure checkout flow
4. **User Data**: Export respects data privacy requirements

## Future Enhancements

- [ ] Stripe payment integration
- [ ] Team/organization accounts
- [ ] Credit rollover options
- [ ] Usage-based pricing
- [ ] Webhook notifications
- [ ] Email notifications for tickets