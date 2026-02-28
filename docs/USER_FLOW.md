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
- ✅ **Soft Delete Support** - Account restore window (24h to 30 days)

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
│  1. Find latest OTP in MongoDB (match + expiry check)   │
│  2. Check user in SQL database (paranoid: false)        │
│     → includes soft-deleted users                       │
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
           │          │ - email/phone    │
           │          │   (other fields  │
           │          │   use DB defaults│
           │          │   )              │
           │          │ - isNewUser=true │
           │          └──────┬───────────┘
           │                 │
           └─────────┬───────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Soft-Delete Check (if user.deletedAt exists):          │
│                                                         │
│  < 24 hours since deletion  → ❌ BLOCK (wait 24h)       │
│  24h to 30 days             → ✅ AUTO RESTORE account   │
│  > 30 days                  → ❌ BLOCK (permanently     │
│                                  deleted)               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Status Check:                                          │
│  BLOCKED    → ❌ 403 Error                              │
│  DISABLED   → ❌ 403 Error                              │
│  SUSPENDED  → ❌ 403 Error                              │
│  ACTIVE     → ✅ Continue                               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Token Generation & Cleanup:                            │
│  1. Generate JWT token (id, email/phone, roles)         │
│  2. Delete ALL OTPs for that email/phone from MongoDB   │
│  3. Set token in HttpOnly cookie (maxAge: 24h)          │
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
   - 6-digit random number generate (`generateOTP()` utility)

3. **Database Storage (MongoDB):**
   - Store: email/phone (only whichever is provided), otp, expiresAt
   - Expiry: `process.env.OTP_EXPIRY_MINUTES` (default: 5 minutes)

4. **Response:**
   - Development: OTP response me milta hai
   - Production: OTP email/SMS se jayega (TODO)

**✅ Success Response:**

```json
{
  "statusCode": 200,
  "data": {
    "email": "user@gmail.com",
    "phone": null,
    "otp": "123456"
  },
  "message": "A one-time verification code has been sent successfully."
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
   - MongoDB me `{ email/phone, otp }` se latest record find karo (sorted by `createdAt: -1`)
   - Check 1: OTP record milta hai?
   - Check 2: `otpRecord.expiresAt < currentTime` → expired?

2. **User Lookup:**
   - SQL database me user search karo (`paranoid: false` — soft-deleted users bhi include)

3. **User Not Found (New User):**
   - Naya user create karo with only `email` or `phone` (DB defaults for rest)
   - `isNewUser` flag = `true`

4. **Soft-Deleted User Check:**
   - `user.deletedAt` present hai to time since deletion calculate karo:
     - **< 24 hours** → `403` error: must wait 24 hours
     - **24h – 30 days** → `user.restore()` automatically
     - **> 30 days** → `403` error: permanently deleted

5. **Status Check:**
   - `BLOCKED` → `403` error
   - `DISABLED` → `403` error
   - `SUSPENDED` → `403` error

6. **Token & Cleanup:**
   - JWT token generate (`id`, `email`/`phone`, `roles`)
   - **ALL OTPs** for that email/phone delete karo (`deleteMany`)
   - Token ko HttpOnly cookie me set karo (`maxAge: 24h`)
   - Response bhejo

**✅ Success Response (New User):**

```json
{
  "statusCode": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "fullName": null,
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
  "message": "You have been authenticated successfully."
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
  "message": "You have been authenticated successfully."
}
```

**🎯 Frontend Logic:**

- **isNewUser === true** → User ko profile completion page par bhejo
- **isNewUser === false** → User ko dashboard/home par bhejo

**❌ Error Scenarios:**

| Error               | Reason                              | Status | Message                                                                 |
| ------------------- | ----------------------------------- | ------ | ----------------------------------------------------------------------- |
| Missing fields      | Email/phone ya OTP missing          | 400    | "Either email or phone is required to verify OTP" / "OTP is required"  |
| Invalid OTP format  | OTP not 6 digits                    | 400    | "OTP must be exactly 6 digits"                                          |
| Contains letters    | OTP me numbers ke alawa kuch hai    | 400    | "OTP must contain only numbers"                                         |
| Invalid OTP         | Wrong OTP entered / already used    | 400    | "The verification code you entered is invalid."                         |
| Expired OTP         | 5 minutes se zyada ho gaye          | 400    | "The verification code has expired. Please request a new code."         |
| Recently deleted    | Account deleted < 24 hours ago      | 403    | "Your account was recently deleted. You can restore it after 24 hours." |
| Permanently deleted | Account deleted > 30 days ago       | 403    | "Your account has been permanently deleted."                            |
| Account blocked     | Admin ne block kiya                 | 403    | "Your account has been blocked. Please contact support for assistance." |
| Account disabled    | Account disabled                    | 403    | "Your account is currently disabled. Please reach out to support."      |
| Account suspended   | Temporary suspension                | 403    | "Your account has been temporarily suspended. Please try again later."  |

---

### 3️⃣ Get User Profile

**📍 Endpoint:** `GET /api/auth/profile`

**📝 Purpose:** Logged-in user ka profile data fetch karna

**🔒 Authentication:** Required (JWT Token in Cookie or Header)

**📥 Input:** None (token se user identify hota hai)

**⚙️ Backend Logic:**

1. **Authorization Check:**
   - `req.user?.id` check karo (set by `userAuth` middleware)
   - Missing → `401` error

2. **Data Fetch:**
   - `userModel.findByPk(userId)` — SQL database se user fetch
   - Not found → `404` error

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
    "cart": [{ "productId": 101, "quantity": 2 }],
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
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-30T10:00:00.000Z"
  },
  "message": "Your profile has been retrieved successfully."
}
```

