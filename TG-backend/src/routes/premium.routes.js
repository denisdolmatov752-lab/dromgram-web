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
