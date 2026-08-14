# API Documentation

## 1. API Overview

* **Base URL:** `http://localhost:4500` (API routes prefix: `/api`)
* **API Version:** `Not specified` (Unversioned `/api` root)
* **Authentication Mechanism:** Cookie-based authentication using HTTP-only JSON Web Tokens (JWT).
  * Main user session token: `token` cookie (Expires in 1 day).
  * Password reset token: `otpToken` cookie (Expires in 10 minutes).
* **Content-Type:** 
  * `application/json` (Default for standard API requests)
  * `multipart/form-data` (For file upload endpoints such as `/api/resumes/upload` and `/api/users/avatar`)
* **Common Response Format:**
  * Success responses return standard JSON objects with HTTP status code `200` or `201`, accompanied by `{ "success": true, ... }` or descriptive message objects `{ "message": "..." }`.
  * Error responses return JSON containing `{ "message": "<error_message>" }` with appropriate status codes (`400`, `401`, `404`, `500`).

---

## 2. Authentication

### POST /api/auth/register

1. **Endpoint Name:** User Registration
2. **HTTP Method:** `POST`
3. **URL / Route:** `/api/auth/register`
4. **Description:** Registers a new user account with full name, email, and password. Passwords are hashed using bcrypt with a salt round of 10.
5. **Authentication:** 
   * Required: No
   * Headers: `Content-Type: application/json`
   * Cookies: None
6. **Request Parameters:**
   * Path parameters: None
   * Query parameters: None
   * Request body: JSON object containing user credentials
7. **Request Body Schema:**
   | Field Name | Data Type | Required/Optional | Description | Example Value |
   | --- | --- | --- | --- | --- |
   | `fullName` | String | Required | Full name of the user | `"John Doe"` |
   | `email` | String | Required | Unique user email address | `"john@example.com"` |
   | `password` | String | Required | User account password | `"securepassword123"` |
8. **Successful Response:**
   * HTTP Status Code: `201 Created`
   * Response JSON:
     ```json
     {
       "message": "User registered successfully"
     }
     ```
   * Explanation: Confirms that user has been created in the database.
9. **Error Responses:**
   * HTTP `400 Bad Request`:
     * Message: `"All fields are required"` — Reason: Missing `fullName`, `email`, or `password`.
     * Message: `"User already exists"` — Reason: Email address is already registered in database.
   * HTTP `500 Internal Server Error`:
     * Message: `"Error occurred while registering user"` — Reason: Database or internal processing error.
10. **Headers:** `Content-Type: application/json`
11. **Cookies:** None
12. **Example Request:**
    ```http
    POST /api/auth/register HTTP/1.1
    Host: localhost:4500
    Content-Type: application/json

    {
      "fullName": "John Doe",
      "email": "john@example.com",
      "password": "securepassword123"
    }
    ```
13. **Example Response:**
    ```http
    HTTP/1.1 201 Created
    Content-Type: application/json

    {
      "message": "User registered successfully"
    }
    ```

---

### POST /api/auth/login

1. **Endpoint Name:** User Login
2. **HTTP Method:** `POST`
3. **URL / Route:** `/api/auth/login`
4. **Description:** Authenticates user credentials. Upon validation, generates a signed JWT token containing user ID (`expiresIn: "1d"`) and sets an HTTP-only `token` cookie.
5. **Authentication:**
   * Required: No
   * Headers: `Content-Type: application/json`
   * Cookies: None
6. **Request Parameters:**
   * Path parameters: None
   * Query parameters: None
   * Request body: User login credentials
7. **Request Body Schema:**
   | Field Name | Data Type | Required/Optional | Description | Example Value |
   | --- | --- | --- | --- | --- |
   | `email` | String | Required | Registered user email | `"john@example.com"` |
   | `password` | String | Required | Account password | `"securepassword123"` |
8. **Successful Response:**
   * HTTP Status Code: `200 OK`
   * Response JSON:
     ```json
     {
       "message": "Login successful"
     }
     ```
   * Explanation: Authentication succeeded and session cookie set.
9. **Error Responses:**
   * HTTP `400 Bad Request`:
     * Message: `"Email and password are required"` — Reason: Missing email or password.
     * Message: `"Invalid credentials"` — Reason: User with given email does not exist.
     * Message: `"Invalid Password"` — Reason: Password verification failed.
   * HTTP `500 Internal Server Error`:
     * Message: `"Error occurred while logging in"` — Reason: Unexpected failure during execution.
10. **Headers:** `Content-Type: application/json`
11. **Cookies:** 
    * Set-Cookie Header on Success: `token=<jwt_token>; Max-Age=86400; Path=/; HttpOnly; SameSite=Lax`
12. **Example Request:**
    ```http
    POST /api/auth/login HTTP/1.1
    Host: localhost:4500
    Content-Type: application/json

    {
      "email": "john@example.com",
      "password": "securepassword123"
    }
    ```
13. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Set-Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Max-Age=86400; Path=/; HttpOnly; SameSite=Lax
    Content-Type: application/json

    {
      "message": "Login successful"
    }
    ```

---

### POST /api/auth/logout

1. **Endpoint Name:** User Logout
2. **HTTP Method:** `POST`
3. **URL / Route:** `/api/auth/logout`
4. **Description:** Logs out current user session by clearing the `token` cookie.
5. **Authentication:**
   * Required: No
   * Headers: None required
   * Cookies: `token` (Optional, cleared if present)
6. **Request Parameters:**
   * Path parameters: None
   * Query parameters: None
   * Request body: None
7. **Request Body Schema:** `Not specified` (No body required)
8. **Successful Response:**
   * HTTP Status Code: `200 OK`
   * Response JSON:
     ```json
     {
       "message": "Logout successful"
     }
     ```
   * Explanation: Cookie cleared successfully.
9. **Error Responses:** None generated directly.
10. **Headers:** None required
11. **Cookies:** Clears `token` cookie.
12. **Example Request:**
    ```http
    POST /api/auth/logout HTTP/1.1
    Host: localhost:4500
    ```
13. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Set-Cookie: token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT
    Content-Type: application/json

    {
      "message": "Logout successful"
    }
    ```

---

### POST /api/auth/send-otp

1. **Endpoint Name:** Send Password Reset OTP
2. **HTTP Method:** `POST`
3. **URL / Route:** `/api/auth/send-otp`
4. **Description:** Generates a random 6-digit OTP for password reset, saves/upserts it in `OTP` collection (expires in 10 minutes), and sends it via email using Nodemailer.
5. **Authentication:**
   * Required: No
   * Headers: `Content-Type: application/json`
   * Cookies: None
6. **Request Parameters:**
   * Path parameters: None
   * Query parameters: None
   * Request body: User email
7. **Request Body Schema:**
   | Field Name | Data Type | Required/Optional | Description | Example Value |
   | --- | --- | --- | --- | --- |
   | `email` | String | Required | User email address | `"john@example.com"` |
8. **Successful Response:**
   * HTTP Status Code: `200 OK`
   * Response JSON:
     ```json
     {
       "message": "OTP sent successfully"
     }
     ```
   * Explanation: OTP code generated and dispatched to the target email.
9. **Error Responses:**
   * HTTP `400 Bad Request`:
     * Message: `"Email is required"` — Reason: Request body missing `email`.
     * Message: `"User does not exist"` — Reason: User email not found in database.
   * HTTP `500 Internal Server Error`:
     * Message: `"Error occurred while setting OTP"` — Reason: Email sending failure or database error.
10. **Headers:** `Content-Type: application/json`
11. **Cookies:** None
12. **Example Request:**
    ```http
    POST /api/auth/send-otp HTTP/1.1
    Host: localhost:4500
    Content-Type: application/json

    {
      "email": "john@example.com"
    }
    ```
13. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "message": "OTP sent successfully"
    }
    ```

---

### POST /api/auth/verify-otp

1. **Endpoint Name:** Verify Password Reset OTP
2. **HTTP Method:** `POST`
3. **URL / Route:** `/api/auth/verify-otp`
4. **Description:** Validates submitted 6-digit OTP code against stored OTP. On success, deletes stored OTP record and sets an HTTP-only `otpToken` cookie (expires in 10 minutes).
5. **Authentication:**
   * Required: No
   * Headers: `Content-Type: application/json`
   * Cookies: None
6. **Request Parameters:**
   * Path parameters: None
   * Query parameters: None
   * Request body: Email and 6-digit OTP code
7. **Request Body Schema:**
   | Field Name | Data Type | Required/Optional | Description | Example Value |
   | --- | --- | --- | --- | --- |
   | `email` | String | Required | User email address | `"john@example.com"` |
   | `otp` | String | Required | 6-digit OTP code | `"492015"` |
8. **Successful Response:**
   * HTTP Status Code: `200 OK`
   * Response JSON:
     ```json
     {
       "message": "OTP verified successfully"
     }
     ```
   * Explanation: OTP verified; `otpToken` cookie issued for password reset authorization.
9. **Error Responses:**
   * HTTP `400 Bad Request`:
     * Message: `"Email and OTP are required"` — Reason: Missing `email` or `otp` field.
     * Message: `"OTP not found"` — Reason: No active OTP record exists for email.
     * Message: `"Invalid OTP"` — Reason: Provided OTP code does not match stored value.
   * HTTP `500 Internal Server Error`:
     * Message: `"Error occurred while verifying OTP"` — Reason: Server error during verification.
10. **Headers:** `Content-Type: application/json`
11. **Cookies:**
    * Set-Cookie Header on Success: `otpToken=<jwt_token>; Max-Age=600; Path=/; HttpOnly; SameSite=Lax`
12. **Example Request:**
    ```http
    POST /api/auth/verify-otp HTTP/1.1
    Host: localhost:4500
    Content-Type: application/json

    {
      "email": "john@example.com",
      "otp": "492015"
    }
    ```
13. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Set-Cookie: otpToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Max-Age=600; Path=/; HttpOnly; SameSite=Lax
    Content-Type: application/json

    {
      "message": "OTP verified successfully"
    }
    ```

---

### POST /api/auth/reset-password

1. **Endpoint Name:** Reset Password
2. **HTTP Method:** `POST`
3. **URL / Route:** `/api/auth/reset-password`
4. **Description:** Resets user password using authorization provided by `ValidateOTP` middleware (`otpToken` cookie). Updates user password in database and clears `otpToken` cookie.
5. **Authentication:**
   * Required: Yes (`ValidateOTP` middleware)
   * Headers: `Content-Type: application/json`
   * Cookies: `otpToken=<token>`
6. **Request Parameters:**
   * Path parameters: None
   * Query parameters: None
   * Request body: New password
7. **Request Body Schema:**
   | Field Name | Data Type | Required/Optional | Description | Example Value |
   | --- | --- | --- | --- | --- |
   | `password` | String | Required | New password string | `"newpassword123"` |
8. **Successful Response:**
   * HTTP Status Code: `200 OK`
   * Response JSON:
     ```json
     {
       "message": "Password reset successfully"
     }
     ```
   * Explanation: User password updated and temporary OTP token cookie cleared.
9. **Error Responses:**
   * HTTP `401 Unauthorized`:
     * Message: `"OTP Expired"` — Reason: Missing `otpToken` cookie.
     * Message: `"Invalid or expired OTP token"` — Reason: Invalid or expired JWT token in `otpToken` cookie.
   * HTTP `400 Bad Request`:
     * Message: `"Password is required"` — Reason: Missing password in body.
     * Message: `"User does not exist"` — Reason: Email extracted from token has no associated user.
   * HTTP `500 Internal Server Error`:
     * Message: `"Error occurred while resetting password"` — Reason: Database or hashing error.
10. **Headers:** `Content-Type: application/json`
11. **Cookies:**
    * Required Input Cookie: `otpToken=<token>`
    * Cleared Cookie on Success: `otpToken=`
12. **Example Request:**
    ```http
    POST /api/auth/reset-password HTTP/1.1
    Host: localhost:4500
    Content-Type: application/json
    Cookie: otpToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

    {
      "password": "newpassword123"
    }
    ```
13. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Set-Cookie: otpToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT
    Content-Type: application/json

    {
      "message": "Password reset successfully"
    }
    ```

---

## 3. Users

### GET /api/users/me

1. **Endpoint Name:** Get Current User Profile
2. **HTTP Method:** `GET`
3. **URL / Route:** `/api/users/me`
4. **Description:** Retrieves profile data of the currently authenticated user based on JWT `token` cookie (excluding password field).
5. **Authentication:**
   * Required: Yes (`IsAuthenticated` middleware)
   * Headers: None
   * Cookies: `token=<jwt_token>`
6. **Request Parameters:**
   * Path parameters: None
   * Query parameters: None
   * Request body: None
7. **Request Body Schema:** `Not specified`
8. **Successful Response:**
   * HTTP Status Code: `200 OK`
   * Response JSON:
     ```json
     {
       "success": true,
       "user": {
         "_id": "66bc8d5f1e8a9b2c3d4e5f6a",
         "fullName": "John Doe",
         "email": "john@example.com",
         "avatar": "https://res.cloudinary.com/demo/image/upload/v1234567890/ai_career_pro/avatars/john.jpg",
         "createdAt": "2026-08-14T10:00:00.000Z",
         "updatedAt": "2026-08-14T10:00:00.000Z"
       }
     }
     ```
9. **Error Responses:**
   * HTTP `401 Unauthorized`: `"Unauthorized"` / `"Invalid or expired token"`
   * HTTP `404 Not Found`: `"User not found"`
10. **Headers:** None
11. **Cookies:** `token=<jwt_token>`
12. **Example Request:**
    ```http
    GET /api/users/me HTTP/1.1
    Host: localhost:4500
    Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    ```
13. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "user": {
        "_id": "66bc8d5f1e8a9b2c3d4e5f6a",
        "fullName": "John Doe",
        "email": "john@example.com",
        "avatar": "https://res.cloudinary.com/...",
        "createdAt": "2026-08-14T10:00:00.000Z",
        "updatedAt": "2026-08-14T10:00:00.000Z"
      }
    }
    ```

---

### POST /api/users/avatar

1. **Endpoint Name:** Upload User Avatar Image
2. **HTTP Method:** `POST`
3. **URL / Route:** `/api/users/avatar`
4. **Description:** Uploads a user profile avatar image (JPEG/PNG/WEBP up to 5MB), applies face-detection cropping via Cloudinary, cleans up any old avatar in Cloudinary, and updates user avatar URL in database.
5. **Authentication:**
   * Required: Yes (`IsAuthenticated`, `uploadAvatar.single("avatar")`)
   * Headers: `Content-Type: multipart/form-data`
   * Cookies: `token=<jwt_token>`
6. **Request Parameters:**
   * Request body (Form Data): `avatar` file field
7. **Request Body Schema:**
   | Field Name | Data Type | Required/Optional | Description | Example Value |
   | --- | --- | --- | --- | --- |
   | `avatar` | File (Binary) | Required | Image file (JPEG, PNG, WEBP, GIF) up to 5MB | Binary File |
