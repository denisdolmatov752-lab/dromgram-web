const foldersService = require('../services/folders.service');
const wrap = (fn) => async (req, res, next) => { try { res.json({ success: true, data: await fn(req) }); } catch(err) { next(err); } };
exports.getFolders = wrap((req) => foldersService.getFolders(req.user.id));
exports.createFolder = wrap((req) => foldersService.createFolder(req.user.id, req.body));
exports.updateFolder = wrap((req) => foldersService.updateFolder(req.params.id, req.user.id, req.body));
exports.deleteFolder = wrap(async (req) => { await foldersService.deleteFolder(req.params.id, req.user.id); return {}; });
exports.reorderFolders = wrap(async (req) => { await foldersService.reorderFolders(req.user.id, req.body.ids); return {}; });
