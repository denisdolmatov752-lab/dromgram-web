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
