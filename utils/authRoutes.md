🔐 AUTH ROUTES — /auth 1. Sign Up POST /auth/signup Auth Required: NO 
Request JSON: { "email": "user@example.com", "password": "securepassword123" } 
Response JSON: { "id": 1, "email": "user@example.com", "is_active": true, "created_at": "2025-01-01T12:00:00" } 

2. Login POST /auth/login Auth Required: NO 
Request JSON: { "email": "user@example.com", "password": "securepassword123" } 
Response JSON: { "access_token": "JWT_TOKEN_HERE", "token_type": "bearer" } 

3. Get Current User GET /auth/me Auth Required: YES (Bearer token) 
Response JSON: { "id": 1, "email": "user@example.com", "is_active": true, "created_at": "2025-01-01T12:00:00" } 

4. Test POST /auth/test Auth Required: NO 
Response JSON: { "msg": "Test endpoint is working!" } 

5. Request Password Reset POST /auth/request-password-reset Auth Required: NO 
Request JSON: { "email": "user@example.com" } 
Response JSON: { "msg": "If a user with that email exists, a password reset link has been sent." } 

6. Reset Password POST /auth/reset-password Auth Required: NO 
Request JSON: { "token": "RESET_TOKEN_HERE", "new_password": "newpassword123" } 
Response JSON: { "msg": "Password updated successfully" } 

7. Delete My Account DELETE /auth/me Auth Required: YES (Bearer token) 
Response JSON: { "detail": "Account deleted successfully" } 

8. Generate Upload URL (Supabase Signed URL) POST /auth/generate-upload-url Auth Required: YES (Bearer token) 
Response JSON: { "upload_url": "SIGNED_UPLOAD_URL_HERE", "path": "userId/uuid.mp4" } 

🎬 RUN ROUTES — /runs 1. Create Run Record POST /runs/ Auth Required: YES (Bearer token) 
Request JSON: { "video_path": "userId/uuid.mp4", "title": "My Run Title" } 
Response JSON: { "id": 12, "title": "My Run Title", "video_path": "userId/uuid.mp4", "created_at": "2025-01-01T12:00:00", "user_id": 1, "analysis_results": null } and for an example