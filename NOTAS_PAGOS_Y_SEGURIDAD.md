# Notas de Implementacion - Pagos y Seguridad (Fase Final)

## Objetivo
Implementar pagos reales y seguros en Pymeweb con:
- Metodos de pago funcionales (incluyendo PayPal)
- Cuenta receptora por tienda (donde llega el dinero)
- Metodo de pago configurable en perfil
- Verificacion de cuenta con Google (check de verificado)
- Cambio de contrasena con verificacion por correo

---

## Fase 1 - Base segura de datos y arquitectura

### 1.1 Modelos nuevos (backend)
1. Crear `StorePayoutAccount` en `apps/payments/models.py`:
- `store` (FK a tienda)
- `provider` (`paypal`, `stripe`, `bank_transfer`)
- `account_email` (para PayPal)
- `account_holder_name`
- `bank_name`, `account_number_last4`, `account_type` (si aplica)
- `is_verified` (bool)
- `verification_status` (`pending`, `verified`, `rejected`)
- `encrypted_payload` (campo cifrado para datos sensibles)
- `created_at`, `updated_at`

2. Crear `UserPaymentMethod` en `apps/payments/models.py`:
- `user` (FK)
- `provider` (`paypal`, `card_tokenized`)
- `label` (ej: "PayPal personal")
- `token_reference` (nunca guardar PAN completo)
- `is_default`
- `is_active`

3. Extender `Payment` para trazabilidad:
- `provider` (webpay/paypal/stripe)
- `provider_payment_id`
- `idempotency_key`
- `risk_status`
- `captured_at`

### 1.2 Seguridad de datos
1. No guardar secretos en DB en texto plano.
2. Cifrar datos sensibles con `Fernet` o campo cifrado.
3. Mover llaves API a variables de entorno (`.env`) y nunca al repo.
4. Implementar permisos estrictos por rol para editar cuenta receptora de tienda.

---

## Fase 2 - Cuenta receptora por tienda (donde llega el dinero)

### 2.1 API de configuracion para tienda
1. Crear endpoints en `apps/payments/urls.py` y `views.py`:
- `GET /api/payments/store-payout/me/` (ver configuracion actual)
- `POST /api/payments/store-payout/me/` (crear)
- `PATCH /api/payments/store-payout/me/` (actualizar)
- `POST /api/payments/store-payout/me/verify/` (iniciar verificacion)

2. Validaciones:
- Solo owner/admin/manager de la tienda puede editar.
- Validar formato email PayPal.
- Enmascarar campos sensibles en respuestas.

### 2.2 UI en panel de tienda
1. Crear seccion en admin de tienda: `Configuracion de cobros`.
2. Formulario por proveedor:
- PayPal: correo receptor
- Transferencia: banco/tipo/alias (sin exponer datos completos)
3. Mostrar estado visual: `Pendiente`, `Verificada`, `Rechazada`.
4. Bloquear recepcion de pagos si la cuenta receptora no esta verificada.

---

## Fase 3 - Metodos de pago reales

### 3.1 PayPal (recomendado iniciar aqui)
1. Integrar SDK servidor PayPal (Orders API).
2. Flujo seguro:
- Front crea orden PayPal
- Usuario aprueba en PayPal
- Backend confirma (`capture`) via API PayPal
- Backend actualiza `Payment.status=paid`

3. Webhooks PayPal:
- Validar firma del webhook
- Procesar eventos `PAYMENT.CAPTURE.COMPLETED` y `DENIED`
- Idempotencia por `event_id`

### 3.2 Webpay (ya existente)
1. Completar commit real en retorno `webpay_return`.
2. Persistir transaccion en `Payment`.
3. Verificar monto/orden/estado antes de marcar pago como aprobado.

### 3.3 Regla de distribucion de dinero
1. Al confirmar pago, asociar pago a tienda(s) y su `StorePayoutAccount`.
2. Generar `PayoutRecord` (nuevo modelo) para registrar monto neto/comision.
3. Estado de payout: `pending`, `scheduled`, `paid`, `failed`.

