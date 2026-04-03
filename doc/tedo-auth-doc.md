# Tedo Authentication Architecture (FE ↔ Keycloak ↔ BE)

## 1. Overview
Hệ thống sử dụng Keycloak (OIDC - Authorization Code Flow + PKCE) để xác thực người dùng.

- Frontend xử lý login qua Keycloak
- Backend chỉ verify JWT và xử lý nghiệp vụ
- Không có API login trong backend

---

## 2. Architecture

| Component | URL (example) | Responsibility |
|----------|--------------|---------------|
| Frontend | https://tedo.vn | UI + gọi API |
| Keycloak | https://keycloak.dev.tedo.vn | Authentication |
| Backend API | https://api.tedo.vn/api | Verify JWT |

---

## 3. Authentication Flow

1. User mở FE: https://tedo.vn
2. FE gọi keycloak.init()
3. Redirect sang Keycloak nếu chưa login
4. Login xong → redirect về FE (?code=...)
5. FE đổi code → token
6. FE gọi API với Bearer token
7. Backend verify token

---

## 4. Frontend Config

.env.local / .env.production

VITE_KEYCLOAK_URL=https://keycloak.dev.tedo.vn  
VITE_KEYCLOAK_REALM=tedo  
VITE_KEYCLOAK_CLIENT_ID=tedo-frontend  
VITE_API_BASE_URL=https://api.tedo.vn/api  

Init:

await keycloak.init({
  onLoad: 'login-required',
  pkceMethod: 'S256',
  redirectUri: window.location.origin,
});

Call API:

fetch('/api', {
  headers: {
    Authorization: `Bearer ${token}`
  }
})

---

## 5. Keycloak Config

Valid redirect URIs:
- http://localhost:3000/*
- https://tedo.vn/*

Web origins:
- http://localhost:3000
- https://tedo.vn

Client:
- Public
- PKCE S256
- Standard flow ON

---

## 6. Backend

Không có login API

Verify:
- issuer
- signature
- expiration
- audience

Env:

KEYCLOAK_ISSUER_URL=https://keycloak.dev.tedo.vn/realms/tedo  
KEYCLOAK_AUDIENCE=tedo-api,account  

---

## 7. CORS

Allow:
- http://localhost:3000
- https://tedo.vn

Headers:
- Authorization
- Content-Type

---

## 8. Summary

Luồng local và production giống nhau.
Chỉ khác domain + CORS + Keycloak redirect.
