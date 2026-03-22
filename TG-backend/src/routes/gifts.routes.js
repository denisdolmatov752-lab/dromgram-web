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
    // Try to use Gift model if exists, otherwise return empty
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