8. **Successful Response:**
   * HTTP Status Code: `200 OK`
   * Response JSON:
     ```json
     {
       "success": true,
       "message": "Profile image updated successfully",
       "avatar": "https://res.cloudinary.com/.../ai_career_pro/avatars/avatar_123.jpg",
       "user": {
         "_id": "66bc8d5f1e8a9b2c3d4e5f6a",
         "fullName": "John Doe",
         "email": "john@example.com",
         "avatar": "https://res.cloudinary.com/.../ai_career_pro/avatars/avatar_123.jpg"
       }
     }
     ```
9. **Error Responses:**
   * HTTP `401 Unauthorized`: `"Unauthorized"`
   * HTTP `400 Bad Request`: `"Avatar image file is required"` / `"Only image files (JPEG, PNG, WEBP, GIF) are allowed"`
   * HTTP `404 Not Found`: `"User not found"`
10. **Headers:** `Content-Type: multipart/form-data`
11. **Cookies:** `token=<jwt_token>`
12. **Example Request:**
    ```http
    POST /api/users/avatar HTTP/1.1
    Host: localhost:4500
    Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

    ------WebKitFormBoundary7MA4YWxkTrZu0gW
    Content-Disposition: form-data; name="avatar"; filename="profile.jpg"
    Content-Type: image/jpeg

    [Binary Content]
    ------WebKitFormBoundary7MA4YWxkTrZu0gW--
    ```
13. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "message": "Profile image updated successfully",
      "avatar": "https://res.cloudinary.com/...",
      "user": { ... }
    }
    ```

---

### DELETE /api/users/avatar

1. **Endpoint Name:** Delete User Avatar Image
2. **HTTP Method:** `DELETE`
3. **URL / Route:** `/api/users/avatar`
4. **Description:** Removes profile avatar image from Cloudinary and clears `avatar` and `avatarPublicId` fields on the user document.
5. **Authentication:**
   * Required: Yes (`IsAuthenticated`)
   * Cookies: `token=<jwt_token>`
6. **Request Parameters:** None
7. **Request Body Schema:** `Not specified`
8. **Successful Response:**
   * HTTP Status Code: `200 OK`
   * Response JSON:
     ```json
     {
       "success": true,
       "message": "Profile image removed successfully"
     }
     ```
9. **Error Responses:**
   * HTTP `401 Unauthorized`: `"Unauthorized"`
   * HTTP `404 Not Found`: `"User not found"`
10. **Headers:** None
11. **Cookies:** `token=<jwt_token>`
12. **Example Request:**
    ```http
    DELETE /api/users/avatar HTTP/1.1
    Host: localhost:4500
    Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    ```
13. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "message": "Profile image removed successfully"
    }
    ```

---

### PUT /api/users/profile

1. **Endpoint Name:** Update User Profile (Name/Email)
2. **HTTP Method:** `PUT`
3. **URL / Route:** `/api/users/profile`
4. **Description:** Updates candidate's full name (`fullName` / `username`) and/or email address. Requires current password verification for security.
5. **Authentication:**
   * Required: Yes (`IsAuthenticated`)
   * Headers: `Content-Type: application/json`
   * Cookies: `token=<jwt_token>`
6. **Request Parameters:** None
7. **Request Body Schema:**
   | Field Name | Data Type | Required/Optional | Description | Example Value |
   | --- | --- | --- | --- | --- |
   | `currentPassword` | String | Required | Current account password for confirmation | `"securepassword123"` |
   | `fullName` | String | Optional | Updated full name | `"John Smith"` |
   | `username` | String | Optional | Alternative alias for full name | `"John Smith"` |
   | `email` | String | Optional | Updated email address | `"john.smith@example.com"` |
8. **Successful Response:**
   * HTTP Status Code: `200 OK`
   * Response JSON:
     ```json
     {
       "success": true,
       "message": "Profile updated successfully",
       "user": {
         "_id": "66bc8d5f1e8a9b2c3d4e5f6a",
         "fullName": "John Smith",
         "email": "john.smith@example.com",
         "avatar": "https://res.cloudinary.com/...",
         "createdAt": "2026-08-14T10:00:00.000Z",
         "updatedAt": "2026-08-14T10:35:00.000Z"
       }
     }
     ```
9. **Error Responses:**
   * HTTP `401 Unauthorized`: `"Unauthorized"`
   * HTTP `400 Bad Request`:
     * Message: `"Current password is required to update profile"`
     * Message: `"Invalid current password"`
     * Message: `"Email is already registered to another account"`
10. **Headers:** `Content-Type: application/json`
11. **Cookies:** `token=<jwt_token>`
12. **Example Request:**
    ```http
    PUT /api/users/profile HTTP/1.1
    Host: localhost:4500
    Content-Type: application/json
    Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

    {
      "fullName": "John Smith",
      "email": "john.smith@example.com",
      "currentPassword": "securepassword123"
    }
    ```
13. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "message": "Profile updated successfully",
      "user": { ... }
    }
    ```

---

### POST /api/users/password/send-otp

1. **Endpoint Name:** Send Authenticated Password Change OTP
2. **HTTP Method:** `POST`
3. **URL / Route:** `/api/users/password/send-otp`
4. **Description:** Generates a 6-digit OTP code and dispatches it to the logged-in user's registered email address to authorize password modification.
5. **Authentication:**
   * Required: Yes (`IsAuthenticated`)
   * Cookies: `token=<jwt_token>`
6. **Request Parameters:** None
7. **Request Body Schema:** `Not specified`
8. **Successful Response:**
   * HTTP Status Code: `200 OK`
   * Response JSON:
     ```json
     {
       "success": true,
       "message": "OTP sent to your registered email address"
     }
     ```
9. **Error Responses:**
   * HTTP `401 Unauthorized`: `"Unauthorized"`
   * HTTP `404 Not Found`: `"User not found"`
10. **Headers:** None
11. **Cookies:** `token=<jwt_token>`
12. **Example Request:**
    ```http
    POST /api/users/password/send-otp HTTP/1.1
    Host: localhost:4500
    Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    ```
13. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "message": "OTP sent to your registered email address"
    }
    ```

---

### PUT /api/users/password

1. **Endpoint Name:** Change Password with OTP
2. **HTTP Method:** `PUT`
3. **URL / Route:** `/api/users/password`
4. **Description:** Verifies submitted 6-digit OTP sent to user's email and updates the user's account password.
5. **Authentication:**
   * Required: Yes (`IsAuthenticated`)
   * Headers: `Content-Type: application/json`
   * Cookies: `token=<jwt_token>`
6. **Request Parameters:** None
7. **Request Body Schema:**
   | Field Name | Data Type | Required/Optional | Description | Example Value |
   | --- | --- | --- | --- | --- |
   | `otp` | String | Required | 6-digit OTP code received via email | `"817294"` |
   | `newPassword` | String | Required | New password string (Min 6 characters) | `"newsecurepass123"` |
8. **Successful Response:**
   * HTTP Status Code: `200 OK`
   * Response JSON:
     ```json
     {
       "success": true,
       "message": "Password updated successfully"
     }
     ```
9. **Error Responses:**
   * HTTP `401 Unauthorized`: `"Unauthorized"`
   * HTTP `400 Bad Request`:
     * Message: `"OTP and new password are required"`
     * Message: `"Password must be at least 6 characters"`
     * Message: `"OTP expired or not found. Please request a new OTP"`
     * Message: `"Invalid OTP code"`
10. **Headers:** `Content-Type: application/json`
11. **Cookies:** `token=<jwt_token>`
12. **Example Request:**
    ```http
    PUT /api/users/password HTTP/1.1
    Host: localhost:4500
    Content-Type: application/json
    Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

    {
      "otp": "817294",
      "newPassword": "newsecurepass123"
    }
    ```
13. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "message": "Password updated successfully"
    }
    ```

---

## 4. Resumes

### POST /api/resumes/upload

1. **Endpoint Name:** Upload & Parse Resume
2. **HTTP Method:** `POST`
3. **URL / Route:** `/api/resumes/upload`
4. **Description:** Uploads a PDF or DOCX resume document (max 5MB), extracts raw text using `pdf-parse` or `mammoth`, stores file in Cloudinary, parses metadata with Gemini AI, and saves to database.
5. **Authentication:**
   * Required: Yes (`IsAuthenticated`, `uploadMiddleware.single("resume")`)
   * Headers: `Content-Type: multipart/form-data`
   * Cookies: `token=<jwt_token>`
6. **Request Parameters:** Request body form data `resume`
7. **Request Body Schema:**
   | Field Name | Data Type | Required/Optional | Description | Example Value |
   | --- | --- | --- | --- | --- |
   | `resume` | File (Binary) | Required | PDF or DOCX file up to 5MB | Binary File |
8. **Successful Response:**
   * HTTP Status Code: `201 Created`
   * Response JSON:
     ```json
     {
       "success": true,
       "message": "Resume uploaded and stored successfully",
       "resume": {
         "_id": "66bc8d5f1e8a9b2c3d4e5f6b",
         "userId": "66bc8d5f1e8a9b2c3d4e5f6a",
         "fileName": "John_Doe_Resume.pdf",
         "fileUrl": "https://res.cloudinary.com/dqnqki8s5/raw/upload/v1786716779/ai_career_pro/resumes/resume_66bc8d_123.pdf",
         "cloudinaryPublicId": "ai_career_pro/resumes/resume_66bc8d_123.pdf",
         "extractedText": "John Doe...",
         "parsedData": {
           "name": "John Doe",
           "email": "john@example.com",
           "skills": ["JavaScript", "React", "Node.js"]
         },
         "createdAt": "2026-08-14T10:10:00.000Z",
         "updatedAt": "2026-08-14T10:10:00.000Z"
       }
     }
     ```
9. **Error Responses:**
   * HTTP `401 Unauthorized`: `"Unauthorized"`
   * HTTP `400 Bad Request`: `"Resume file is required"` / `"Only PDF and DOCX files are supported"`
10. **Headers:** `Content-Type: multipart/form-data`
11. **Cookies:** `token=<jwt_token>`
12. **Example Request:**
    ```http
    POST /api/resumes/upload HTTP/1.1
    Host: localhost:4500
    Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

    [File Data]
    ```
13. **Example Response:**
    ```http
    HTTP/1.1 201 Created
    Content-Type: application/json

    {
      "success": true,
      "message": "Resume uploaded and stored successfully",
      "resume": { ... }
    }
    ```

---

### GET /api/resumes

1. **Endpoint Name:** Get All Resumes for User
2. **HTTP Method:** `GET`
3. **URL / Route:** `/api/resumes`
4. **Description:** Retrieves all resumes uploaded by the authenticated user, formatted with working Cloudinary URLs and sorted newest first.
5. **Authentication:**
   * Required: Yes (`IsAuthenticated`)
   * Cookies: `token=<jwt_token>`
6. **Request Parameters:** None
7. **Request Body Schema:** `Not specified`
8. **Successful Response:**
   * HTTP Status Code: `200 OK`
   * Response JSON:
     ```json
     {
       "success": true,
       "resumes": [
         {
           "_id": "66bc8d5f1e8a9b2c3d4e5f6b",
           "userId": "66bc8d5f1e8a9b2c3d4e5f6a",
           "fileName": "John_Doe_Resume.pdf",
           "fileUrl": "https://res.cloudinary.com/...",
           "extractedText": "...",
           "parsedData": { ... },
           "createdAt": "2026-08-14T10:10:00.000Z",
           "updatedAt": "2026-08-14T10:10:00.000Z"
         }
       ]
     }
     ```
9. **Error Responses:**
   * HTTP `401 Unauthorized`: `"Unauthorized"`
10. **Headers:** None
11. **Cookies:** `token=<jwt_token>`
12. **Example Request:**
    ```http
    GET /api/resumes HTTP/1.1
    Host: localhost:4500
    Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    ```
13. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "resumes": [ ... ]
    }
    ```

---

### GET /api/resumes/:resumeId

1. **Endpoint Name:** Get Resume Details by ID
2. **HTTP Method:** `GET`
3. **URL / Route:** `/api/resumes/:resumeId`
4. **Description:** Retrieves full details of a specific resume belonging to the logged-in user.
5. **Authentication:**
   * Required: Yes (`IsAuthenticated`)
   * Cookies: `token=<jwt_token>`
6. **Request Parameters:**
   * Path parameters: `resumeId` (MongoDB ObjectId)
7. **Request Body Schema:** `Not specified`
8. **Successful Response:**
   * HTTP Status Code: `200 OK`
   * Response JSON:
     ```json
     {
       "success": true,
       "resume": {
         "_id": "66bc8d5f1e8a9b2c3d4e5f6b",
         "userId": "66bc8d5f1e8a9b2c3d4e5f6a",
         "fileName": "John_Doe_Resume.pdf",
         "fileUrl": "https://res.cloudinary.com/...",
         "extractedText": "...",
         "parsedData": { ... },
         "createdAt": "2026-08-14T10:10:00.000Z",
         "updatedAt": "2026-08-14T10:10:00.000Z"
       }
     }
     ```
9. **Error Responses:**
   * HTTP `401 Unauthorized`: `"Unauthorized"`
   * HTTP `400 Bad Request`: `"Invalid ID"`
   * HTTP `404 Not Found`: `"Resume not found"`
10. **Headers:** None
11. **Cookies:** `token=<jwt_token>`
12. **Example Request:**
    ```http
    GET /api/resumes/66bc8d5f1e8a9b2c3d4e5f6b HTTP/1.1
    Host: localhost:4500
    Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    ```
13. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "resume": { ... }
    }
    ```

---

### DELETE /api/resumes/:resumeId

1. **Endpoint Name:** Delete Resume
2. **HTTP Method:** `DELETE`
3. **URL / Route:** `/api/resumes/:resumeId`
4. **Description:** Deletes a resume document from the database and removes its stored file asset from Cloudinary.
5. **Authentication:**
   * Required: Yes (`IsAuthenticated`)
   * Cookies: `token=<jwt_token>`
6. **Request Parameters:**
   * Path parameters: `resumeId` (MongoDB ObjectId)
7. **Request Body Schema:** `Not specified`
8. **Successful Response:**
   * HTTP Status Code: `200 OK`
   * Response JSON:
     ```json
     {
       "success": true,
       "message": "Resume deleted successfully",
       "resumeId": "66bc8d5f1e8a9b2c3d4e5f6b"
     }
     ```
9. **Error Responses:**
   * HTTP `401 Unauthorized`: `"Unauthorized"`
   * HTTP `404 Not Found`: `"Resume not found"`
10. **Headers:** None
11. **Cookies:** `token=<jwt_token>`
12. **Example Request:**
    ```http
    DELETE /api/resumes/66bc8d5f1e8a9b2c3d4e5f6b HTTP/1.1
    Host: localhost:4500
    Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    ```
13. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "message": "Resume deleted successfully",
      "resumeId": "66bc8d5f1e8a9b2c3d4e5f6b"
    }
    ```

---

## 5. Jobs

### POST /api/jobs

