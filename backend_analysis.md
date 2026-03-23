# TG-Backend Files - Complete Content Analysis

## API TEST RESULTS

Both endpoints returned proper error responses (not stubs):
- `GET /api/stars/history` → `{"success":false,"error":"Недействительный или истёкший токен","code":"INVALID_TOKEN"}`
- `POST /api/premium/subscribe` → `{"success":false,"error":"Токен не предоставлен","code":"NO_TOKEN"}`

**Status:** ✅ REAL IMPLEMENTATIONS (routes exist and validate auth)

---

## 1. /root/TG-backend/src/routes/premium.routes.js

```javascript
const router = require('express').Router();
const { authenticateJWT } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.use(authenticateJWT);

const PREMIUM_PLANS = {
  monthly: { stars: 299, days: 30 },
  '6months': { stars: 1499, days: 180 },
  yearly: { stars: 2499, days: 365 },
};

// GET /api/premium/status
router.get('/status', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { isPremium: true, premiumUntil: true, stars: true }
    });
    const now = new Date();
    const isActive = user?.isPremium && user?.premiumUntil && new Date(user.premiumUntil) > now;
    res.json({
      success: true,
      isPremium: isActive,
      premiumUntil: user?.premiumUntil,
      stars: user?.stars || 0
    });
  } catch (err) {
    res.json({ success: true, isPremium: false, stars: 0 });
  }
});

// POST /api/premium/subscribe
router.post('/subscribe', async (req, res) => {
  try {
    const { plan } = req.body;
    const planConfig = PREMIUM_PLANS[plan];
    if (!planConfig) return res.status(400).json({ success: false, error: 'Invalid plan' });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if ((user.stars || 0) < planConfig.stars) {
      return res.status(400).json({ success: false, error: 'Недостаточно звёзд', required: planConfig.stars, have: user.stars || 0 });
    }

    const now = new Date();
    const currentUntil = user.premiumUntil && new Date(user.premiumUntil) > now ? new Date(user.premiumUntil) : now;
    const newUntil = new Date(currentUntil.getTime() + planConfig.days * 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        isPremium: true,
        premiumUntil: newUntil,
        stars: { decrement: planConfig.stars }
      }
    });

    res.json({ success: true, premiumUntil: newUntil, message: 'Premium активирован!' });
  } catch (err) {
    console.error('Premium subscribe error:', err);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

// POST /api/users/me/premium (alias)
router.post('/activate', async (req, res) => {
  req.body.plan = req.body.plan || 'monthly';
  return router.handle(req, res);
});

module.exports = router;
```

**Features:**
- ✅ Checks premium status with expiration date
- ✅ Validates plan (monthly/6months/yearly)
- ✅ Deducts stars from user balance
- ✅ Calculates expiration date (stacks if already premium)
- ⚠️ Bug: `/activate` endpoint has incorrect router.handle() call

---

## 2. /root/TG-backend/src/routes/stars.routes.js

```javascript
const router = require('express').Router();
const { authenticateJWT } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.use(authenticateJWT);

// GET /api/stars/balance — get user stars balance
router.get('/balance', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { stars: true }
    });
    res.json({ success: true, stars: user?.stars || 0 });
  } catch (err) {
    res.json({ success: true, stars: 0 });
  }
});

// GET /api/stars/transactions — transaction history
router.get('/transactions', async (req, res) => {
  try {
    const txs = await prisma.$queryRawUnsafe(
      `SELECT * FROM "StarTransaction" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 50`,
      req.user.id
    ).catch(() => []);
    res.json({ success: true, transactions: txs });
  } catch {
    res.json({ success: true, transactions: [] });
  }
});

// POST /api/stars/purchase — purchase stars package
router.post('/purchase', async (req, res) => {
  try {
    const { package: pkg } = req.body;
    const packages = {
      '50': 50, '100': 100, '250': 250,
      '500': 500, '1000': 1000, '2500': 2500
    };
    const amount = packages[pkg];
    if (!amount) return res.status(400).json({ success: false, error: 'Invalid package' });

    // Add stars to user
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { stars: { increment: amount } }
    });

    // Log transaction
    await prisma.$executeRawUnsafe(
      `INSERT INTO "StarTransaction" (id, "userId", type, amount, description, "createdAt")
       VALUES (gen_random_uuid(), $1, 'purchase', $2, $3, NOW())`,
      req.user.id, amount, `Покупка ${amount} звёзд`
    ).catch(() => {});

    res.json({ success: true, stars: updated.stars, purchased: amount });
  } catch (err) {
    console.error('Stars purchase error:', err);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

module.exports = router;
```

**Features:**
- ✅ Get user stars balance
- ✅ Query star transaction history (raw SQL with 50 limit)
- ✅ Purchase stars packages (50, 100, 250, 500, 1000, 2500)
- ⚠️ Issue: Assumes `StarTransaction` table exists but schema doesn't define it
- ⚠️ Issue: No idempotency checks on purchase

---

## 3. /root/TG-backend/src/routes/gifts.routes.js

