const g = require('../services/groups.service');
const wrap = (fn) => async (req, res, next) => { try { res.json({ success: true, data: await fn(req, res) }); } catch(err) { next(err); } };
exports.createGroup = wrap(async (req) => g.createGroup(req.user.id, req.body.name, req.body.memberIds||[], req.body.avatarUrl));
exports.getGroup = wrap(async (req) => g.getGroup(req.params.id, req.user.id));
exports.updateGroup = wrap(async (req) => g.updateGroup(req.params.id, req.user.id, req.body));
exports.addMember = wrap(async (req) => g.addMember(req.params.id, req.user.id, req.body.userId));
exports.removeMember = wrap(async (req) => { await g.removeMember(req.params.id, req.user.id, req.params.userId); return {}; });
exports.updateMemberRole = wrap(async (req) => { await g.updateMemberRole(req.params.id, req.user.id, req.params.userId, req.body.role); return {}; });
exports.leaveGroup = wrap(async (req) => { await g.leaveGroup(req.params.id, req.user.id); return {}; });
exports.getInviteLink = wrap(async (req) => g.getInviteLink(req.params.id, req.user.id));
exports.joinByInvite = wrap(async (req) => g.joinByInvite(req.params.code, req.user.id));
exports.uploadGroupAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Файл не загружен' });
    const { uploadFile } = require('../services/media.service');
    const result = await uploadFile(req.file, req.params.id, req.user.id);
    const { prisma } = require('../config/database');
    await prisma.chat.update({ where: { id: req.params.id }, data: { avatarUrl: result.url } });
    res.json({ success: true, data: { avatarUrl: result.url } });
  } catch(err) { next(err); }
};