1. **Endpoint Name:** Create Job Description
2. **HTTP Method:** `POST`
3. **URL / Route:** `/api/jobs`
4. **Description:** Creates and saves a target job description for the authenticated user.
5. **Authentication:**
   * Required: Yes (`IsAuthenticated`)
   * Headers: `Content-Type: application/json`
   * Cookies: `token=<jwt_token>`
6. **Request Parameters:** None
7. **Request Body Schema:**
   | Field Name | Data Type | Required/Optional | Description | Example Value |
   | --- | --- | --- | --- | --- |
   | `title` | String | Required | Job title | `"Full Stack Engineer"` |
   | `description` | String | Required | Text of job description | `"Looking for a skilled developer..."` |
8. **Successful Response:**
   * HTTP Status Code: `201 Created`
   * Response JSON:
     ```json
     {
       "success": true,
       "message": "Job description saved",
       "job": {
         "_id": "66bc8d5f1e8a9b2c3d4e5f6c",
         "userId": "66bc8d5f1e8a9b2c3d4e5f6a",
         "title": "Full Stack Engineer",
         "description": "Looking for a skilled developer...",
         "createdAt": "2026-08-14T10:15:00.000Z",
         "updatedAt": "2026-08-14T10:15:00.000Z"
       }
     }
     ```
9. **Error Responses:**
   * HTTP `401 Unauthorized`: `"Unauthorized"`
   * HTTP `400 Bad Request`: `"Title and description are required"`
10. **Headers:** `Content-Type: application/json`
11. **Cookies:** `token=<jwt_token>`
12. **Example Request:**
    ```http
    POST /api/jobs HTTP/1.1
    Host: localhost:4500
    Content-Type: application/json
    Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

    {
      "title": "Full Stack Engineer",
      "description": "Looking for a skilled developer..."
    }
    ```
13. **Example Response:**
    ```http
    HTTP/1.1 201 Created
    Content-Type: application/json

    {
      "success": true,
      "message": "Job description saved",
      "job": { ... }
    }
    ```

---

### GET /api/jobs

1. **Endpoint Name:** Get All User Jobs
2. **HTTP Method:** `GET`
3. **URL / Route:** `/api/jobs`
4. **Description:** Retrieves all saved job descriptions for the authenticated user, ordered by creation date descending.
5. **Authentication:**
   * Required: Yes (`IsAuthenticated`)
   * Cookies: `token=<jwt_token>`
6. **Request Parameters:** None
7. **Request Body Schema:** `Not specified`
8. **Successful Response:**
   * HTTP Status Code: `200 OK`
   * Response JSON:
     ```json
     {
       "success": true,
       "jobs": [
         {
           "_id": "66bc8d5f1e8a9b2c3d4e5f6c",
           "userId": "66bc8d5f1e8a9b2c3d4e5f6a",
           "title": "Full Stack Engineer",
           "description": "Looking for a skilled developer...",
           "createdAt": "2026-08-14T10:15:00.000Z",
           "updatedAt": "2026-08-14T10:15:00.000Z"
         }
       ]
     }
     ```
9. **Error Responses:**
   * HTTP `401 Unauthorized`: `"Unauthorized"`
10. **Headers:** None
11. **Cookies:** `token=<jwt_token>`
12. **Example Request:**
    ```http
    GET /api/jobs HTTP/1.1
    Host: localhost:4500
    Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    ```
13. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "jobs": [ ... ]
    }
    ```

---

### GET /api/jobs/:jobId

1. **Endpoint Name:** Get Job Details by ID
2. **HTTP Method:** `GET`
3. **URL / Route:** `/api/jobs/:jobId`
4. **Description:** Fetches single job description owned by user.
5. **Authentication:**
   * Required: Yes (`IsAuthenticated`)
   * Cookies: `token=<jwt_token>`
6. **Request Parameters:** `jobId` (MongoDB ObjectId)
7. **Request Body Schema:** `Not specified`
8. **Successful Response:**
   * HTTP Status Code: `200 OK`
   * Response JSON:
     ```json
     {
       "success": true,
       "job": {
         "_id": "66bc8d5f1e8a9b2c3d4e5f6c",
         "userId": "66bc8d5f1e8a9b2c3d4e5f6a",
         "title": "Full Stack Engineer",
         "description": "...",
         "createdAt": "2026-08-14T10:15:00.000Z",
         "updatedAt": "2026-08-14T10:15:00.000Z"
       }
     }
     ```
9. **Error Responses:**
   * HTTP `401 Unauthorized`: `"Unauthorized"`
   * HTTP `404 Not Found`: `"Job not found"`
10. **Headers:** None
11. **Cookies:** `token=<jwt_token>`
12. **Example Request:**
    ```http
    GET /api/jobs/66bc8d5f1e8a9b2c3d4e5f6c HTTP/1.1
    Host: localhost:4500
    Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    ```
13. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "job": { ... }
    }
    ```

---

### PUT /api/jobs/:jobId

1. **Endpoint Name:** Update Job Description
2. **HTTP Method:** `PUT`
3. **URL / Route:** `/api/jobs/:jobId`
4. **Description:** Updates job title and/or description text for a specific saved job.
5. **Authentication:**
   * Required: Yes (`IsAuthenticated`)
   * Headers: `Content-Type: application/json`
   * Cookies: `token=<jwt_token>`
6. **Request Parameters:** `jobId` (MongoDB ObjectId)
7. **Request Body Schema:**
   | Field Name | Data Type | Required/Optional | Description | Example Value |
   | --- | --- | --- | --- | --- |
   | `title` | String | Optional | Updated job title | `"Senior Full Stack Engineer"` |
   | `description` | String | Optional | Updated job description text | `"Updated description text..."` |
8. **Successful Response:**
   * HTTP Status Code: `200 OK`
   * Response JSON:
     ```json
     {
       "success": true,
       "message": "Job updated successfully",
       "job": {
         "_id": "66bc8d5f1e8a9b2c3d4e5f6c",
         "title": "Senior Full Stack Engineer",
         "description": "Updated description text...",
         "createdAt": "2026-08-14T10:15:00.000Z",
         "updatedAt": "2026-08-14T10:40:00.000Z"
       }
     }
     ```
9. **Error Responses:**
   * HTTP `401 Unauthorized`: `"Unauthorized"`
   * HTTP `400 Bad Request`: `"At least title or description is required to update"`
   * HTTP `404 Not Found`: `"Job not found"`
10. **Headers:** `Content-Type: application/json`
11. **Cookies:** `token=<jwt_token>`
12. **Example Request:**
    ```http
    PUT /api/jobs/66bc8d5f1e8a9b2c3d4e5f6c HTTP/1.1
    Host: localhost:4500
    Content-Type: application/json
    Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

    {
      "title": "Senior Full Stack Engineer"
    }
    ```
13. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "message": "Job updated successfully",
      "job": { ... }
    }
    ```

---

### DELETE /api/jobs/:jobId

1. **Endpoint Name:** Delete Job Description
2. **HTTP Method:** `DELETE`
3. **URL / Route:** `/api/jobs/:jobId`
4. **Description:** Permanently deletes a saved job description.
5. **Authentication:**
   * Required: Yes (`IsAuthenticated`)
   * Cookies: `token=<jwt_token>`
6. **Request Parameters:** `jobId` (MongoDB ObjectId)
7. **Request Body Schema:** `Not specified`
8. **Successful Response:**
   * HTTP Status Code: `200 OK`
   * Response JSON:
     ```json
     {
       "success": true,
       "message": "Job deleted successfully",
       "jobId": "66bc8d5f1e8a9b2c3d4e5f6c"
     }
     ```
9. **Error Responses:**
   * HTTP `401 Unauthorized`: `"Unauthorized"`
   * HTTP `404 Not Found`: `"Job not found"`
10. **Headers:** None
11. **Cookies:** `token=<jwt_token>`
12. **Example Request:**
    ```http
    DELETE /api/jobs/66bc8d5f1e8a9b2c3d4e5f6c HTTP/1.1
    Host: localhost:4500
    Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    ```
13. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "message": "Job deleted successfully",
      "jobId": "66bc8d5f1e8a9b2c3d4e5f6c"
    }
    ```

