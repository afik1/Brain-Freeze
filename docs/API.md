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

### `GET /api/sizes`

Available sizes. Optional for orders — see `POST /api/orders`.

**Response 200**
```json
[
  { "id": "small", "name": "Small", "priceModifier": -0.5 },
  { "id": "regular", "name": "Regular", "priceModifier": 0 },
  { "id": "large", "name": "Large", "priceModifier": 1.5 }
]
```

`priceModifier` is added to the flavor price.

---

### `GET /api/toppings`

Available toppings. Optional for orders — see `POST /api/orders`.

**Response 200** — array of Topping objects (see Topping shape below).

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

> **Size and toppings are OPTIONAL.** If omitted, size defaults to `regular` and toppings default to none.
> The basic order format below keeps working unchanged.

**Basic request body (still valid)**
```json
{
  "items": [
    { "flavorId": "pistachio-crisis", "quantity": 2 }
  ]
}
```

**Request body with optional fields**
```json
{
  "items": [
    {
      "flavorId": "pistachio-crisis",
      "quantity": 2,
      "sizeId": "large",
      "toppingIds": ["roasted-nuts", "fresh-berries"]
    }
  ]
}
```

- `items` must be a non-empty array
- `flavorId` must exist and be available (`isAvailable: true`)
- `quantity` must be a positive integer
- `sizeId` *(optional)* — one of the ids from `GET /api/sizes`. Default: `regular`
- `toppingIds` *(optional)* — array of available topping ids, no duplicates. Default: `[]`
- The requested quantity per flavor, summed across all items, must not exceed `stockRemaining`
- **Do not send a price.** The total is calculated server-side:
  `unitPrice = flavor price + size modifier + toppings`, `subtotal = unitPrice × quantity`
- The whole order is validated first. Stock is only decremented if every item is valid.

**Response 201**
```json
{
  "orderId": "BF-1042",
  "status": "confirmed",
  "total": 17.5,
  "items": [
    {
      "flavorId": "pistachio-crisis",
      "name": "Pistachio Crisis",
      "quantity": 2,
      "size": { "id": "large", "name": "Large", "priceModifier": 1.5 },
      "toppings": [
        { "id": "roasted-nuts", "name": "Roasted Nuts", "price": 0.75 },
        { "id": "fresh-berries", "name": "Fresh Berries", "price": 1.0 }
      ],
      "basePrice": 5.5,
      "unitPrice": 8.75,
      "subtotal": 17.5
    }
  ]
}
```

Without `sizeId`/`toppingIds` the same item comes back with `size.id: "regular"`, `toppings: []` and `unitPrice` equal to `basePrice`.

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
| `stockRemaining` | `number` | Units left. `0` when unavailable. Low (2–4) for a few flavors. Resets when the API restarts |
| `isFeatured` | `boolean` | |

---

## Topping shape

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | e.g. `"roasted-nuts"` |
| `name` | `string` | Display name |
| `price` | `number` | In euros, added per unit |
| `allergens` | `string[]` | May be empty |
| `isVegan` | `boolean` | |
| `isAvailable` | `boolean` | `false` toppings are rejected in orders |

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
| `FLAVOR_NOT_FOUND` | 404 / 400 | `404` when requesting an unknown flavor through `GET /api/flavors/:id`; `400` when an unknown flavor ID is included in `POST /api/orders` |
| `FLAVOR_UNAVAILABLE` | 400 | Flavor exists but `isAvailable` is false |
| `INVALID_QUANTITY` | 400 | Quantity is not a positive integer |
| `INVALID_ORDER` | 400 | `items` is missing, not an array, or empty |
| `INVALID_SIZE` | 400 | `sizeId` is not one of the known sizes |
| `TOPPING_NOT_FOUND` | 400 | A `toppingIds` entry does not exist |
| `TOPPING_UNAVAILABLE` | 400 | Topping exists but `isAvailable` is false |
| `DUPLICATE_TOPPING` | 400 | The same topping id appears twice in one item |
| `INSUFFICIENT_STOCK` | 400 | Requested quantity exceeds `stockRemaining`. The message names the flavor and the remaining stock |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
