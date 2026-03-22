const c = require('../services/channels.service');
const wrap = (fn) => async (req, res, next) => { try { res.json({ success: true, data: await fn(req, res) }); } catch(err) { next(err); } };
exports.createChannel = wrap(async (req) => c.createChannel(req.user.id, req.body));
exports.getChannel = wrap(async (req) => c.getChannel(req.params.id, req.user.id));
exports.updateChannel = wrap(async (req) => c.updateChannel(req.params.id, req.user.id, req.body));
exports.subscribe = wrap(async (req) => c.subscribe(req.params.id, req.user.id));
exports.unsubscribe = wrap(async (req) => { await c.unsubscribe(req.params.id, req.user.id); return {}; });
exports.searchPublic = wrap(async (req) => c.searchPublicChannels(req.query.q));
