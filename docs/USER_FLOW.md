# 👤 User Authentication API Documentation

> **System:** Passwordless OTP-based Login/Signup System

---

## 📖 Table of Contents

1. [System Overview](#-system-overview)
2. [Authentication Flow](#-authentication-flow)
3. [API Endpoints](#-api-endpoints)
4. [Error Responses](#-error-responses)
5. [Database Schema](#-database-schema)

---

## 🎯 System Overview

Ye system **OTP (One-Time Password)** use karke users ko login/signup karne deta hai:

- ✅ **No Password Required** - Sirf email ya phone chahiye
- ✅ **Auto Signup** - Naye user automatically create ho jate hain
- ✅ **Secure** - JWT tokens aur HttpOnly cookies
- ✅ **5-Minute OTP Validity** - Security ke liye
- ✅ **Dual Database** - MongoDB (OTP) + SQL (Users)

---

## 🔄 Authentication Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                        USER JOURNEY                              │
└──────────────────────────────────────────────────────────────────┘

Step 1: Send OTP Request
┌─────────────────────────────────────────────────────────┐
│  User enters:                                           │
│  • Email (example@gmail.com) OR                         │
│  • Phone (9876543210)                                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Backend Process:                                       │
│  1. Validate input (Joi validation)                     │
│  2. Generate 6-digit OTP (123456)                       │
│  3. Store in MongoDB:                                   │
│     - email/phone                                       │
│     - otp value                                         │
│     - expiresAt (current time + 5 minutes)              │
│  4. Return success response                             │
│     ⚠️ Production: Send OTP via Email/SMS               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  User receives OTP                                      │
│  (Development: In response | Production: Email/SMS)     │
└─────────────────────────────────────────────────────────┘


Step 2: Verify OTP
┌─────────────────────────────────────────────────────────┐
│  User enters:                                           │
│  • Email/Phone (same as before)                         │
│  • OTP (6 digits)                                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Backend Verification:                                  │
│  1. Find OTP in MongoDB (latest entry)                  │
│  2. Check: OTP valid hai? (match + not expired)         │
│  3. Check user in SQL database                          │
└────────────────────┬────────────────────────────────────┘
                     │
            ┌────────┴────────┐
            │                 │
            ▼                 ▼
    ┌──────────────┐   ┌──────────────┐
    │ User Found   │   │ New User     │
    │ (Existing)   │   │ (First Time) │
    └──────┬───────┘   └──────┬───────┘
           │                  │
           │                  ▼
           │          ┌──────────────────┐
           │          │ Create User:     │
           │          │ - fullName: Guest│
           │          │ - email/phone    │
           │          │ - roles: CUSTOMER│
           │          │ - status: ACTIVE │
           │          └──────┬───────────┘
           │                 │
           └─────────┬───────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Token Generation & Cleanup:                            │
│  1. Generate JWT token (user id, email, roles)          │
│  2. Delete used OTP from MongoDB                        │
│  3. Set token in HttpOnly cookie                        │
│  4. Return response with:                               │
│     - token                                             │
│     - user data                                         │
│     - isNewUser flag                                    │
└────────────────────┬────────────────────────────────────┘
                     │
            ┌────────┴────────┐
            │                 │
            ▼                 ▼
    ┌──────────────┐   ┌──────────────┐
    │ isNewUser:   │   │ isNewUser:   │
    │ true         │   │ false        │
    └──────┬───────┘   └──────┬───────┘
           │                  │
           ▼                  ▼
    Profile Page         Dashboard
```

---

## 🚀 API Endpoints

### 1️⃣ Send OTP

**📍 Endpoint:** `POST /api/auth/send-otp`

**📝 Purpose:** User ko OTP bhejne ke liye

**📥 Input:**

```json
// Option 1: Email
{
  "email": "user@gmail.com"
}

// Option 2: Phone
{
  "phone": "9876543210"
}
```

**✅ Input Validation:**

| Field   | Required                               | Rules                                              | Valid Examples                                                   |
| ------- | -------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------- |
| `email` | Optional (but email OR phone required) | • Valid email format<br>• Domain: .com ya .in only | ✅ user@gmail.com<br>✅ test@company.in<br>❌ invalid@domain.org |
| `phone` | Optional (but email OR phone required) | • Exactly 10 digits<br>• Only numbers              | ✅ 9876543210<br>❌ 98765 (short)<br>❌ 98-765-43210 (hyphens)   |

**⚙️ Backend Logic:**

1. **Validation Check:**
   - Email YA phone dono me se ek required hai
   - Dono ek sath nahi allowed
   - Email: valid format, domain check
   - Phone: exactly 10 digits, numbers only

2. **OTP Generation:**
   - 6-digit random number generate
   - Example: 123456

3. **Database Storage (MongoDB):**
   - Store: email/phone, otp, expiresAt
   - Expiry: Current time + 5 minutes

4. **Response:**
   - Development: OTP response me milta hai
   - Production: OTP email/SMS se jayega

**✅ Success Response:**

```json
{
  "statusCode": 200,
  "data": {
    "email": "user@gmail.com",
    "phone": null,
    "otp": "123456"
  },
  "message": "OTP sent successfully"
}
```

**❌ Error Scenarios:**

| Error          | Reason                       | Message                                             |
| -------------- | ---------------------------- | --------------------------------------------------- |
| Both empty     | Email aur phone dono missing | "Either email or phone is required to generate OTP" |
| Invalid email  | Wrong email format           | "Please enter a valid email address"                |
| Invalid phone  | Not 10 digits ya letters hai | "Phone number must be exactly 10 digits"            |
| Database error | MongoDB connection issue     | "Failed to generate OTP. Please try again."         |

---

### 2️⃣ Verify OTP & Authenticate

**📍 Endpoint:** `POST /api/auth/verify-otp`

**📝 Purpose:** OTP verify karke user ko login/signup karna

**📥 Input:**

```json
// With Email
{
  "email": "user@gmail.com",
  "otp": "123456"
}

// With Phone
{
  "phone": "9876543210",
  "otp": "123456"
}
```

**✅ Input Validation:**

| Field   | Required                               | Rules                                 | Valid Examples                                         |
| ------- | -------------------------------------- | ------------------------------------- | ------------------------------------------------------ |
| `email` | Optional (but email OR phone required) | • Valid email<br>• Domain: .com/.in   | ✅ user@gmail.com                                      |
| `phone` | Optional (but email OR phone required) | • Exactly 10 digits<br>• Numbers only | ✅ 9876543210                                          |
| `otp`   | **Required**                           | • Exactly 6 digits<br>• Numbers only  | ✅ 123456<br>❌ 12345 (5 digits)<br>❌ 12345a (letter) |

**⚙️ Backend Logic:**

1. **OTP Verification:**
   - MongoDB me latest OTP find karo
   - Check 1: OTP match karta hai?
   - Check 2: Expire to nahi ho gaya? (5 min check)

2. **User Lookup:**
   - SQL database me user search karo (email/phone se)
3. **User Not Found (New User):**
   - Naya user create karo:
     - fullName: "Guest"
     - email: provided email OR auto-generated
     - phone: provided phone OR default "0000000000"
     - roles: ["CUSTOMER"]
     - status: "ACTIVE"
   - isNewUser flag = true

4. **User Found (Existing User):**
   - Existing user data fetch karo
   - isNewUser flag = false

5. **Token & Cleanup:**
   - JWT token generate (user id, email, roles)
   - Used OTP delete karo (security)
   - Token ko HttpOnly cookie me set karo
   - Response bhejo

**✅ Success Response (New User):**

```json
{
  "statusCode": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "fullName": "Guest",
      "email": "user@gmail.com",
      "phone": null,
      "roles": ["CUSTOMER"],
      "status": "ACTIVE",
      "profileImage": null,
      "cart": [],
      "wishlist": [],
      "addresses": [],
      "createdAt": "2024-01-30T10:00:00.000Z",
      "updatedAt": "2024-01-30T10:00:00.000Z"
    },
    "isNewUser": true
  },
  "message": "Authentication successful"
}
```

**✅ Success Response (Existing User):**

```json
{
  "statusCode": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 5,
      "fullName": "John Doe",
      "email": "john@gmail.com",
      "phone": "9876543210",
      "roles": ["CUSTOMER", "SELLER"],
      "status": "ACTIVE",
      "profileImage": "https://example.com/profile.jpg",
      "cart": [...],
      "wishlist": [...],
      "addresses": [...]
    },
    "isNewUser": false
  },
  "message": "Authentication successful"
}
```

**🎯 Frontend Logic:**

- **isNewUser === true** → User ko profile completion page par bhejo
- **isNewUser === false** → User ko dashboard/home par bhejo

**❌ Error Scenarios:**

| Error            | Reason                           | Message                                                               |
| ---------------- | -------------------------------- | --------------------------------------------------------------------- |
| Missing fields   | Email/phone ya OTP missing       | "Either email or phone is required to verify OTP" / "OTP is required" |
| Invalid OTP      | Wrong OTP entered                | "Invalid OTP. Please try again."                                      |
| Expired OTP      | 5 minutes se zyada ho gaye       | "OTP has expired. Please request a new one."                          |
| Invalid format   | OTP not 6 digits                 | "OTP must be exactly 6 digits"                                        |
| Contains letters | OTP me numbers ke alawa kuch hai | "OTP must contain only numbers"                                       |

---

### 3️⃣ Get User Profile

**📍 Endpoint:** `GET /api/auth/profile`

**📝 Purpose:** Logged-in user ka profile data fetch karna

**🔒 Authentication:** Required (JWT Token in Cookie or Header)

**📥 Input:** None (token se user identify hota hai)

**⚙️ Backend Logic:**

1. **Authentication Check:**
   - JWT token verify karo
   - User ID extract karo

2. **Data Fetch:**
   - SQL database se user data fetch
   - Seller profile bhi include (agar seller hai)
   - Sensitive data hide karo (refreshToken)

3. **Response:**
   - Complete user profile return

**✅ Success Response:**

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john@gmail.com",
    "phone": "9876543210",
    "roles": ["CUSTOMER"],
    "status": "ACTIVE",
    "profileImage": "https://example.com/profile.jpg",
    "cart": [
      {
        "productId": 101,
        "quantity": 2
      }
    ],
    "wishlist": [201, 202, 203],
    "addresses": [
      {
        "type": "home",
        "street": "123 Main St",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001"
      }
    ],
    "sellerProfile": null,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-30T10:00:00.000Z"
  },
  "message": "Profile fetched successfully"
}
```

**❌ Error Scenarios:**

| Error         | Reason                   | Message                                   |
| ------------- | ------------------------ | ----------------------------------------- |
| No token      | Token missing in request | "Authentication required. Please log in." |
| Invalid token | Token tampered/wrong     | "Invalid authentication token."           |
| Expired token | Token expired (>1 day)   | "Session expired. Please log in again."   |
| User deleted  | User account deleted     | "User not found"                          |

---

### 4️⃣ Logout

**📍 Endpoint:** `POST /api/auth/logout`

**📝 Purpose:** User ko logout karna

**🔒 Authentication:** Required (JWT Token)

**📥 Input:** None

**⚙️ Backend Logic:**

1. **Cookie Clear:**
   - "token" naam ki cookie ko clear karo
   - Same security settings ke sath (httpOnly, secure, sameSite)

2. **Response:**
   - Success message return

**✅ Success Response:**

```json
{
  "statusCode": 200,
  "data": null,
  "message": "Logged out successfully"
}
```

**🎯 Frontend Logic:**

- Local storage clear karo
- User ko login page par redirect karo

---

## ⚠️ Error Responses

### Common Error Format:

```json
{
  "statusCode": 400,
  "message": "Error description here"
}
```

### Complete Error Reference:

| Status  | Error Message                                       | When It Happens                         | User Action               |
| ------- | --------------------------------------------------- | --------------------------------------- | ------------------------- |
| **400** | "Either email or phone is required to generate OTP" | Email aur phone dono missing            | Koi ek field fill karo    |
| **400** | "Please enter a valid email address"                | Invalid email format                    | Correct email daalo       |
| **400** | "Phone number must be exactly 10 digits"            | Phone < 10 ya > 10 digits               | 10-digit number daalo     |
| **400** | "Either email or phone is required to verify OTP"   | OTP verification me email/phone missing | Same email/phone use karo |
| **400** | "OTP is required"                                   | OTP field empty                         | OTP enter karo            |
| **400** | "OTP must be exactly 6 digits"                      | OTP 6 digits ka nahi                    | 6-digit OTP daalo         |
| **400** | "OTP must contain only numbers"                     | OTP me letters/symbols                  | Sirf numbers daalo        |
| **400** | "Invalid OTP. Please try again."                    | Wrong OTP entered                       | Correct OTP daalo         |
| **400** | "OTP has expired. Please request a new one."        | 5 minutes se zyada ho gaya              | Naya OTP request karo     |
| **401** | "Authentication required. Please log in."           | Token missing                           | Login karo                |
| **401** | "Invalid authentication token."                     | Token invalid                           | Re-login karo             |
| **401** | "Session expired. Please log in again."             | Token expired                           | Re-login karo             |
| **404** | "User not found"                                    | User deleted/doesn't exist              | Re-signup karo            |
| **500** | "Failed to generate OTP. Please try again."         | Database error                          | Retry karo                |

---

## 📊 Database Schema

### 🍃 MongoDB - OTP Collection

**Purpose:** Temporary OTP storage (5-minute validity)

```
{
  _id: ObjectId,
  email: String or null,
  phone: String or null,
  otp: String,                    // "123456"
  expiresAt: Date,                // Current time + 5 minutes
  createdAt: Date                 // Auto-generated timestamp
}
```

**Example:**

```json
{
  "_id": "65b9c8f7a1b2c3d4e5f6a7b8",
  "email": "user@gmail.com",
  "phone": null,
  "otp": "123456",
  "expiresAt": "2024-01-30T10:05:00.000Z",
  "createdAt": "2024-01-30T10:00:00.000Z"
}
```

**Indexes:**

- email (for fast lookup)
- phone (for fast lookup)
- expiresAt (for automatic deletion)

---

### 🗄️ SQL Database - Users Table

**Purpose:** Permanent user data storage

```
Column Name     | Type          | Description
----------------|---------------|----------------------------------
id              | INTEGER       | Primary key (auto-increment)
fullName        | VARCHAR(255)  | User's full name
email           | VARCHAR(255)  | Unique email address
phone           | VARCHAR(10)   | 10-digit phone number
roles           | JSON          | Array: ["CUSTOMER"] or ["SELLER", "CUSTOMER"]
status          | ENUM          | ACTIVE, DISABLED, BLOCKED, SUSPENDED
profileImage    | TEXT          | Profile picture URL
cart            | JSON          | Array of cart items
wishlist        | JSON          | Array of product IDs
addresses       | JSON          | Array of address objects
refreshToken    | TEXT          | For future token refresh feature
createdAt       | TIMESTAMP     | Account creation time
updatedAt       | TIMESTAMP     | Last update time
```

**Example:**

```json
{
  "id": 1,
  "fullName": "John Doe",
  "email": "john@gmail.com",
  "phone": "9876543210",
  "roles": ["CUSTOMER"],
  "status": "ACTIVE",
  "profileImage": "https://example.com/john.jpg",
  "cart": [{ "productId": 101, "quantity": 2 }],
  "wishlist": [201, 202],
  "addresses": [
    {
      "type": "home",
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    }
  ],
  "refreshToken": null,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-30T10:00:00.000Z"
}
```

**Indexes:**

- email (unique)
- phone

---

## 🔒 Security Features

### 1️⃣ OTP Security

```
Feature               | Implementation
----------------------|----------------------------------
Expiry Time           | 5 minutes (300 seconds)
One-Time Use          | OTP delete after verification
Latest OTP Priority   | Agar multiple OTPs hai, latest wala use hoga
Length                | 6 digits (000000 to 999999)
Type                  | Numeric only
Storage               | MongoDB (temporary)
```

### 2️⃣ Token Security

```
Feature               | Implementation
----------------------|----------------------------------
Type                  | JWT (JSON Web Token)
Expiry                | 1 day (24 hours)
Storage               | HttpOnly Cookie (XSS protection)
Secure Flag           | true (HTTPS only in production)
SameSite              | strict (CSRF protection)
Payload               | user id, email, roles (no password)
```

### 3️⃣ Cookie Configuration

```
Property         | Value      | Purpose
-----------------|------------|---------------------------
httpOnly         | true       | JavaScript se access nahi
secure           | true       | HTTPS-only transmission
sameSite         | strict     | CSRF attack prevention
maxAge           | Not set    | Session cookie (browser close pe delete)
```

---

## 📝 Important Notes

### 🚨 Development vs Production

**Development:**

- ✅ OTP response me visible hai (testing ke liye)
- ✅ Console logs enabled
- ✅ Detailed error messages

**Production:**

- ❌ OTP response me nahi bhejana
- ✅ Email/SMS service integrate karo
- ✅ Rate limiting add karo (OTP spam prevention)
- ✅ Proper logging setup
- ✅ HTTPS mandatory
- ✅ Generic error messages (security)

### ⏱️ Timing Diagram

```
T = 0:00        User requests OTP
                ↓
T = 0:01        OTP generated & stored (expires at T = 5:01)
                ↓
T = 0:30        User enters OTP → ✅ Valid
                ↓
T = 5:00        Same OTP entered → ✅ Still valid
                ↓
T = 5:02        Same OTP entered → ❌ Expired
                ↓
                User must request new OTP
```

### 🔄 OTP Reuse Prevention

```
Scenario 1: Normal Flow
Request OTP → OTP stored → User verifies → OTP deleted ✅

Scenario 2: Multiple OTPs
Request OTP #1 (123456)
Request OTP #2 (789012) ← Latest
Verify with 789012 → ✅ Success (latest OTP works)
Verify with 123456 → ❌ Fails (old OTP ignored)

Scenario 3: Already Used
Request OTP → Verify → OTP deleted
Try to verify again → ❌ "Invalid OTP" (already deleted)
```

---

## 🎯 Response Data Meaning

### isNewUser Flag

```
isNewUser = true
└─ Matlab: User pehli baar login kar raha hai
   └─ Frontend Action: Profile completion page par bhejo
      └─ User ko naam, address wagera fill karne do

isNewUser = false
└─ Matlab: User pehle se registered hai
   └─ Frontend Action: Seedha dashboard par bhejo
      └─ User ready to use app
```

### User Status Values

```
ACTIVE      → Normal user, full access
DISABLED    → Account temporarily disabled by user
BLOCKED     → Admin ne block kiya (policy violation)
SUSPENDED   → Temporary suspension (under review)
```

### User Roles

```
CUSTOMER    → Normal buyer
SELLER      → Can sell products (extra sellerProfile table)
ADMIN       → Full system access (future feature)

Note: Ek user ke multiple roles ho sakte hain
Example: ["CUSTOMER", "SELLER"] - Buyer bhi, seller bhi
```

---

**🎉 Documentation Complete!**

Questions? Doubts? Team se discuss karo! 💬