---

## 6. Analysis

### POST /api/analysis

1. **Endpoint Name:** Analyze Resume Against Job
2. **HTTP Method:** `POST`
3. **URL / Route:** `/api/analysis`
4. **Description:** Performs AI-powered analysis (`analyzeWithAI`) comparing a user's resume extracted text against a target job description. Computes match score, matched skills, missing skills, improvement suggestions, and summary.
5. **Authentication:**
   * Required: Yes (`IsAuthenticated`)
   * Headers: `Content-Type: application/json`
   * Cookies: `token=<jwt_token>`
6. **Request Parameters:** None
7. **Request Body Schema:**
   | Field Name | Data Type | Required/Optional | Description | Example Value |
   | --- | --- | --- | --- | --- |
   | `resumeId` | String | Required | MongoDB ObjectId of target resume | `"66bc8d5f1e8a9b2c3d4e5f6b"` |
   | `jobId` | String | Required | MongoDB ObjectId of target job | `"66bc8d5f1e8a9b2c3d4e5f6c"` |
8. **Successful Response:**
   * HTTP Status Code: `201 Created`
   * Response JSON:
     ```json
     {
       "success": true,
       "analysis": {
         "_id": "66bc8d5f1e8a9b2c3d4e5f6d",
         "userId": "66bc8d5f1e8a9b2c3d4e5f6a",
         "resumeId": "66bc8d5f1e8a9b2c3d4e5f6b",
         "jobId": "66bc8d5f1e8a9b2c3d4e5f6c",
         "matchScore": 85,
         "matchedSkills": ["JavaScript", "React", "Node.js"],
         "missingSkills": ["Docker", "GraphQL"],
         "suggestions": [
           "Add experience with containerization using Docker.",
           "Highlight GraphQL API integrations if applicable."
         ],
         "summary": "Strong candidate with solid core web technologies alignment.",
         "createdAt": "2026-08-14T10:20:00.000Z",
         "updatedAt": "2026-08-14T10:20:00.000Z"
       }
     }
     ```
9. **Error Responses:**
   * HTTP `401 Unauthorized`: `"Unauthorized"`
   * HTTP `400 Bad Request`: `"Resume ID and Job ID are required"`
   * HTTP `404 Not Found`: `"Resume not found"` / `"Job description not found"`
10. **Headers:** `Content-Type: application/json`
11. **Cookies:** `token=<jwt_token>`
12. **Example Request:**
    ```http
    POST /api/analysis HTTP/1.1
    Host: localhost:4500
    Content-Type: application/json
    Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

    {
      "resumeId": "66bc8d5f1e8a9b2c3d4e5f6b",
      "jobId": "66bc8d5f1e8a9b2c3d4e5f6c"
    }
    ```
13. **Example Response:**
    ```http
    HTTP/1.1 201 Created
    Content-Type: application/json

    {
      "success": true,
      "analysis": { ... }
    }
    ```

---

### GET /api/analysis

1. **Endpoint Name:** Get User Analyses List
2. **HTTP Method:** `GET`
3. **URL / Route:** `/api/analysis`
4. **Description:** Retrieves all analysis records for user, populating `resumeId` (`fileName`) and `jobId` (`title`), sorted newest first.
5. **Authentication:**
   * Required: Yes (`IsAuthenticated`)
   * Cookies: `token=<jwt_token>`
6. **Request Parameters:** None
7. **Request Body Schema:** `Not specified`
8. **Successful Response:**
   * HTTP Status Code: `200 OK`
   * Response JSON:
     ```json
     {
       "success": true,
       "analyses": [
         {
           "_id": "66bc8d5f1e8a9b2c3d4e5f6d",
           "userId": "66bc8d5f1e8a9b2c3d4e5f6a",
           "resumeId": {
             "_id": "66bc8d5f1e8a9b2c3d4e5f6b",
             "fileName": "John_Doe_Resume.pdf"
           },
           "jobId": {
             "_id": "66bc8d5f1e8a9b2c3d4e5f6c",
             "title": "Full Stack Engineer"
           },
           "matchScore": 85,
           "matchedSkills": ["JavaScript", "React"],
           "missingSkills": ["Docker"],
           "suggestions": ["..."],
           "summary": "...",
           "createdAt": "2026-08-14T10:20:00.000Z",
           "updatedAt": "2026-08-14T10:20:00.000Z"
         }
       ]
     }
     ```
9. **Error Responses:**
   * HTTP `401 Unauthorized`: `"Unauthorized"`
10. **Headers:** None
11. **Cookies:** `token=<jwt_token>`
12. **Example Request:**
    ```http
    GET /api/analysis HTTP/1.1
    Host: localhost:4500
    Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    ```
13. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "analyses": [ ... ]
    }
    ```

---

### GET /api/analysis/:analysisId

1. **Endpoint Name:** Get Analysis Details by ID
2. **HTTP Method:** `GET`
3. **URL / Route:** `/api/analysis/:analysisId`
4. **Description:** Retrieves a single analysis document, fully populating associated `resumeId` and `jobId` documents.
5. **Authentication:**
   * Required: Yes (`IsAuthenticated`)
   * Cookies: `token=<jwt_token>`
6. **Request Parameters:** `analysisId` (MongoDB ObjectId)
7. **Request Body Schema:** `Not specified`
8. **Successful Response:**
   * HTTP Status Code: `200 OK`
   * Response JSON:
     ```json
     {
       "success": true,
       "analysis": {
         "_id": "66bc8d5f1e8a9b2c3d4e5f6d",
         "userId": "66bc8d5f1e8a9b2c3d4e5f6a",
         "resumeId": { ... },
         "jobId": { ... },
         "matchScore": 85,
         "matchedSkills": ["..."],
         "missingSkills": ["..."],
         "suggestions": ["..."],
         "summary": "...",
         "createdAt": "2026-08-14T10:20:00.000Z",
         "updatedAt": "2026-08-14T10:20:00.000Z"
       }
     }
     ```
9. **Error Responses:**
   * HTTP `401 Unauthorized`: `"Unauthorized"`
   * HTTP `400 Bad Request`: `"Invalid ID"`
   * HTTP `404 Not Found`: `"Analysis not found"`
10. **Headers:** None
11. **Cookies:** `token=<jwt_token>`
12. **Example Request:**
    ```http
    GET /api/analysis/66bc8d5f1e8a9b2c3d4e5f6d HTTP/1.1
    Host: localhost:4500
    Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    ```
13. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "analysis": { ... }
    }
    ```

---

## 7. Interviews

### POST /api/interviews/start

1. **Endpoint Name:** Start Mock Interview Session
2. **HTTP Method:** `POST`
3. **URL / Route:** `/api/interviews/start`
4. **Description:** Uses Google Gemini AI (`generateInterviewQuestions`) to generate tailored technical and behavioral interview questions based on candidate's resume and job description. Initializes interview with status `in-progress`.
5. **Authentication:**
   * Required: Yes (`IsAuthenticated`)
   * Headers: `Content-Type: application/json`
   * Cookies: `token=<jwt_token>`
