const router = require('express').Router();
const { authenticateJWT } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(authenticateJWT);

const SYSTEM_PROMPT = `Ты DRomGram AI — умный помощник встроенный в мессенджер DRomGram. Ты помогаешь пользователям, отвечаешь на вопросы, помогаешь составлять сообщения, переводишь текст и многое другое. Когда тебе присылают изображение — подробно описывай что на нём, отвечай на вопросы о нём. Отвечай на русском языке, если пользователь пишет по-русски. Будь дружелюбным и полезным. Ты создан командой DRomGram.`;

// Vision-capable model that works on OpenRouter
const AI_MODEL = 'google/gemini-2.0-flash-001';

/**
 * Sanitise a single message coming from the frontend.
 * content can be:
 *   - string  → pass through
 *   - array   → keep only 'text' and 'image_url' parts, validate image_url urls
 */
function sanitiseMessage(m) {
  if (!m || !['user', 'assistant', 'system'].includes(m.role)) return null;

  if (typeof m.content === 'string') {
    return { role: m.role, content: m.content };
  }

  if (Array.isArray(m.content)) {
    const parts = [];
    for (const part of m.content) {
      if (part.type === 'text' && typeof part.text === 'string') {
        parts.push({ type: 'text', text: part.text });
      } else if (
        part.type === 'image_url' &&
        part.image_url?.url &&
        typeof part.image_url.url === 'string'
      ) {
        const url = part.image_url.url;
        // Accept base64 data URLs and https URLs
        if (url.startsWith('data:image/') || url.startsWith('https://')) {
          parts.push({ type: 'image_url', image_url: { url } });
        }
      }
    }
    if (parts.length === 0) return null;
    return { role: m.role, content: parts };
  }

  return null;
}

// AI Chat proxy — keeps API key server-side, supports text + vision
router.post('/chat', aiLimiter || ((req, res, next) => next()), async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, error: 'messages array required' });
    }

    const apiKey = process.env.OPENROUTER_KEY;
    if (!apiKey || apiKey === 'sk-or-v1-placeholder') {
      return res.status(503).json({ success: false, error: 'AI service not configured' });
    }

    // Sanitise and filter messages (max last 20)
    const sanitised = messages
      .slice(-20)
      .map(sanitiseMessage)
      .filter(Boolean);

    if (sanitised.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid messages provided' });
    }

    const payload = {
      model: AI_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...sanitised,
      ],
      max_tokens: 2048,
      temperature: 0.7,
    };

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://orproject.ru',
        'X-Title': 'DRomGram AI',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenRouter error:', response.status, errText);
      return res.status(502).json({
        success: false,
        error: 'AI upstream error',
        status: response.status,
        detail: errText.slice(0, 300),
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'Нет ответа';
    return res.json({ success: true, data: { content, model: data.model } });
  } catch (err) {
    console.error('AI route error:', err);
    return res.status(500).json({ success: false, error: 'Internal error' });
  }
});

module.exports = router;
