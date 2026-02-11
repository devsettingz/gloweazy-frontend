# Gloweazy End-to-End Test Flow

Complete testing guide for the booking, wallet, and dispute resolution system.

---

## 🎭 Test Flow Overview

### Actors
- **Stylist**: Jane (stylist_001)
- **Client**: John (client_001) or Guest
- **Admin**: Admin (admin_001)

---

## Flow 1: Happy Path (No Dispute)

### Step 1: Stylist Setup

#### 1.1 Create Services
```bash
POST /stylist/services
{
  "name": "Premium Haircut",
  "description": "Includes wash, cut, and style",
  "price": 65,
  "durationMinutes": 60,
  "category": "Hair"
}
```

**Expected Response:**
```json
{
  "id": "svc_001",
  "stylistId": "stylist_001",
  "name": "Premium Haircut",
  "price": 65,
  "durationMinutes": 60
}
```

#### 1.2 Set Availability
```bash
POST /stylist/availability
{
  "schedule": [
    {
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "18:00",
      "isWorking": true,
      "breaks": [{"start": "12:00", "end": "13:00"}]
    }
  ]
}
```

**Verification:**
- [ ] Services appear in stylist profile
- [ ] Available slots show on calendar
- [ ] Breaks are blocked out

---

### Step 2: Client Discovery & Booking

#### 2.1 Discover Stylists
```bash
GET /stylists/search?filter=hair&location=downtown
```

**Expected:** Jane appears with:
- ⭐ Rating: 4.9
- 💰 From $65
- ✅ Available Today badge

#### 2.2 Book Appointment (Guest Checkout)
```bash
POST /bookings
{
  "stylistId": "stylist_001",
  "serviceId": "svc_001",
  "date": "2026-02-15",
  "startTime": "10:00",
  "isGuest": true,
  "guestInfo": {
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "+1 555-0123",
    "saveInfo": true
  }
}
```

**Expected Response:**
```json
{
  "bookingId": "bk_abc123",
  "reference": "BKX7Y9Z",
  "status": "pending",
  "amount": 65,
  "paymentStatus": "escrow_held"
}
```

#### 2.3 Wallet Escrow Hold
```bash
GET /wallet/balance?userId=guest_john@example.com
```

**Expected:**
```json
{
  "balance": 0,
  "escrowAmount": 65,
  "transactions": [
    {
      "type": "escrow",
      "amount": 65,
      "status": "pending",
      "bookingId": "bk_abc123"
    }
  ]
}
```

---

### Step 3: Notifications

#### 3.1 Stylist Push Notification
```json
{
  "title": "🎉 New Booking!",
  "body": "John Smith booked Premium Haircut for Feb 15 at 10:00 AM",
  "data": {
    "type": "new-booking",
    "bookingId": "bk_abc123"
  }
}
```

#### 3.2 Client Confirmation Email
- Booking reference: BKX7Y9Z
- QR code for check-in
- "Create account" CTA

---

### Step 4: Service Completion

#### 4.1 Stylist Marks Complete
```bash
PATCH /bookings/bk_abc123/complete
{
  "stylistId": "stylist_001",
  "notes": "Service completed successfully"
}
```

#### 4.2 Escrow Released to Stylist
```bash
POST /wallet/escrow/release
{
  "bookingId": "bk_abc123",
  "toStylist": true
}
```

**Wallet Update:**
```json
{
  "stylistWallet": {
    "balance": 65,
    "escrowAmount": 0
  }
}
```

#### 4.3 Payout (Optional)
```bash
POST /wallet/payout
{
  "userId": "stylist_001",
  "amount": 65
}
```

---

## Flow 2: Dispute & Resolution

### Step 1: Client Raises Dispute

#### 1.1 Dispute Initiated
```bash
POST /bookings/bk_def456/dispute
{
  "clientId": "client_001",
  "reason": "Stylist was 30 minutes late and rushed the service",
  "evidence": ["photo1.jpg", "photo2.jpg"]
}
```

**Expected Response:**
```json
{
  "bookingId": "bk_def456",
  "status": "disputed",
  "disputeReason": "Stylist was 30 minutes late...",
  "escrowStatus": "frozen"
}
```

#### 1.2 Admin Dashboard Alert
```json
{
  "notification": {
    "type": "new_dispute",
    "bookingId": "bk_def456",
    "priority": "high",
    "message": "New dispute: Service quality issue - $85"
  }
}
```

---

### Step 2: Admin Resolution

#### 2.1 Admin Reviews Dispute
```bash
GET /bookings/disputes/bk_def456
```

**Response:**
```json
{
  "booking": {
    "id": "bk_def456",
    "service": "Hair Coloring",
    "amount": 85,
    "client": { "name": "Sarah Johnson", "id": "client_002" },
    "stylist": { "name": "Jane Doe", "id": "stylist_001" },
    "disputeReason": "Stylist was 30 minutes late...",
    "disputeHistory": []
  }
}
```