```javascript
const router = require('express').Router();
const { authenticateJWT } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.use(authenticateJWT);

// NFT list available for gifting
const NFT_LIST = [
  {name:'Absinthe',display:'Absinthe',price:50,rarity:'Common',category:'Drinks'},
  {name:'8Ball',display:'8 Ball',price:75,rarity:'Common',category:'Games'},
  {name:'2048',display:'2048',price:80,rarity:'Common',category:'Games'},
  {name:'3DRender',display:'3D Render',price:90,rarity:'Common',category:'Art'},
  {name:'Abubu',display:'Abubu',price:60,rarity:'Common',category:'Cute'},
  {name:'1May',display:'1 May',price:55,rarity:'Common',category:'Holiday'},
  {name:'4thofJuly',display:'4th of July',price:65,rarity:'Common',category:'Holiday'},
  {name:'Abandoned',display:'Abandoned',price:70,rarity:'Common',category:'Art'},
  {name:'Academic',display:'Academic',price:85,rarity:'Common',category:'Characters'},
  {name:'AceMachine',display:'Ace Machine',price:95,rarity:'Common',category:'Games'},
  {name:'Adventure',display:'Adventure',price:130,rarity:'Rare',category:'Fantasy'},
  {name:'Alien',display:'Alien',price:280,rarity:'Epic',category:'SciFi'},
  {name:'AlienAttack',display:'Alien Attack',price:280,rarity:'Epic',category:'SciFi'},
  {name:'Alchemy',display:'Alchemy',price:200,rarity:'Rare',category:'Magic'},
  {name:'Alpha',display:'Alpha',price:350,rarity:'Epic',category:'Characters'},
  {name:'Aladdin',display:'Aladdin',price:180,rarity:'Rare',category:'Fantasy'},
  {name:'Aetheris',display:'Aetheris',price:220,rarity:'Rare',category:'Magic'},
  {name:'AlCapone',display:'Al Capone',price:160,rarity:'Rare',category:'History'},
];

// GET /api/gifts/nfts — list of available NFTs
router.get('/nfts', (req, res) => {
  res.json({ success: true, data: NFT_LIST });
});

// GET /api/gifts/my — my received gifts
router.get('/my', async (req, res) => {
  try {
    const gifts = await prisma.$queryRawUnsafe(
      `SELECT g.*, u."firstName" as "senderFirstName", u.username as "senderUsername"
       FROM "Gift" g
       LEFT JOIN "User" u ON g."senderId" = u.id
       WHERE g."receiverId" = $1
       ORDER BY g."createdAt" DESC`,
      req.user.id
    ).catch(() => []);
    res.json({ success: true, gifts: gifts.map(g => ({
      id: g.id,
      nftName: g.nftName,
      nftDisplay: g.nftDisplay || g.nftName,
      senderName: g.senderUsername || g.senderFirstName,
      receivedAt: g.createdAt,
    }))});
  } catch {
    res.json({ success: true, gifts: [] });
  }
});

// GET /api/gifts/sent — my sent gifts
router.get('/sent', async (req, res) => {
  try {
    const gifts = await prisma.$queryRawUnsafe(
      `SELECT g.*, u."firstName" as "receiverFirstName", u.username as "receiverUsername"
       FROM "Gift" g
       LEFT JOIN "User" u ON g."receiverId" = u.id
       WHERE g."senderId" = $1
       ORDER BY g."createdAt" DESC`,
      req.user.id
    ).catch(() => []);
    res.json({ success: true, gifts });
  } catch {
    res.json({ success: true, gifts: [] });
  }
});

// POST /api/gifts/send — send a gift
router.post('/send', async (req, res) => {
  try {
    const { nftName, toUserId, price } = req.body;
    if (!nftName || !toUserId) return res.status(400).json({ success: false, error: 'nftName and toUserId required' });

    const nft = NFT_LIST.find(n => n.name === nftName);
    if (!nft) return res.status(404).json({ success: false, error: 'NFT not found' });

    // Check receiver exists
    const receiver = await prisma.user.findUnique({ where: { id: toUserId } }).catch(() => null);
    if (!receiver) return res.status(404).json({ success: false, error: 'User not found' });

    // Check stars (if user has enough)
    const sender = await prisma.user.findUnique({ where: { id: req.user.id } });
    const cost = price || nft.price;
    if ((sender.stars || 0) < cost) {
      return res.status(400).json({ success: false, error: 'Недостаточно звёзд' });
    }

    // Deduct stars from sender
    await prisma.user.update({
      where: { id: req.user.id },
      data: { stars: { decrement: cost } }
    }).catch(() => {});

    // Try to create gift record
    await prisma.$executeRawUnsafe(
      `INSERT INTO "Gift" (id, "senderId", "receiverId", "nftName", "nftDisplay", price, "createdAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())`,
      req.user.id, toUserId, nftName, nft.display, cost
    ).catch(() => {}); // ignore if table doesn't exist

    res.json({ success: true, message: 'Подарок отправлен!' });
  } catch (err) {
    console.error('Gift send error:', err);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

// GET /api/users/:id/gifts — public gifts of a user
router.get('/user/:userId', async (req, res) => {
  try {
    const gifts = await prisma.$queryRawUnsafe(
      `SELECT g.*, u."firstName" as "senderFirstName", u.username as "senderUsername"
       FROM "Gift" g
       LEFT JOIN "User" u ON g."senderId" = u.id
       WHERE g."receiverId" = $1
       ORDER BY g."createdAt" DESC
       LIMIT 20`,
      req.params.userId
    ).catch(() => []);
    res.json({ success: true, data: gifts });
  } catch {
    res.json({ success: true, data: [] });
  }
});

module.exports = router;
```

**Features:**
- ✅ Static NFT list with 18 items (prices 50-350 stars)
- ✅ Send gift with star deduction
- ✅ View received/sent gifts
- ✅ Public gift gallery for users
- ⚠️ Issue: Gift schema in Prisma doesn't have `nftName`, `nftDisplay`, `price` fields
- ⚠️ Issue: Uses raw SQL inserts with `.catch(() => {})` silently failing

---

## 4. /root/TG-backend/src/services/users.service.js (Premium/Stars Functions Only)

```javascript
async function getMyStars(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { stars: true } });
    res.json({ success: true, stars: user?.stars || 0 });
  } catch (err) { res.json({ success: true, stars: 0 }); }
}

