const searchService = require('../services/search.service');
exports.search = async (req, res, next) => {
  try {
    const { q, types } = req.query;
    const typesArr = types ? (Array.isArray(types) ? types : [types]) : ['users','chats','messages'];
    res.json({ success: true, data: await searchService.globalSearch(req.user.id, q, typesArr) });
  } catch(err) { next(err); }
};