**❌ Error Scenarios:**

| Error         | Reason                  | Message                                          |
| ------------- | ----------------------- | ------------------------------------------------ |
| No user ID    | Token missing / invalid | "You are not authorized to perform this action." |
| Invalid token | Token tampered/wrong    | "Invalid authentication token."                  |
| Expired token | Token expired (> 1 day) | "Session expired. Please log in again."          |
| User deleted  | User not found in DB    | "The requested user account could not be found." |

---

### 4️⃣ Complete User Profile

**📍 Endpoint:** `PATCH /api/auth/profile`

**📝 Purpose:** User apna profile complete/update kare (name, email, phone, image)

**🔒 Authentication:** Required (JWT Token)

**📥 Input:** `multipart/form-data`

```
fullName  (optional) - string
email     (optional) - string
phone     (optional) - string
file      (optional) - image file (profileImage)
```

**⚙️ Backend Logic:**

1. **Authorization Check:** `req.user?.id` verify karo
2. **User Fetch:** `findByPk(userId)` — not found → `404`
3. **Image Handling:**
   - File uploaded hai → old image Cloudinary se delete karo
   - New image Cloudinary par upload karo
   - `secure_url` save karo; upload fail → `500` error
4. **Other Fields:** `fullName`, `email`, `phone` — jo bhi provided hai update karo
5. **Save:** `user.update(updateData)`

**✅ Success Response:**

```json
{
  "statusCode": 200,
  "data": { /* updated user object */ },
  "message": "Your profile has been updated successfully."
}
```

---

### 5️⃣ Logout

**📍 Endpoint:** `POST /api/auth/logout`

**📝 Purpose:** User ko logout karna

**🔒 Authentication:** Required (JWT Token)

**📥 Input:** None

**⚙️ Backend Logic:**

1. **Cookie Clear:**
   - `token` cookie clear karo same security settings ke sath (`httpOnly`, `secure`, `sameSite: strict`)

**✅ Success Response:**

```json
{
  "statusCode": 200,
  "data": "You have been logged out successfully.",
  "message": "You have been logged out successfully."
}
```