#### 2.2 Admin Resolves (Client Wins)
```bash
POST /bookings/bk_def456/resolve
{
  "status": "cancelled",
  "resolvedBy": "Admin Mike",
  "notes": "Reviewed evidence. Client complaint valid. Full refund issued.",
  "resolution": "client_favored"
}
```

**Expected Actions:**
1. ✅ Booking status → "cancelled"
2. ✅ Escrow released → **back to client**
3. ✅ Push notification to both parties
4. ✅ Email confirmations sent

---

### Step 3: Post-Resolution

#### 3.1 Client Wallet (Refund)
```bash
GET /wallet/balance?userId=client_002
```

**Expected:**
```json
{
  "balance": 85,
  "escrowAmount": 0,
  "transactions": [
    {
      "type": "credit",
      "amount": 85,
      "description": "Refund for booking bk_def456",
      "status": "completed"
    }
  ]
}
```

#### 3.2 Stylist Wallet (No Change)
```bash
GET /wallet/balance?userId=stylist_001
```

**Expected:**
```json
{
  "balance": 0,
  "escrowAmount": 0
}
```

#### 3.3 Push Notifications

**To Client:**
```json
{
  "title": "✅ Dispute Resolved",
  "body": "Your dispute for Hair Coloring was resolved in your favor. $85 refunded!"
}
```

**To Stylist:**
```json
{
  "title": "❌ Booking Cancelled",
  "body": "A dispute for Hair Coloring was reviewed. No payment will be issued."
}
```

---

## Flow 3: Alternative Scenario (Stylist Wins)

### Admin Resolution (Stylist Wins)
```bash
POST /bookings/bk_def456/resolve
{
  "status": "confirmed",
  "resolvedBy": "Admin Mike",
  "notes": "No evidence of late arrival. Service completed as described.",
  "resolution": "stylist_favored"
}
```

**Result:**
- Escrow released → **to stylist**
- Client receives notification explaining decision
- Stylist receives payment

---

## 🔧 Test Verification Checklist

### Stylist Side
- [ ] Can create/edit/delete services
- [ ] Can set weekly availability with breaks
- [ ] Receives push notification for new booking
- [ ] Can mark booking complete
- [ ] Receives escrow payment
- [ ] Can request payout

### Client Side
- [ ] Can discover stylists with filters
- [ ] Can book as guest without registration
- [ ] Receives booking confirmation with QR code
- [ ] Receives reminder notifications (24h, 1h)
- [ ] Can raise dispute with reason
- [ ] Receives dispute resolution notification
- [ ] Receives refund if dispute won

### Admin Side
- [ ] Can view all disputes with filters
- [ ] Can see booking details and history
- [ ] Can resolve dispute (confirmed/cancelled)
- [ ] Escrow auto-releases to correct party
- [ ] Both parties notified of resolution

### Wallet/Escrow
- [ ] Funds held in escrow on booking
- [ ] Escrow frozen during dispute
- [ ] Auto-release on completion
- [ ] Manual release on admin resolution
- [ ] Transaction history updated

### Notifications
- [ ] Stylist notified of new booking
- [ ] Client reminded before appointment
- [ ] Both notified of dispute resolution
- [ ] Payout confirmation sent

---

## 🚨 Common Issues & Fixes

### Issue: Escrow not releasing
**Check:**
1. Is booking status updated?
2. Is escrow release API called?
3. Are wallet balances updating?

### Issue: Notifications not received
**Check:**
1. Push token registered?
2. expoPushToken saved to user profile?
3. Backend sending to correct token?

### Issue: Guest booking fails
**Check:**
1. Guest info validation passing?
2. isGuest flag set in request?
3. Backend handling guestInfo object?

---

## 📱 Manual Test Script

### Prerequisites
```bash
# Install dependencies
npm install

# Start dev server
npx expo start
```

### Test Accounts
```yaml
Stylist:
  email: jane@gloweazy.com
  password: Test123!
  
Client:
  email: john@example.com
  password: Test123!
  
Admin:
  email: admin@gloweazy.com
  password: Admin123!
```

### Step-by-Step

1. **Login as Stylist (Jane)**
   - Navigate to /stylist/services
   - Add service: "Haircut - $50 - 45min"
   - Navigate to /stylist/availability
   - Set Mon-Fri 9am-5pm

2. **As Guest Client**
   - Navigate to /discover
   - Search "Haircut"
   - Select Jane's profile
   - Choose "Continue as Guest"
   - Fill: John Doe, john@test.com, 555-0123
   - Select service, date, time
   - Complete booking

3. **Verify Notifications**
   - Check Jane got push notification
   - Check email sent to john@test.com

4. **Login as Admin**
   - Navigate to /disputes
   - (Skip if no dispute)

5. **Complete Booking**
   - Jane marks booking complete
   - Verify escrow releases to Jane

---

## ✅ Success Criteria

All test flows pass when:
- [ ] Stylist can set up complete profile
- [ ] Guest can book without registration
- [ ] Funds held in escrow correctly
- [ ] Push notifications delivered
- [ ] Disputes resolved with auto-payment
- [ ] All parties notified appropriately
