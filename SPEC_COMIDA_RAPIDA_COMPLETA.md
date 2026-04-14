# 📋 ESPECIFICACIÓN COMPLETA: Plataforma de Comida Rápida 100% Personalizable

**Objetivo:** Sistema que replica cómo un dueño real de comida rápida (BurgerKing, McDonald's, local chino, etc.) vendería por internet.

---

## 🎯 FLUJO DE USUARIO (Dueño de Tienda)

### 1️⃣ ADMIN DE TIENDA - PANEL DE CONTROL

#### A) TAB "AGREGADOS" (Precios dinámicos)

**Lugar:** Admin → Editar tienda → Tab "Agregados"

**Campos configurables:**
```
Comida Rápida - Precios de Extras para Combos
├─ Tamaño
│  └─ Grande: $1.200 (por defecto, editable)
├─ Papas fritas
│  ├─ Medianas: $900
│  └─ Grandes: $1.400
├─ Bebidas
│  └─ Estándar: $1.000 (costo agregado al combo)
└─ Salsas
   └─ Por unidad: $250 (se suma por cantidad)
```

**Lógica de precios dinámicos:**
- **Base de combo:** Precio del producto (ej: Hamburguesa $9.900)
- **Extras opcionales:** Se suman al base
  - `total = base_price + size_extra + fries_extra + drink_extra + (sauces_count * sauce_price)`
- **Ejemplo real:**
  - Base: $9.900 (hamburguesa)
  - Grande: +$1.200
  - Papas medianas: +$900
  - Bebida: +$1.000
  - 2 salsas: +$500
  - **Total: $13.500**

**Casos especiales:**
- Si selecciona "Sin papas" → $0 extra
- Si selecciona "Sin bebida" → $0 extra
- Si no selecciona salsas → $0 extra
- **Nunca puede quedar en $0**: Debe validar que al menos haya base + tamaño regular

---

#### B) TAB "CONTACTO" (Existente, mejorado)

**Ya existe pero mejoramos:**
```
Teléfono: +56 9 1234 5678
WhatsApp: +56 9 1234 5678 (mismo o diferente)
Email: contacto@mitienda.com

Modo envío:
├─ Cobrar al despacho (✓ recomendado para comida)
└─ Cobrar en checkout

Tarifa envío (CLP):
├─ Base: $2.000 (mínimo)
├─ Por item extra: $200 (si tiene >3 items)
└─ Envío gratis desde: $80.000 (opcional)

Retiro en local:
├─ ✓ Habilitado / Deshabilitado
└─ Instrucciones: "Llama al 1234567 o pregunta por tu número de pedido"
```

---

#### C) TAB "REDES SOCIALES" (Nuevo)

**Lugar:** Admin → Editar tienda → Tab "Redes"

```
Instagram: https://instagram.com/mi_comida_rapida
Facebook: https://facebook.com/mi_comida_rapida
TikTok: @mi_comida_rapida (o URL completa)
YouTube: https://youtube.com/@mi_comida_rapida
```

**Dónde aparecen:**
1. En footer de la tienda (con iconos clickeables)
2. En sección final de productos (sección "Síguenos")
3. En perfil de tienda pública

---

### 2️⃣ LAYOUT DE TIENDA (Flujo visual para cliente)

#### Orden de componentes (arriba a abajo):

```
┌─────────────────────────────────────────┐
│        HERO / PORTADA                   │
│  (Logo, nombre, descripción, CTAs)      │
└─────────────────────────────────────────┘
        (scroll)
┌─────────────────────────────────────────┐
│    MENÚ (Si hay menu_pages)             │
│  "Ver menú" → Abre panel de imágenes    │
│  (Botón prominente)                     │
└─────────────────────────────────────────┘
        (scroll)
┌─────────────────────────────────────────┐
│  AGENDA TU PEDIDO POR WHATSAPP (Centro) │
│  ┌─────────────────────────────────────┐│
│  │ Número: +56 9 1234 5678            ││
│  │ "Ideal para reservas, consultas..."  ││
│  │ [Agendar por WhatsApp] → Enlace     ││
│  └─────────────────────────────────────┘│
│  (Con color de fondo diferente)         │
└─────────────────────────────────────────┘
        (scroll)
┌─────────────────────────────────────────┐
│    CATÁLOGO DE PRODUCTOS                │
│  (Combos, Hamburguesas, Papas, etc)    │
└─────────────────────────────────────────┘
        (scroll)
┌─────────────────────────────────────────┐
│  SÍGUENOS EN REDES (Footer)             │
│  Instagram  Facebook  TikTok  YouTube   │
│  (Iconos con enlaces)                   │
└─────────────────────────────────────────┘
```

---

## 🛒 CARRITO Y CHECKOUT

### A) CARRITO MEJORADO

**Items con metadata:**
```
{
  id: "unique-id",
  nombre: "Combo Hamburguesa",
  precio_base: 9900,
  precio_final: 13500,
  cantidad: 2,
  
  // INFO DEL COMBO (si aplica)
  opciones_resumen: "Tamaño regular · Papas medianas · Bebida: Coca-Cola · Salsas: BBQ, Mostaza",
  combo_config: {
    size: "regular",
    fries: "medianas",
    drink: "Coca-Cola",
    sauces: ["BBQ", "Mostaza"]
  }
}
```

**Subtotal en carrito:**
- `Subtotal = Σ(precio_final × cantidad)`
- Envío: "Se calcula en checkout"

---

### B) CHECKOUT (Flujo S-A-T)

#### Sección 1: DATOS DEL CLIENTE

```
Nombre completo: [______]
Email: [______]
Teléfono: [______]

Tipo de pedido:
○ Retiro en local (sin envío)
○ Envío a domicilio (costo automático)
  - Dirección: [____________________]
  - Referencia: [____________________]

[Mostrar WhatsApp si aplica]
"¿Prefieres agendar por WhatsApp?"
Número: +56 9 1234 5678
[Agendar pedido por WhatsApp]
```

---

#### Sección 2: MÉTODO DE PAGO (Mejorado)

**Flujo 1: Si usuario está logueado y tiene métodos guardados**

```
¿Usar método de pago guardado?

[✓] PayPal - ejemplo@gmail.com
[ ] Tarjeta - **** **** **** 4242
[ ] Cambiar método de pago

[Si selecciona "Cambiar método de pago"]
├─ Agregar nuevo PayPal
├─ Agregar nueva tarjeta
└─ Pagar solo por WhatsApp (sin tarjeta)
```

**Flujo 2: Si usuario NO tiene métodos guardados (o elige nuevo)**

```
Método de pago:
[Seleccionar...]
├─ PayPal
├─ Tarjeta Crédito/Débito (Webpay)
├─ Transferencia Bancaria
└─ Agendar solo por WhatsApp

[Si PayPal]
└─ Email PayPal: [______]

[Si Tarjeta]
├─ Número: [________] [__] [__]
├─ Titular: [______]
└─ [Pagar $XXXX]

[Si Transferencia]
├─ Banco: [Seleccionar]
├─ Tipo de cuenta: [Corriente/Vista]
└─ Recibir instrucciones por email

[Si Solo WhatsApp]
└─ Se enviará mensaje de confirmación a WhatsApp
   "Completa el pago por transferencia directa"
```

---

#### Sección 3: RESUMEN DEL PEDIDO

```
╔════════════════════════════════════╗
║    RESUMEN DE TU PEDIDO            ║
╠════════════════════════════════════╣
║ 2 × Combo Hamburguesa $13.500     ║ = $27.000
║ 1 × Papas Extra $5.000            ║ = $5.000
║────────────────────────────────────║
║ SUBTOTAL                           ║ $32.000
║─────────────────────────────────────║
║ Envío (SI aplica)                 ║ $2.500
║ [Mostrar solo si envío=true]       ║
║ "Cobrado al despacho"              ║
║─────────────────────────────────────║
║ TOTAL A PAGAR                      ║ $32.000*
║ *Sin envío (se cobra al despacho) ║
║─────────────────────────────────────║
║                                    ║
║   [◀ Volver]  [Confirmar Pago ►]  ║
╚════════════════════════════════════╝
```

**Regla del envío:**
- Si `delivery_fee_mode == "at_dispatch"`:
  - NO aparece en checkout
  - Aparece "Se cobra al despacho"
  - Total = SUBTOTAL (sin envío)
- Si `delivery_fee_mode == "at_checkout"`:
  - Aparece envío calculado
  - Total = SUBTOTAL + ENVÍO

---

## 💳 MÉTODOS DE PAGO

### Flujo de guardado

**Usuario paga por primera vez:**
```
1. Completa datos de pago (ej: PayPal)
2. Autoriza pago
3. [Checkbox] "Recordar este método para próximas compras"
4. Pago se procesa
5. Método se guarda automáticamente (si checkbox marcado)
```

**Próxima compra:**
```
1. Sistema detecta método guardado
2. "¿Usar PayPal (ejemplo@gmail.com)?"
3. Usuario elige:
   - Sí → Usa ese método (confirma con contraseña/PIN)
   - No → Formulario de nuevo método
```

---

## 🗂️ DATOS DEL BACKEND (Campos a agregar/modificar)

### Store Model
```python
class Store:
    # Existentes
    name, slug, phone, whatsapp, address
    
    # Nuevos - Agregados
    extra_size_large_price = 1200  # CLP
    extra_fries_medium_price = 900
    extra_fries_large_price = 1400
    extra_drink_price = 1000
    extra_sauce_price = 250
    
    # Existentes (mejorados)
    delivery_fee_mode = "at_dispatch"  # "at_checkout" | "at_dispatch"
    shipping_base_fee = 2000  # CLP
    shipping_per_item_fee = 200
    pickup_skip_queue_enabled = True
    pickup_instructions = "Llama al 1234567"
    
    # Nuevos - Redes sociales
    social_instagram = "https://instagram.com/..."
    social_facebook = "https://facebook.com/..."
    social_tiktok = "https://tiktok.com/..."
    social_youtube = "https://youtube.com/..."
    
    # Existentes (ya está)
    menu_pages = JSONField()  # Array de {url, label}
```

### Order Model (Mejorado)
```python
class Order:
    # Existentes
    id, user, store, total_amount, status
    
    # Mejorados/Nuevos
    items = [
        {
            product_id,
            name,
            base_price,
            final_price,
            quantity,
            combo_config: {
                size, fries, drink, sauces
            }
        }
    ]
    
    shipping_amount = 0  # $0 si "at_dispatch"
    shipping_paid_at = NULL  # Se llena cuando delivery cobra
    payment_method = "paypal|card|transfer|whatsapp"
    
    # Al confirmar pago PayPal
    paypal_order_id = "ID-123456"
    paypal_captured_at = "2026-04-11T15:30:00Z"
```

### UserPaymentMethod (Existente, mejorado)
```python
class UserPaymentMethod:
    user,
    provider: "paypal" | "card",
    label: "Mi PayPal" | "Tarjeta Débito",
    token_reference: "token_xxx",  # Nunca PAN completo
    is_default,
    is_active,
    created_at
    
    # Para PayPal
    paypal_email
    
    # Para tarjeta
    card_last4
    card_brand
    card_expiry_month
    card_expiry_year
```

---

## 📱 API ENDPOINTS REQUERIDOS

### Store Admin
```
PATCH /api/stores/{slug}/
  - Recibe: todos los campos de Store (agregados, redes, envío)
  - Retorna: Store actualizado con éxito

GET /api/stores/{slug}/combo-prices/
  - Retorna: { size_large, fries_medium, fries_large, drink, sauce }
```

### Orders & Payments
```
POST /api/orders/
  - Cuerpo: { items, user_data, payment_method, delivery_method }
  - Retorna: { order_id, payment_url } (si PayPal/Webpay)

POST /api/orders/{order_id}/confirm-payment/
  - Cuerpo: { payment_method, transaction_id }
  - Retorna: { status: "paid", order_id }

GET /api/payment-methods/
  - Retorna: lista de métodos guardados del usuario

POST /api/payment-methods/
  - Cuerpo: { provider, email/card_data }
  - Retorna: { id, label, last_digits }
```

---

## 🎨 COMPONENTES FRONTEND NUEVOS/MEJORADOS

### 1. ComboBuilder (Existente, se mejora)
```vue
<ComboBuilder
  :product="product"
  :extras="store.extra_*_price"
  @confirm="addToCart"
/>
```

### 2. MethodOfPaymentSelector (Nuevo)
```vue
<MethodOfPaymentSelector
  :saved-methods="userPaymentMethods"
  :on-select="usePaymentMethod"
  :on-new="openPaymentForm"
/>
```

### 3. SocialMediaLinks (Nuevo)
```vue
<SocialMediaLinks
  :instagram="store.social_instagram"
  :facebook="store.social_facebook"
  :tiktok="store.social_tiktok"
  :youtube="store.social_youtube"
/>
```

### 4. WhatsAppScheduler (Mejorado)
```vue
<!-- Aparece entre Menú y Catálogo -->
<WhatsAppScheduler
  :store-number="store.whatsapp"
  :store-name="store.name"
  :delivery-type="deliveryType"  <!-- "delivery" | "pickup" -->
/>
```

### 5. AgregadosAdmin (Nuevo)
```vue
<!-- En admin de tienda, tab "Agregados" -->
<AgregadosAdmin
  @update="updateStorePrices"
/>
```

---

## 🔄 FLUJO COMPLETO EJEMPLO: Cliente compra en BurgerKing

### Step 1: Cliente entra a tienda
```
https://mipyme.com/store/burgerking/productos

Ve:
1. Hero (logo, nombre)
2. "Ver menú" (abre modal con imágenes de carta)
3. "Agenda tu pedido por WhatsApp" (sección colorida)
4. Productos: Combos, Hamburguesas, Papas, Bebidas
5. Footer: Síguenos (Instagram, Facebook, TikTok)
```

### Step 2: Cliente personaliza combo
```
Hace click en "Personalizar combo" en hamburguesa combo
Se abre modal:
- Tamaño: Regular [✓] / Grande (+$1.200)
- Papas: Sin [  ] / Medianas (+$900) [✓] / Grandes (+$1.400)
- Bebida: Sin [  ] / Incluida (+$1.000) [✓]
- Salsas: BBQ [ ], Mayo [✓], Ajo [ ], etc (+$250 c/u)

Total: $13.500 ✓
[Agregar combo]
```

### Step 3: Cliente revisa carrito
```
Carrito: 1 producto
- Combo Hamburguesa: $9.900 + extras = $13.500
- Opciones: Tamaño regular · Papas medianas · Bebida · 1 salsa

[Ir a pagar]
```

### Step 4: Ingresa datos en checkout
```
Nombre: Juan Pérez
Email: juan@gmail.com
Teléfono: +56 9 1234 5678

Tipo de pedido:
- [Retiro en local]  ← Elige esto
- [Envío a domicilio]

Resumen:
Subtotal: $13.500
Envío: $0 (retiro en local)
Total: $13.500
```

### Step 5: Selecciona método de pago
```
¿Usar PayPal (juan@gmail.com)?
[✓] Sí
[ ] No, usar otro método

[Confirmar pago]
```

### Step 6: Confirmación
```
✓ ¡Tu pedido fue confirmado!
Número: #PE-12345
Retira en: BurgerKing Centro
Dirección: Calle Principal 123

Agradecemos tu compra, ¡hasta pronto!
```

---

## 📊 ADMIN DASHBOARD - VISTA DEL DUEÑO

```
┌─────────────────────────────────────────┐
│   MI TIENDA - EDITAR CONFIGURACIÓN      │
├─────────────────────────────────────────┤
│  [General]  [Diseño]  [Contacto]        │
│  [Agregados]  [Redes]                   │
├─────────────────────────────────────────┤
│ TAB: AGREGADOS                          │
│                                         │
│ Configura precios de extras para combos │
│                                         │
│ Tamaño Grande: $[1200__]                │
│ Papas Medianas: $[900__]                │
│ Papas Grandes: $[1400__]                │
│ Bebidas: $[1000__]                      │
│ Salsas (c/u): $[250__]                  │
│                                         │
│ [Guardar cambios]                       │
│                                         │
│ ✓ Cambios guardados hace 2 minutos      │
└─────────────────────────────────────────┘
```

---

## ✅ CHECKLIST IMPLEMENTACIÓN

### Phase 1: Admin & Data
- [ ] Agregar campos `extra_*_price` en Store model
- [ ] Agregar campos `social_*` en Store model
- [ ] Migración Django
- [ ] Actualizar StoreSerializer
- [ ] Endpoints PATCH `/stores/{slug}/`

### Phase 2: Frontend Admin
- [ ] Tab "Agregados" en admin
- [ ] Tab "Redes" en admin
- [ ] Campos input para precios
- [ ] Campos input para redes
- [ ] Guardar/actualizar

### Phase 3: Combo Builder
- [ ] Leer precios desde `store.extra_*_price`
- [ ] Aplicar dinámicamente en modal
- [ ] Calcular total dinámico
- [ ] Guardar combo_config en cart item

### Phase 4: Checkout
- [ ] Mostrar envío solo si `delivery_fee_mode == "at_checkout"`
- [ ] Mostrar "Cobrado al despacho" si `"at_dispatch"`
- [ ] Método de pago selector
- [ ] Guardar/cargar métodos pagos

### Phase 5: Tienda Pública
- [ ] Reorganizar: Menú → WhatsApp → Catálogo → Redes
- [ ] Componente WhatsAppScheduler (en medio)
- [ ] Componente SocialMediaLinks (footer)
- [ ] Botones con enlaces configurables

### Phase 6: Testing
- [ ] Test E2E: crear combo, ir a carrito, checkout
- [ ] Test: envío se cobra/no se cobra según flag
- [ ] Test: método de pago se guarda
- [ ] Test: redes sociales aparecen/no aparecen

---

## 🎯 CASOS DE USO REALES

### Caso 1: Dueño de Comida China (Delivery)
```
- Agregados: Sin papas (no aplica), bebida $3.000 (más caro)
- Envío: Cobrado al despacho ($5.000 fijo)
- Redes: WeChat + WhatsApp (no tiene Instagram)
- Retiro: Deshabilitado (solo delivery)
```

### Caso 2: Dueño de Local Hamburguesas (Retiro)
```
- Agregados: Papas medianas/grandes, muchas salsas
- Envío: Deshabilitado (solo retiro)
- Redes: Instagram + TikTok (es donde está su público)
- Método: Pago en local, sin tarjeta Online
```

### Caso 3: Dueño Premium (Ambos modelos)
```
- Agregados: Completo (tamaños, papas, bebidas, salsas)
- Envío: Cobranza en ambos modos (al despacho O en tarjeta)
- Redes: Todas (Instagram, Facebook, TikTok, YouTube)
- Métodos: PayPal + Webpay + Transferencia
```

---

## 📌 NOTAS IMPORTANTES

1. **Precios dinámicos:** Cada tienda define sus propios precios de agregados
2. **Envío configurable:** Dueño elige si cobrar en tarjeta o al despacho
3. **Redes sociales:** Si no rellena, no aparecen (no mostrar blancos)
4. **Método de pago:** Se guarda solo si usuario marca checkbox "Recordar"
5. **WhatsApp:** Es una CTA prominente, no un método de pago obligatorio
6. **Retiro:** Mostrar instrucciones personalizadas del dueño
7. **Responsividad:** Todo debe ser mobile-first (80% del tráfico es mobile)

---

**Estado del documento:** ✅ COMPLETO  
**Listos para implementación:** SÍ  
**Complejidad estimada:** 2-3 días de desarrollo  
**Testing:** 1 día (E2E + QA)
