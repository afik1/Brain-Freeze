# Brain Freeze — API Reference

> The API is fixed workshop infrastructure. Do not modify it.

## Base URL

```
http://localhost:3001
```

Responses include an artificial delay of ~150–350 ms — this is intentional.  
All responses are `application/json`.

---

## Endpoints

### `GET /health`

```
GET /health
```

**Response 200**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### `GET /api/store`

Store information.

**Response 200**
```json
{
  "name": "Brain Freeze",
  "description": "...",
  "address": "14 Scoop Street, Frostville, FC 10032",
  "openingHours": "Mon–Sun: 12:00–22:00",
  "messageFromOwner": "..."
}
```

---

### `GET /api/categories`

Available flavor categories.

**Response 200**
```json
["classic", "fruit", "special"]
```

---

### `GET /api/flavors`

All flavors. See Flavor shape below.

**Response 200** — array of Flavor objects.

---

### `GET /api/flavors/:id`

Single flavor by id (e.g. `pistachio-crisis`).

**Response 200** — Flavor object.  
**Response 404** — `FLAVOR_NOT_FOUND`

---

### `POST /api/orders`

Place an order.

**Request body**
```json
{
  "items": [
    { "flavorId": "pistachio-crisis", "quantity": 2 }
  ]
}
```

- `items` must be a non-empty array
- `flavorId` must exist and be available (`isAvailable: true`)
- `quantity` must be a positive integer
- **Do not send a price.** The total is calculated server-side.

**Response 201**
```json
{
  "orderId": "BF-1042",
  "status": "confirmed",
  "total": 11.0,
  "items": [
    {
      "flavorId": "pistachio-crisis",
      "name": "Pistachio Crisis",
      "quantity": 2,
      "unitPrice": 5.5,
      "subtotal": 11.0
    }
  ]
}
```

**Response 400** — see error codes below.

---

## Flavor shape

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | URL-safe slug, e.g. `"pistachio-crisis"` |
| `name` | `string` | Display name |
| `description` | `string` | May be long |
| `price` | `number` | In euros |
| `imageUrl` | `string \| null` | `null` for one flavor — handle gracefully |
| `category` | `"classic" \| "fruit" \| "special"` | |
| `allergens` | `string[]` | e.g. `["milk", "nuts", "gluten"]`, may be empty |
| `isVegan` | `boolean` | |
| `isAvailable` | `boolean` | `false` = sold out / unavailable |
| `isFeatured` | `boolean` | |

---

## Error format

All error responses use the same shape:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description."
  }
}
```

| Code | Status | When |
|------|--------|------|
| `FLAVOR_NOT_FOUND` | 404 בשליפת טעם בודד, 400 כאשר מזהה טעם לא קיים נשלח בהזמנה | No flavor with that id |
| `FLAVOR_UNAVAILABLE` | 400 | Flavor exists but `isAvailable` is false |
| `INVALID_QUANTITY` | 400 | Quantity is not a positive integer |
| `INVALID_ORDER` | 400 | `items` is missing, not an array, or empty |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
