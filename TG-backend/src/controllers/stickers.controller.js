const stickersService = require('../services/stickers.service');
const wrap = (fn) => async (req, res, next) => { try { res.json({ success: true, data: await fn(req) }); } catch(err) { next(err); } };
exports.getSets = wrap(() => stickersService.getStickerSets());
exports.getSet = wrap((req) => stickersService.getStickerSet(req.params.id));
exports.getRecent = wrap((req) => stickersService.getRecentStickers(req.user.id));
exports.getTrending = wrap(() => stickersService.getTrendingStickers());
