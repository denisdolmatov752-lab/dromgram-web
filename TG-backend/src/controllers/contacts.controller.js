const contactsService = require('../services/contacts.service');

async function getContacts(req, res, next) {
  try { res.json({ success: true, data: await contactsService.getContacts(req.user.id) }); } catch (err) { next(err); }
}
async function addContact(req, res, next) {
  try {
    const { phone, firstName, lastName } = req.body;
    res.json({ success: true, data: await contactsService.addContact(req.user.id, phone, firstName, lastName) });
  } catch (err) { next(err); }
}
async function updateContact(req, res, next) {
  try {
    const { firstName, lastName } = req.body;
    res.json({ success: true, data: await contactsService.updateContact(req.user.id, req.params.id, firstName, lastName) });
  } catch (err) { next(err); }
}
async function deleteContact(req, res, next) {
  try {
    await contactsService.deleteContact(req.user.id, req.params.id);
    res.json({ success: true, data: { message: 'Контакт удалён' } });
  } catch (err) { next(err); }
}
async function getBlocked(req, res, next) {
  try { res.json({ success: true, data: await contactsService.getBlocked(req.user.id) }); } catch (err) { next(err); }
}
async function blockUser(req, res, next) {
  try {
    res.json({ success: true, data: await contactsService.blockUser(req.user.id, req.body.userId) });
  } catch (err) { next(err); }
}
async function unblockUser(req, res, next) {
  try {
    await contactsService.unblockUser(req.user.id, req.params.userId);
    res.json({ success: true, data: { message: 'Пользователь разблокирован' } });
  } catch (err) { next(err); }
}
module.exports = { getContacts, addContact, updateContact, deleteContact, getBlocked, blockUser, unblockUser };