**🎯 Frontend Logic:**

- Local storage clear karo
- User ko login page par redirect karo

---

### 6️⃣ Delete Account

**📍 Endpoint:** `DELETE /api/auth/account`

**📝 Purpose:** User apna account delete kare (soft delete)

**🔒 Authentication:** Required (JWT Token)

**📥 Input:** None

**⚙️ Backend Logic:**

1. **Authorization Check:** `req.user?.id` verify karo
2. **User Fetch:** `findByPk(userId)` — not found → `404`
3. **Soft Delete:** `user.destroy()` — `deletedAt` timestamp set hota hai (Sequelize paranoid)
4. **Cleanup:** `refreshToken` null set karo, `token` cookie clear karo

**✅ Success Response:**

```json
{
  "statusCode": 200,
  "data": "Your account has been deleted successfully.",
  "message": "Your account has been deleted successfully."
}
```

**⚠️ Restore Window:**

```
Deleted at T=0
├── T < 24h       → Login blocked (wait 24 hours)
├── 24h < T < 30d → Auto-restored on next successful login
└── T > 30d       → Permanently blocked (cannot restore)
```

---

## 🛡️ Admin Endpoints

### 7️⃣ Get All Users (Admin Only)

**📍 Endpoint:** `GET /api/admin/users`

**📝 Purpose:** Paginated list of all users with search/filter

**🔒 Authentication:** Admin role required

**📥 Query Params:**

| Param    | Type   | Default | Max | Description                       |
| -------- | ------ | ------- | --- | --------------------------------- |
| `page`   | number | 1       | —   | Page number (min: 1)              |
| `limit`  | number | 20      | 100 | Results per page                  |
| `search` | string | —       | —   | Search by fullName, email, phone  |
| `role`   | string | —       | —   | Filter by role (e.g. `CUSTOMER`)  |
| `status` | string | —       | —   | Filter by status (e.g. `ACTIVE`)  |

**⚙️ Backend Logic:**
- `search` → `Op.like` on `fullName`, `email`, `phone`
- `role` → `JSON_CONTAINS` on `roles` JSON column (MySQL specific)
- `status` → exact match
- `refreshToken` column excluded from response
- Ordered by `createdAt DESC`

**✅ Success Response:**

```json
{
  "statusCode": 200,
  "data": {
    "users": [...],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "totalPages": 8
    }
  },
  "message": "User list retrieved successfully."
}
```

---

### 8️⃣ Update User Status (Admin Only)

**📍 Endpoint:** `PATCH /api/admin/users/:userId/status`

**📝 Purpose:** Admin kisi bhi user ka status change kare

**🔒 Authentication:** Admin role required

**📥 Input:**

```json
{
  "status": "BLOCKED"
}
```

**⚙️ Backend Logic:**
- `userId` from route params (converted to `Number`)
- `userModel.findByPk(userId)` — not found → `404`
- `user.update({ status })`

**✅ Success Response:**

```json
{
  "statusCode": 200,
  "data": { /* updated user object */ },
  "message": "The user's account status has been updated successfully."
}
```

---

### 9️⃣ Get Single User (Admin View)

**📍 Endpoint:** `GET /api/admin/users/:userId`

**📝 Purpose:** Single user ka complete data fetch karna

**🔒 Authentication:** Admin role required

**✅ Success Response:**

```json
{
  "statusCode": 200,
  "data": { /* full user object */ },
  "message": "User details retrieved successfully."
}
```

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

