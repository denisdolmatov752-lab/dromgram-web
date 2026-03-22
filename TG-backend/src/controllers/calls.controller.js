const callsService = require('../services/calls.service');
const wrap = (fn) => async (req, res, next) => { try { res.json({ success: true, data: await fn(req) }); } catch(err) { next(err); } };
exports.getCalls = wrap((req) => callsService.getCalls(req.user.id));
exports.initiateCall = wrap((req) => callsService.initiateCall(req.user.id, req.body.userId, req.body.type));
exports.acceptCall = wrap((req) => callsService.acceptCall(req.params.id, req.user.id));
exports.declineCall = wrap((req) => callsService.declineCall(req.params.id, req.user.id));
exports.endCall = wrap((req) => callsService.endCall(req.params.id, req.user.id));
