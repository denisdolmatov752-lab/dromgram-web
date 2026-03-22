const storiesService = require('../services/stories.service');
const wrap = (fn) => async (req, res, next) => { try { res.json({ success: true, data: await fn(req) }); } catch(err) { next(err); } };
exports.getStories = wrap((req) => storiesService.getStories(req.user.id));
exports.getUserStories = wrap((req) => storiesService.getUserStories(req.params.userId));
exports.createStory = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Медиафайл обязателен' });
    const story = await storiesService.createStory(req.user.id, req.file, req.body.text);
    res.json({ success: true, data: story });
  } catch(err) { next(err); }
};
exports.deleteStory = wrap(async (req) => { await storiesService.deleteStory(req.params.id, req.user.id); return {}; });
exports.viewStory = wrap(async (req) => { await storiesService.viewStory(req.params.id, req.user.id); return {}; });
exports.getViews = wrap((req) => storiesService.getStoryViews(req.params.id, req.user.id));