| Status  | Error Message                                                                | When It Happens                          | User Action               |
| ------- | ---------------------------------------------------------------------------- | ---------------------------------------- | ------------------------- |
| **400** | "Either email or phone is required to generate OTP"                          | Email aur phone dono missing             | Koi ek field fill karo    |
| **400** | "Please enter a valid email address"                                         | Invalid email format                     | Correct email daalo       |
| **400** | "Phone number must be exactly 10 digits"                                     | Phone < 10 ya > 10 digits                | 10-digit number daalo     |
| **400** | "Either email or phone is required to verify OTP"                            | OTP verify me email/phone missing        | Same email/phone use karo |
| **400** | "OTP is required"                                                            | OTP field empty                          | OTP enter karo            |
| **400** | "OTP must be exactly 6 digits"                                               | OTP 6 digits ka nahi                     | 6-digit OTP daalo         |
| **400** | "OTP must contain only numbers"                                              | OTP me letters/symbols                   | Sirf numbers daalo        |
| **400** | "The verification code you entered is invalid."                              | Wrong/already-used OTP                   | Correct/new OTP daalo     |
| **400** | "The verification code has expired. Please request a new code."              | 5 minutes se zyada ho gaya               | Naya OTP request karo     |
| **401** | "You are not authorized to perform this action."                             | Token/user ID missing                    | Login karo                |
| **401** | "Invalid authentication token."                                              | Token invalid/tampered                   | Re-login karo             |
| **401** | "Session expired. Please log in again."                                      | Token expired (> 1 day)                  | Re-login karo             |
| **403** | "Your account was recently deleted. You can restore it after 24 hours."      | Deleted < 24h ago                        | 24h baad try karo         |
| **403** | "Your account has been permanently deleted."                                 | Deleted > 30 days ago                    | New account banao         |
| **403** | "Your account has been blocked. Please contact support for assistance."      | Admin ne block kiya                      | Support contact karo      |
| **403** | "Your account is currently disabled. Please reach out to support."           | Account disabled                         | Support contact karo      |
| **403** | "Your account has been temporarily suspended. Please try again later."       | Temporary suspension                     | Baad me try karo          |
| **404** | "The requested user account could not be found."                             | User deleted/doesn't exist               | Re-signup karo            |
| **500** | "Failed to generate OTP. Please try again."                                  | MongoDB connection issue                 | Retry karo                |
| **500** | "Something went wrong while uploading your profile image. Please try again." | Cloudinary upload fail                   | Re-upload karo            |

---

## 📊 Database Schema

### 🍃 MongoDB - OTP Collection

**Purpose:** Temporary OTP storage (configurable validity)

