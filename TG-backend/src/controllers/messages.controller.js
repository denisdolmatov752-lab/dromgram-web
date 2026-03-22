const messagesService = require('../services/messages.service');

async function getMessages(req, res, next) {
  try {
    const { before, limit } = req.query;
    res.json({ success: true, data: await messagesService.getMessages(req.params.chatId, req.user.id, before, parseInt(limit)||50) });
  } catch (err) { next(err); }
}
async function sendMessage(req, res, next) {
  try {
    const { chatId, type, text, replyToId, forwardFromId, forwardFromName, latitude, longitude, pollData } = req.body;
    const msg = await messagesService.sendMessage(chatId, req.user.id, { type, text, replyToId, forwardFromId, forwardFromName, latitude, longitude, pollData });
    res.json({ success: true, data: msg });
  } catch (err) { next(err); }
}
async function editMessage(req, res, next) {
  try { res.json({ success: true, data: await messagesService.editMessage(req.params.id, req.user.id, req.body.text) }); } catch (err) { next(err); }
}
async function deleteMessage(req, res, next) {
  try {
    await messagesService.deleteMessage(req.params.id, req.user.id, req.body.forAll);
    res.json({ success: true, data: {} });
  } catch (err) { next(err); }
}
async function markRead(req, res, next) {
  try { res.json({ success: true, data: await messagesService.markRead(req.params.id, req.user.id) }); } catch (err) { next(err); }
}
async function addReaction(req, res, next) {
  try { res.json({ success: true, data: await messagesService.addReaction(req.params.id, req.user.id, req.body.emoji) }); } catch (err) { next(err); }
}
async function removeReaction(req, res, next) {
  try { await messagesService.removeReaction(req.params.id, req.user.id, req.body.emoji); res.json({ success: true, data: {} }); } catch (err) { next(err); }
}
async function pinMessage(req, res, next) {
  try {
    const msg = await require('../services/messages.service').pinMessage(req.params.id, req.body.chatId, req.user.id);
    res.json({ success: true, data: msg });
  } catch (err) { next(err); }
}
async function unpinMessage(req, res, next) {
  try {
    await require('../services/messages.service').unpinMessage(req.params.id, req.body.chatId, req.user.id);
    res.json({ success: true, data: {} });
  } catch (err) { next(err); }
}
async function searchMessages(req, res, next) {
  try {
    const { chatId, q, type } = req.query;
    res.json({ success: true, data: await messagesService.searchMessages(req.user.id, chatId, q, type) });
  } catch (err) { next(err); }
}
module.exports = { getMessages, sendMessage, editMessage, deleteMessage, markRead, addReaction, removeReaction, pinMessage, unpinMessage, searchMessages };