---

## Fase 4 - Metodo de pago en perfil (usuario)

### 4.1 Backend
1. Crear endpoints:
- `GET /api/payments/profile-methods/`
- `POST /api/payments/profile-methods/`
- `PATCH /api/payments/profile-methods/{id}/`
- `DELETE /api/payments/profile-methods/{id}/`

2. Validaciones:
- Un solo metodo `is_default=true` por usuario.
- No exponer tokens completos.

### 4.2 Frontend
1. En `app/pages/profile.vue` agregar bloque `Metodos de pago`.
2. Permitir:
- Agregar metodo
- Marcar predeterminado
- Eliminar metodo
3. Mostrar tarjeta/PayPal enmascarado.

---

## Fase 5 - Verificacion de cuenta con Google (check verificado)

### 5.1 Backend (OAuth)
1. Integrar Google OAuth2 (Authorization Code + PKCE recomendado).
2. Guardar en perfil:
- `google_verified` (bool)
- `google_verified_at`
- `google_sub` (identificador unico)

3. Endpoint sugerido:
- `GET /api/auth/google/start/`
- `GET /api/auth/google/callback/`

4. Marcar `verified` solo si token/ID token fue validado correctamente.

### 5.2 Frontend
1. En perfil, boton `Verificar con Google`.
2. Mostrar check visual `Cuenta verificada`.
3. Evitar doble vinculacion de la misma cuenta Google en usuarios distintos.

---

## Fase 6 - Cambio de contrasena con verificacion por correo

### 6.1 Flujo seguro (2 pasos)
1. Usuario solicita cambio de contrasena.
2. Sistema envia codigo OTP por email (6 digitos, expira en 10 min).
3. Usuario ingresa OTP + nueva contrasena.
4. Backend valida OTP, fuerza cambio y revoca sesiones activas.

### 6.2 Backend
1. Modelo `PasswordChangeOTP`:
- `user`, `otp_hash`, `expires_at`, `attempts`, `used`
2. Endpoints:
- `POST /api/auth/password/change/request-otp/`
- `POST /api/auth/password/change/confirm/`
3. Limite anti abuso:
- rate limit por IP + usuario
- max intentos por OTP

### 6.3 Correo
1. Configurar proveedor transaccional (SendGrid, SES, Mailgun).
2. Plantilla email clara con codigo y expiracion.

---

## Fase 7 - Seguridad obligatoria (checklist)

1. HTTPS obligatorio en produccion.
2. CSRF/CORS estrictos.
3. Rate limiting en auth/pagos/webhooks.
4. Validacion de firma de webhooks (PayPal/Webpay/Stripe).
5. Idempotencia en pagos y callbacks.
6. Logging auditable (sin secretos).
7. Alertas de fraude basicas:
- multiples intentos fallidos
- cambios de metodo de pago sensibles

---

## Fase 8 - Orden recomendado de implementacion

1. `StorePayoutAccount` + permisos + UI de configuracion tienda.
2. Completar flujo Webpay real (commit y persistencia robusta).
3. Integrar PayPal (sandbox -> produccion).
4. Metodos de pago en perfil (tokenizados).
5. Verificacion Google + check visual.
6. Cambio de contrasena con OTP email.
7. Endurecimiento final: auditoria, rate limit, pruebas E2E.

---

## Criterios de "listo para produccion"

1. Todo pago confirmado solo por backend (nunca por frontend).
2. Ningun secreto/token sensible visible en respuestas.
3. Cuenta receptora verificada antes de habilitar cobros.
4. Webhooks con firma validada + idempotencia.
5. OTP de cambio de contrasena operativo con expiracion e intentos limitados.
6. Verificacion Google visible con check y fecha.

---

## Siguiente paso inmediato sugerido

Implementar primero `StorePayoutAccount` + formulario en admin de tienda + estado de verificacion, porque eso habilita el resto del flujo de dinero de forma segura.