```
{
  _id: ObjectId,
  email: String or null,
  phone: String or null,
  otp: String,                    // "123456"
  expiresAt: Date,                // Current time + OTP_EXPIRY_MINUTES (default: 5)
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

- `email` (for fast lookup)
- `phone` (for fast lookup)
- `expiresAt` (TTL index for automatic deletion)

---

### 🗄️ SQL Database - Users Table

**Purpose:** Permanent user data storage

```
Column Name     | Type          | Description
----------------|---------------|----------------------------------
id              | INTEGER       | Primary key (auto-increment)
fullName        | VARCHAR(255)  | User's full name (nullable, filled via profile completion)
email           | VARCHAR(255)  | Unique email (nullable if phone signup)
phone           | VARCHAR(10)   | 10-digit phone number (nullable if email signup)
roles           | JSON          | Array: ["CUSTOMER"] or ["SELLER", "CUSTOMER"]
status          | ENUM          | ACTIVE, DISABLED, BLOCKED, SUSPENDED
profileImage    | TEXT          | Cloudinary secure_url
cart            | JSON          | Array of cart items
wishlist        | JSON          | Array of product IDs
addresses       | JSON          | Array of address objects
refreshToken    | TEXT          | For future token refresh feature (excluded from API responses)
deletedAt       | TIMESTAMP     | Soft delete timestamp (Sequelize paranoid mode)
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
  "profileImage": "https://res.cloudinary.com/example/john.jpg",
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
  "deletedAt": null,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-30T10:00:00.000Z"
}
```

**Indexes:**

- `email` (unique)
- `phone`
- `deletedAt` (for paranoid queries)

---

## 🔒 Security Features

### 1️⃣ OTP Security

```
Feature               | Implementation
----------------------|----------------------------------
Expiry Time           | OTP_EXPIRY_MINUTES env var (default: 5 min)
One-Time Use          | deleteMany (ALL OTPs for email/phone) after verification
Latest OTP Priority   | .sort({ createdAt: -1 }) — latest OTP wins
Length                | 6 digits (000000 to 999999)
Type                  | Numeric only
Storage               | MongoDB (temporary)
```

### 2️⃣ Token Security

```
Feature               | Implementation
----------------------|----------------------------------
Type                  | JWT (JSON Web Token)
Expiry                | 1 day (24 hours) via cookie maxAge
Storage               | HttpOnly Cookie (XSS protection)
Secure Flag           | true in production (HTTPS only)
SameSite              | strict (CSRF protection)
Payload               | user id, email/phone (whichever present), roles
```

### 3️⃣ Cookie Configuration

```
Property         | Value                      | Purpose
-----------------|----------------------------|---------------------------
httpOnly         | true                       | JavaScript se access nahi
secure           | true (production only)     | HTTPS-only transmission
sameSite         | strict                     | CSRF attack prevention
maxAge           | 86400000 ms (24 hours)     | Auto-expire after 1 day
```

### 4️⃣ Account Deletion Policy (Soft Delete)

```
Time Since Deletion  | Login Attempt Result
---------------------|------------------------------------------
< 24 hours           | ❌ Blocked — "restore after 24 hours"
24h – 30 days        | ✅ Auto-restored on successful OTP verify
> 30 days            | ❌ Blocked — "permanently deleted"
```

---

## 📝 Important Notes

### 🚨 Development vs Production

**Development:**

- ✅ OTP response me visible hai (testing ke liye)
- ✅ Console logs enabled
- ✅ Detailed error messages
- ⚠️ `secure` cookie flag: `false` (HTTP allowed)

**Production:**

- ❌ OTP response me nahi bhejana
- ✅ Email/SMS service integrate karo (TODO in code)
- ✅ Rate limiting add karo (OTP spam prevention)
- ✅ Proper logging setup
- ✅ HTTPS mandatory (`secure: true` auto-enabled via `NODE_ENV=production`)
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
Request OTP → OTP stored → User verifies → ALL OTPs for email/phone deleted ✅

Scenario 2: Multiple OTPs
Request OTP #1 (123456)
Request OTP #2 (789012) ← Latest
Verify with 789012 → ✅ Success (latest OTP via .sort createdAt: -1)
Verify with 123456 → ❌ Fails (older OTP, sort picks 789012 first)

Scenario 3: Already Used
Request OTP → Verify → ALL OTPs deleted via deleteMany
Try to verify again → ❌ "The verification code you entered is invalid."
```

---

## 🎯 Response Data Meaning

### isNewUser Flag

```
isNewUser = true
└─ Matlab: User pehli baar login kar raha hai
   └─ Frontend Action: Profile completion page par bhejo
      └─ User ko fullName, phone/email wagera fill karne do

isNewUser = false
└─ Matlab: User pehle se registered hai
   └─ Frontend Action: Seedha dashboard par bhejo
      └─ User ready to use app
```

### User Status Values

```
ACTIVE      → Normal user, full access
DISABLED    → Account temporarily disabled
BLOCKED     → Admin ne block kiya (policy violation)
SUSPENDED   → Temporary suspension (under review)
```

### User Roles

```
CUSTOMER    → Normal buyer
SELLER      → Can sell products (extra sellerProfile table)
ADMIN       → Full system access

Note: Ek user ke multiple roles ho sakte hain
Example: ["CUSTOMER", "SELLER"] - Buyer bhi, seller bhi
```

---

**🎉 Documentation Complete!**

Questions? Doubts? Team se discuss karo! 💬