6. **Request Parameters:** None
7. **Request Body Schema:**
   | Field Name | Data Type | Required/Optional | Description | Example Value |
   | --- | --- | --- | --- | --- |
   | `resumeId` | String | Required | MongoDB ObjectId of resume | `"66bc8d5f1e8a9b2c3d4e5f6b"` |
   | `jobId` | String | Required | MongoDB ObjectId of job | `"66bc8d5f1e8a9b2c3d4e5f6c"` |
8. **Successful Response:**
   * HTTP Status Code: `201 Created`
   * Response JSON:
     ```json
     {
       "success": true,
       "interview": {
         "_id": "66bc8d5f1e8a9b2c3d4e5f6e",
         "userId": "66bc8d5f1e8a9b2c3d4e5f6a",
         "resumeId": "66bc8d5f1e8a9b2c3d4e5f6b",
         "jobId": "66bc8d5f1e8a9b2c3d4e5f6c",
         "questions": [
           {
             "question": "Can you explain how you handled state management in your recent React application?",
             "type": "technical",
             "answer": "",
             "feedback": "",
             "_id": "66bc8d5f1e8a9b2c3d4e5f6f"
           }
         ],
         "status": "in-progress",
         "summary": "",
         "createdAt": "2026-08-14T10:25:00.000Z",
         "updatedAt": "2026-08-14T10:25:00.000Z"
       }
     }
     ```
9. **Error Responses:**
   * HTTP `401 Unauthorized`: `"Unauthorized"`
   * HTTP `400 Bad Request`: `"Resume ID and Job ID are required"`
   * HTTP `404 Not Found`: `"Resume not found"` / `"Job not found"`
10. **Headers:** `Content-Type: application/json`
11. **Cookies:** `token=<jwt_token>`
12. **Example Request:**
    ```http
    POST /api/interviews/start HTTP/1.1
    Host: localhost:4500
    Content-Type: application/json
    Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

    {
      "resumeId": "66bc8d5f1e8a9b2c3d4e5f6b",
      "jobId": "66bc8d5f1e8a9b2c3d4e5f6c"
    }
    ```
13. **Example Response:**
    ```http
    HTTP/1.1 201 Created
    Content-Type: application/json

    {
      "success": true,
      "interview": { ... }
    }
    ```

---

### POST /api/interviews/:interviewId/answer

1. **Endpoint Name:** Submit Interview Answer
2. **HTTP Method:** `POST`
3. **URL / Route:** `/api/interviews/:interviewId/answer`
4. **Description:** Evaluates a submitted answer for a specific question index using AI (`evaluateAnswer`), updating score (0-100), feedback text, and answer content.
5. **Authentication:**
   * Required: Yes (`IsAuthenticated`)
   * Headers: `Content-Type: application/json`
   * Cookies: `token=<jwt_token>`
6. **Request Parameters:** `interviewId` (MongoDB ObjectId)
7. **Request Body Schema:**
   | Field Name | Data Type | Required/Optional | Description | Example Value |
   | --- | --- | --- | --- | --- |
   | `questionIndex` | Number | Required | Zero-based index of question array | `0` |
   | `answer` | String | Required | Candidate's answer text | `"I used Redux Toolkit for central state..."` |
8. **Successful Response:**
   * HTTP Status Code: `200 OK`
   * Response JSON:
     ```json
     {
       "success": true,
       "question": {
         "question": "Can you explain how you handled state management in your recent React application?",
         "type": "technical",
         "answer": "I used Redux Toolkit for central state...",
         "score": 90,
         "feedback": "Excellent explanation of state normalization and slice structure.",
         "_id": "66bc8d5f1e8a9b2c3d4e5f6f"
       }
     }
     ```
9. **Error Responses:**
   * HTTP `401 Unauthorized`: `"Unauthorized"`
   * HTTP `400 Bad Request`: `"Question index and answer are required"`
   * HTTP `404 Not Found`: `"Interview not found"` / `"Question not found"`
10. **Headers:** `Content-Type: application/json`
11. **Cookies:** `token=<jwt_token>`
12. **Example Request:**
    ```http
    POST /api/interviews/66bc8d5f1e8a9b2c3d4e5f6e/answer HTTP/1.1
    Host: localhost:4500
    Content-Type: application/json
    Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

    {
      "questionIndex": 0,
      "answer": "I used Redux Toolkit for central state..."
    }
    ```
13. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "question": { ... }
    }
    ```

---

### POST /api/interviews/:interviewId/complete

1. **Endpoint Name:** Complete Mock Interview Session
2. **HTTP Method:** `POST`
3. **URL / Route:** `/api/interviews/:interviewId/complete`
4. **Description:** Verifies that all questions in session are answered. Generates overall performance score and summary using AI (`generateInterviewSummary`), and updates status to `completed`.
5. **Authentication:**
   * Required: Yes (`IsAuthenticated`)
   * Cookies: `token=<jwt_token>`
6. **Request Parameters:** `interviewId` (MongoDB ObjectId)
7. **Request Body Schema:** `Not specified`
8. **Successful Response:**
   * HTTP Status Code: `200 OK`
   * Response JSON:
     ```json
     {
       "success": true,
       "interview": {
         "_id": "66bc8d5f1e8a9b2c3d4e5f6e",
         "userId": "66bc8d5f1e8a9b2c3d4e5f6a",
         "resumeId": "66bc8d5f1e8a9b2c3d4e5f6b",
         "jobId": "66bc8d5f1e8a9b2c3d4e5f6c",
         "questions": [ ... ],
         "overallScore": 88,
         "summary": "Overall strong technical competence demonstrated with clear articulation.",
         "status": "completed",
         "createdAt": "2026-08-14T10:25:00.000Z",
         "updatedAt": "2026-08-14T10:30:00.000Z"
       }
     }
     ```
9. **Error Responses:**
   * HTTP `401 Unauthorized`: `"Unauthorized"`
   * HTTP `400 Bad Request`: `"Please answer all questions before completing the interview"`
   * HTTP `404 Not Found`: `"Interview not found"`
10. **Headers:** None
11. **Cookies:** `token=<jwt_token>`
12. **Example Request:**
    ```http
    POST /api/interviews/66bc8d5f1e8a9b2c3d4e5f6e/complete HTTP/1.1
    Host: localhost:4500
    Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    ```
13. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "interview": { ... }
    }
    ```

---

### GET /api/interviews

1. **Endpoint Name:** Get All User Interview Sessions
2. **HTTP Method:** `GET`
3. **URL / Route:** `/api/interviews`
4. **Description:** Retrieves all interview sessions for user, populating `resumeId` (`fileName`) and `jobId` (`title`), sorted by creation date descending.
5. **Authentication:**
   * Required: Yes (`IsAuthenticated`)
   * Cookies: `token=<jwt_token>`
6. **Request Parameters:** None
7. **Request Body Schema:** `Not specified`
8. **Successful Response:**
   * HTTP Status Code: `200 OK`
   * Response JSON:
     ```json
     {
       "success": true,
       "interviews": [
         {
           "_id": "66bc8d5f1e8a9b2c3d4e5f6e",
           "userId": "66bc8d5f1e8a9b2c3d4e5f6a",
           "resumeId": {
             "_id": "66bc8d5f1e8a9b2c3d4e5f6b",
             "fileName": "John_Doe_Resume.pdf"
           },
           "jobId": {
             "_id": "66bc8d5f1e8a9b2c3d4e5f6c",
             "title": "Full Stack Engineer"
           },
           "status": "completed",
           "overallScore": 88,
           "createdAt": "2026-08-14T10:25:00.000Z",
           "updatedAt": "2026-08-14T10:30:00.000Z"
         }
       ]
     }
     ```
9. **Error Responses:**
   * HTTP `401 Unauthorized`: `"Unauthorized"`