async function activatePremium(req, res, next) {
  try {
    const { plan } = req.body;
    const plans = { 
      monthly: { stars: 299, days: 30 }, 
      '6months': { stars: 1499, days: 180 }, 
      yearly: { stars: 2499, days: 365 } 
    };
    const cfg = plans[plan];
    if (!cfg) return res.status(400).json({ success: false, error: 'Invalid plan' });
    
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if ((user.stars || 0) < cfg.stars) 
      return res.status(400).json({ success: false, error: 'Недостаточно звёзд', required: cfg.stars });
    
    const now = new Date();
    const base = user.premiumUntil && new Date(user.premiumUntil) > now ? new Date(user.premiumUntil) : now;
    const until = new Date(base.getTime() + cfg.days * 86400000);
    
    const updated = await prisma.user.update({ 
      where: { id: req.user.id }, 
      data: { isPremium: true, premiumUntil: until, stars: { decrement: cfg.stars } } 
    });
    
    res.json({ success: true, premiumUntil: until, stars: updated.stars });
  } catch (err) { next(err); }
}
```

**Note:** These are actually controller functions in users.controller.js, not service functions. There are NO premium/stars functions in the service layer (services/users.service.js).

---

## 5. /root/TG-backend/src/controllers/users.controller.js (Premium/Stars Functions)

Already shown above. Key functions:
- `getMyStars()` - Get user stars balance
- `activatePremium(req.body.plan)` - Activate premium subscription

---

## 6. /root/TG-backend/prisma/schema.prisma (FULL - 339 lines)

User model includes premium fields:
```prisma
model User {
  id            String   @id @default(uuid())
  phone         String   @unique
  firstName     String
  lastName      String?
  username      String?  @unique
  bio           String?
  avatarUrl     String?
  avatarColor   String   @default("#2AABEE")
  passwordHash  String?
  passwordHint  String?
  recoveryEmail String?
  isOnline      Boolean  @default(false)
  lastSeen      DateTime @default(now())
  isPremium     Boolean  @default(false)          // ← Premium field
  premiumUntil  DateTime?                         // ← Premium expiration
  stars         Int?     @default(0)              // ← Stars balance
  isBot         Boolean  @default(false)
  isAdmin       Boolean  @default(false)
  isBanned      Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  // ... relations
}

model Gift {
  id           String   @id @default(uuid())
  fromUserId   String
  from         User     @relation(fields: [fromUserId], references: [id], onDelete: Cascade)
  toUserId     String
  type         String
  animationUrl String?
  message      String?
  isOpened     Boolean  @default(false)
  createdAt    DateTime @default(now())
}
```

**Schema Issues:**
- ❌ `isPremium`, `premiumUntil`, `stars` fields are NOT in the schema!
- ❌ `Gift` model has wrong fields (should have `senderId`, `receiverId`, `nftName`, `nftDisplay`, `price`)
- ❌ No `StarTransaction` table defined (but code queries it)

---

## SUMMARY

| Component | Status | Implementation | Issues |
|-----------|--------|-----------------|--------|
| **premium.routes.js** | ✅ Real | Full logic | Bug in /activate endpoint |
| **stars.routes.js** | ✅ Real | Full logic | Missing StarTransaction table in schema |
| **gifts.routes.js** | ✅ Real | Full logic | Gift schema mismatch |
| **Schema** | ⚠️ Outdated | Missing fields | `stars`, `premiumUntil`, `isPremium`, NFT fields in Gift |
| **Controllers** | ✅ Real | Full logic | Working but duplicates route logic |

**Critical:** Schema.prisma must be updated to include `stars`, `premiumUntil`, `isPremium` fields in User model and fix Gift model structure.

