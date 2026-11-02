import type { Flavor, StoreInfo } from "./types.js";

export const storeInfo: StoreInfo = {
  name: "Brain Freeze",
  description:
    "Artisan ice cream handcrafted in small batches with obsessive attention to flavor. We believe ice cream should be an experience, not just a snack.",
  address: "14 Scoop Street, Frostville, FC 10032",
  openingHours: "Mon–Sun: 12:00–22:00",
  messageFromOwner:
    "We open tonight. The shop looks amazing. The ice cream is incredible. The website currently looks like an admin system from 2007. If you could sort that out before the first customers arrive, that would be wonderful. No pressure. Okay, some pressure.",
};

let orderCounter = 1041;

export function nextOrderId(): string {
  orderCounter += 1;
  return `BF-${orderCounter}`;
}

// Image URLs are local SVG data URIs so the workshop works offline
const scoopSvg = (color: string, accent: string): string =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="${accent}" rx="12"/>
      <circle cx="100" cy="85" r="58" fill="${color}"/>
      <ellipse cx="100" cy="160" rx="32" ry="12" fill="${color}" opacity="0.5"/>
      <rect x="84" y="138" width="32" height="40" rx="6" fill="#c8a96e"/>
    </svg>`
  )}`;

export const flavors: Flavor[] = [
  // ── Classic ──────────────────────────────────────────────────────────────
  {
    id: "midnight-chocolate",
    name: "Midnight Chocolate",
    description:
      "Single-origin 72% dark chocolate ice cream. Rich, slightly bitter, and deeply satisfying. The kind of chocolate that makes you question every other chocolate you've had.",
    price: 4.5,
    imageUrl: scoopSvg("#3d1f0a", "#1a0a00"),
    category: "classic",
    allergens: ["milk", "soy"],
    isVegan: false,
    isAvailable: true,
    isFeatured: true,
  },
  {
    id: "vanilla-but-make-it-expensive",
    name: "Vanilla But Make It Expensive",
    description:
      "Madagascan vanilla bean. Because plain vanilla deserved better PR.",
    price: 5.5,
    imageUrl: scoopSvg("#f5e6c8", "#faf3e0"),
    category: "classic",
    allergens: ["milk", "eggs"],
    isVegan: false,
    isAvailable: true,
    isFeatured: true,
  },
  {
    id: "strawberry-therapy",
    name: "Strawberry Therapy",
    description:
      "Fresh seasonal strawberries blended into a delicate cream base. Recommended by 0 out of 0 therapists, but loved by everyone who tries it.",
    price: 4.0,
    imageUrl: scoopSvg("#e8476a", "#fce4ec"),
    category: "classic",
    allergens: ["milk"],
    isVegan: false,
    isAvailable: true,
    isFeatured: false,
  },
  {
    id: "salted-caramel",
    name: "Salted Caramel",
    description:
      "Slow-cooked caramel with a generous pinch of Fleur de Sel. Sweet, salty, and completely addictive.",
    price: 4.5,
    imageUrl: scoopSvg("#c97b2a", "#f5e0b5"),
    category: "classic",
    allergens: ["milk"],
    isVegan: false,
    isAvailable: true,
    isFeatured: false,
  },
  {
    id: "cookies-without-consent",
    name: "Cookies Without Consent",
    description:
      "Cream cheese ice cream packed with crumbled cookies and a dark chocolate ribbon. We probably should have asked first.",
    price: 5.0,
    imageUrl: scoopSvg("#4a3728", "#d4c4b0"),
    category: "classic",
    allergens: ["milk", "gluten", "eggs"],
    isVegan: false,
    isAvailable: true,
    isFeatured: false,
  },

  // ── Fruit ─────────────────────────────────────────────────────────────────
  {
    id: "mango-deployment",
    name: "Mango Deployment",
    description:
      "Alphonso mango sorbet. Ships fast, runs smooth, no breaking changes. Unlike most deployments.",
    price: 4.0,
    imageUrl: scoopSvg("#ffb300", "#fff3e0"),
    category: "fruit",
    allergens: [],
    isVegan: true,
    isAvailable: true,
    isFeatured: true,
  },
  {
    id: "lemon-zest",
    name: "Lemon Zest",
    description:
      "Sharp Sicilian lemon sorbet with a hint of thyme. Refreshingly uncomplicated.",
    price: 3.5,
    imageUrl: scoopSvg("#f9e04b", "#fffde7"),
    category: "fruit",
    allergens: [],
    isVegan: true,
    isAvailable: true,
    isFeatured: false,
  },
  {
    id: "raspberry-reboot",
    name: "Raspberry Reboot",
    description:
      "Wild raspberry sorbet. Tart enough to wake you up, sweet enough to keep you going.",
    price: 4.0,
    imageUrl: scoopSvg("#c2185b", "#fce4ec"),
    category: "fruit",
    allergens: [],
    isVegan: true,
    isAvailable: true,
    isFeatured: false,
  },
  {
    id: "passionfruit-protocol",
    name: "Passionfruit Protocol",
    description: "Pure passionfruit sorbet. Exotic, punchy, and surprisingly polite.",
    price: 4.5,
    imageUrl: scoopSvg("#7b1fa2", "#f3e5f5"),
    category: "fruit",
    allergens: [],
    isVegan: true,
    isAvailable: true,
    isFeatured: false,
  },
  {
    id: "seasonal-berry-patch",
    name: "Seasonal Berry Patch",
    description:
      "A rotating blend of whatever berries arrived this morning. The flavor changes with the season and the mood of our supplier.",
    price: 4.0,
    imageUrl: scoopSvg("#6a1b9a", "#ede7f6"),
    category: "fruit",
    allergens: ["milk"],
    isVegan: false,
    isAvailable: false, // out of season
    isFeatured: false,
  },

  // ── Special ───────────────────────────────────────────────────────────────
  {
    id: "pistachio-crisis",
    name: "Pistachio Crisis",
    description:
      "Roasted Sicilian pistachios churned into a pale green cream. We ran out last week and the owner had what he describes as 'a moment'. It's back now.",
    price: 5.5,
    imageUrl: scoopSvg("#7cb87c", "#e8f5e9"),
    category: "special",
    allergens: ["milk", "nuts"],
    isVegan: false,
    isAvailable: true,
    isFeatured: true,
  },
  {
    id: "merge-conflict-caramel",
    name: "Merge Conflict Caramel",
    description:
      "Two caramel recipes that should never have been combined ended up creating something unexpectedly brilliant. Butterscotch caramel swirled with salted pretzel caramel. No conflicts were resolved. All were accepted.",
    price: 5.0,
    imageUrl: scoopSvg("#a1670a", "#fff8e1"),
    category: "special",
    allergens: ["milk", "gluten", "nuts"],
    isVegan: false,
    isAvailable: true,
    isFeatured: false,
  },
  {
    id: "production-pistachio",
    name: "Production Pistachio",
    description:
      "Same pistachio base as Pistachio Crisis but triple-tested, lightly salted, and cleared for release. More reliable. Slightly less exciting.",
    price: 5.0,
    imageUrl: scoopSvg("#8bc34a", "#f1f8e9"),
    category: "special",
    allergens: ["milk", "nuts"],
    isVegan: false,
    isAvailable: false, // batch not ready yet
    isFeatured: false,
  },
  {
    id: "lavender-cloud",
    name: "Lavender Cloud",
    description:
      "Oat milk base infused with Provençal lavender and a hint of honey. Light, floral, and the most divisive thing we serve. You either love it or you look confused.",
    price: 5.5,
    imageUrl: scoopSvg("#9575cd", "#ede7f6"),
    category: "special",
    allergens: [],
    isVegan: true,
    isAvailable: true,
    isFeatured: false,
  },
  {
    id: "the-mystery",
    name: "???",
    description: null as unknown as string, // intentionally long edge-case description below
    price: 3.0,
    imageUrl: null, // no image — workshop edge case
    category: "special",
    allergens: ["milk", "gluten", "eggs", "nuts", "soy"],
    isVegan: false,
    isAvailable: true,
    isFeatured: false,
  },
];

// Patch the mystery flavor with a long description after array init
// so TypeScript is happy with the type
(flavors.find((f) => f.id === "the-mystery") as Flavor).description =
  "We genuinely cannot tell you what this is. The chef knows. She's not saying. It changes every day. Past versions have included brown butter, candied fennel, crushed digestives, something described only as 'the orange thing', and on one memorable Thursday, activated charcoal. We don't recommend it for people who need to know things before eating them. Everyone else seems to enjoy it. Current batch has no identifiable flavor notes. The chef smiled when asked. That could mean anything.";

export const categories = ["classic", "fruit", "special"] as const;