10. **Headers:** None
11. **Cookies:** `token=<jwt_token>`
12. **Example Request:**
    ```http
    GET /api/interviews HTTP/1.1
    Host: localhost:4500
    Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    ```
13. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "interviews": [ ... ]
    }
    ```

---

### GET /api/interviews/:interviewId

1. **Endpoint Name:** Get Interview Details by ID
2. **HTTP Method:** `GET`
3. **URL / Route:** `/api/interviews/:interviewId`
4. **Description:** Retrieves full details of a specific interview session, fully populating associated `resumeId` and `jobId` objects.
5. **Authentication:**
   * Required: Yes (`IsAuthenticated`)
   * Cookies: `token=<jwt_token>`
6. **Request Parameters:** `interviewId` (MongoDB ObjectId)
7. **Request Body Schema:** `Not specified`
8. **Successful Response:**
   * HTTP Status Code: `200 OK`
   * Response JSON:
     ```json
     {
       "success": true,
       "interview": {
         "_id": "66bc8d5f1e8a9b2c3d4e5f6e",
         "userId": "66bc8d5f1e8a9b2c3d4e5f6a",
         "resumeId": { ... },
         "jobId": { ... },
         "questions": [ ... ],
         "overallScore": 88,
         "summary": "...",
         "status": "completed",
         "createdAt": "2026-08-14T10:25:00.000Z",
         "updatedAt": "2026-08-14T10:30:00.000Z"
       }
     }
     ```
9. **Error Responses:**
   * HTTP `401 Unauthorized`: `"Unauthorized"`
   * HTTP `400 Bad Request`: `"Invalid ID"`
   * HTTP `404 Not Found`: `"Interview not found"`
10. **Headers:** None
11. **Cookies:** `token=<jwt_token>`
12. **Example Request:**
    ```http
    GET /api/interviews/66bc8d5f1e8a9b2c3d4e5f6e HTTP/1.1
    Host: localhost:4500
    Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    ```
13. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "interview": { ... }
    }
    ```

---

## 8. Dashboard

### GET /api/dashboard

1. **Endpoint Name:** Get Dashboard Summary Data
2. **HTTP Method:** `GET`
3. **URL / Route:** `/api/dashboard`
4. **Description:** Fetches all resumes, analysis records (populated with `resumeId` `fileName` & `jobId` `title`), and interview sessions (populated with `resumeId` `fileName` & `jobId` `title`) for the authenticated user using `Promise.all` parallel execution.
5. **Authentication:**
   * Required: Yes (`IsAuthenticated`)
   * Cookies: `token=<jwt_token>`
6. **Request Parameters:** None
7. **Request Body Schema:** `Not specified`
8. **Successful Response:**
   * HTTP Status Code: `200 OK`
   * Response JSON:
     ```json
     {
       "success": true,
       "resumes": [ ... ],
       "analyses": [ ... ],
       "interviews": [ ... ]
     }
     ```
9. **Error Responses:**
   * HTTP `401 Unauthorized`: `"Unauthorized"` / `"Invalid or expired token"`
10. **Headers:** None
11. **Cookies:** `token=<jwt_token>`
12. **Example Request:**
    ```http
    GET /api/dashboard HTTP/1.1
    Host: localhost:4500
    Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    ```
13. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "resumes": [ ... ],
      "analyses": [ ... ],
      "interviews": [ ... ]
    }
    ```

---

## 9. Error Handling

The application handles errors using central Express error-handling middleware (`index.js`).

### Common Error Responses

1. **Multer File Error:**
   * Status Code: `400 Bad Request`
   * Format:
     ```json
     {
       "message": "File too large"
     }
     ```
2. **MongoDB Invalid ObjectId Cast Error (`CastError`):**
   * Status Code: `400 Bad Request`
   * Format:
     ```json
     {
       "message": "Invalid ID"
     }
     ```
3. **Application operational error (`AppError`):**
   * Status Code: Custom (`400`, `401`, `404`, `500`)
   * Format:
     ```json
     {
       "message": "Specific error description"
     }
     ```
4. **Unhandled Server Error:**
   * Status Code: `500 Internal Server Error`
   * Format:
     ```json
     {
       "message": "Internal Server Error"
     }
     ```

---

## 10. Endpoint Summary

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `GET` | `/` | None | Root health check endpoint |
| `POST` | `/api/auth/register` | None | Register new user account |
| `POST` | `/api/auth/login` | None | Authenticate user and issue JWT cookie (`token`) |
| `POST` | `/api/auth/logout` | None | Clear user authentication cookie (`token`) |
| `POST` | `/api/auth/send-otp` | None | Generate & email password reset OTP |
| `POST` | `/api/auth/verify-otp` | None | Verify OTP & issue password reset token (`otpToken`) |
| `POST` | `/api/auth/reset-password` | Required (`ValidateOTP`) | Update user password using reset token |
| `GET` | `/api/users/me` | Required (`IsAuthenticated`) | Retrieve current user profile |
| `POST` | `/api/users/avatar` | Required (`IsAuthenticated`) | Upload user profile avatar image to Cloudinary |
| `DELETE` | `/api/users/avatar` | Required (`IsAuthenticated`) | Remove user profile avatar image |
| `PUT` | `/api/users/profile` | Required (`IsAuthenticated`) | Update full name and/or email address |
| `POST` | `/api/users/password/send-otp` | Required (`IsAuthenticated`) | Send password change OTP to user email |
| `PUT` | `/api/users/password` | Required (`IsAuthenticated`) | Verify OTP & update password |
| `POST` | `/api/resumes/upload` | Required (`IsAuthenticated`) | Upload PDF/DOCX resume & parse structure via AI |
| `GET` | `/api/resumes` | Required (`IsAuthenticated`) | Get list of user's uploaded resumes |
| `GET` | `/api/resumes/:resumeId` | Required (`IsAuthenticated`) | Get specific resume details by ID |
| `DELETE` | `/api/resumes/:resumeId` | Required (`IsAuthenticated`) | Delete resume and clean up Cloudinary storage |
| `POST` | `/api/jobs` | Required (`IsAuthenticated`) | Create and save target job description |
| `GET` | `/api/jobs` | Required (`IsAuthenticated`) | Get list of user's saved job descriptions |
| `GET` | `/api/jobs/:jobId` | Required (`IsAuthenticated`) | Get specific job description details by ID |
| `PUT` | `/api/jobs/:jobId` | Required (`IsAuthenticated`) | Update job description title/text |
| `DELETE` | `/api/jobs/:jobId` | Required (`IsAuthenticated`) | Delete saved job description |
| `POST` | `/api/analysis` | Required (`IsAuthenticated`) | Compare resume & job using AI match score engine |
| `GET` | `/api/analysis` | Required (`IsAuthenticated`) | Get list of user's resume analysis results |
| `GET` | `/api/analysis/:analysisId` | Required (`IsAuthenticated`) | Get specific analysis details by ID |
| `POST` | `/api/interviews/start` | Required (`IsAuthenticated`) | Generate AI interview questions for resume & job |
| `POST` | `/api/interviews/:interviewId/answer` | Required (`IsAuthenticated`) | Submit answer to question & get AI score/feedback |
| `POST` | `/api/interviews/:interviewId/complete` | Required (`IsAuthenticated`) | Complete session & generate AI overall evaluation |
| `GET` | `/api/interviews` | Required (`IsAuthenticated`) | Get list of user's interview sessions |
| `GET` | `/api/interviews/:interviewId` | Required (`IsAuthenticated`) | Get specific interview details by ID |
| `GET` | `/api/dashboard` | Required (`IsAuthenticated`) | Get aggregated dashboard metrics (resumes, analyses, interviews) |
