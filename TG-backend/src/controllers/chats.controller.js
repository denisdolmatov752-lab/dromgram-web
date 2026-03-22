const chatsService = require('../services/chats.service');

async function getChats(req, res, next) {
  try { res.json({ success: true, data: await chatsService.getChats(req.user.id) }); } catch (err) { next(err); }
}
async function getChatById(req, res, next) {
  try { res.json({ success: true, data: await chatsService.getChatById(req.params.id, req.user.id) }); } catch (err) { next(err); }
}
async function createPrivateChat(req, res, next) {
  try { res.json({ success: true, data: await chatsService.createPrivateChat(req.user.id, req.body.userId) }); } catch (err) { next(err); }
}
async function muteChat(req, res, next) {
  try { await chatsService.muteChat(req.params.id, req.user.id, req.body.muteUntil); res.json({ success: true, data: {} }); } catch (err) { next(err); }
}
async function unmuteChat(req, res, next) {
  try { await chatsService.unmuteChat(req.params.id, req.user.id); res.json({ success: true, data: {} }); } catch (err) { next(err); }
}
async function pinChat(req, res, next) {
  try { await chatsService.pinChat(req.params.id, req.user.id); res.json({ success: true, data: {} }); } catch (err) { next(err); }
}
async function unpinChat(req, res, next) {
  try { await chatsService.unpinChat(req.params.id, req.user.id); res.json({ success: true, data: {} }); } catch (err) { next(err); }
}
async function archiveChat(req, res, next) {
  try { await chatsService.archiveChat(req.params.id, req.user.id); res.json({ success: true, data: {} }); } catch (err) { next(err); }
}
async function unarchiveChat(req, res, next) {
  try { await chatsService.unarchiveChat(req.params.id, req.user.id); res.json({ success: true, data: {} }); } catch (err) { next(err); }
}
async function deleteChat(req, res, next) {
  try { await chatsService.deleteChat(req.params.id, req.user.id); res.json({ success: true, data: {} }); } catch (err) { next(err); }
}
async function getChatMedia(req, res, next) {
  try {
    const { cursor, limit } = req.query;
    res.json({ success: true, data: await chatsService.getChatMedia(req.params.id, req.user.id, 'PHOTO', cursor, parseInt(limit)||20) });
  } catch (err) { next(err); }
}
async function getChatDocs(req, res, next) {
  try {
    const { cursor, limit } = req.query;
    res.json({ success: true, data: await chatsService.getChatMedia(req.params.id, req.user.id, 'DOCUMENT', cursor, parseInt(limit)||20) });
  } catch (err) { next(err); }
}
module.exports = { getChats, getChatById, createPrivateChat, muteChat, unmuteChat, pinChat, unpinChat, archiveChat, unarchiveChat, deleteChat, getChatMedia, getChatDocs };
