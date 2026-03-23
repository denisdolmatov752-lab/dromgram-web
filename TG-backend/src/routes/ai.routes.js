const router = require('express').Router();
const { authenticateJWT } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(authenticateJWT);

// AI Chat proxy — sends request to OpenRouter, keeps API key server-side
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

    const SYSTEM_PROMPT = `Ты DRomGram AI — умный помощник встроенный в мессенджер DRomGram. Ты помогаешь пользователям, отвечаешь на вопросы, помогаешь составлять сообщения, переводишь текст и многое другое. Отвечай на русском языке, если пользователь пишет по-русски. Будь дружелюбным и полезным. Ты создан командой DRomGram.`;

    const payload = {
      model: 'google/gemini-2.0-flash-001',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.slice(-20).map(m => ({ role: m.role, content: m.content })),
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
      return res.status(502).json({ success: false, error: 'AI upstream error', status: response.status });
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
