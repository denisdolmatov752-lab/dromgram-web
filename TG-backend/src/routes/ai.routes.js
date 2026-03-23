const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth');

const AI_MODEL = 'google/gemini-2.0-flash-001';
const SYSTEM_PROMPT = 'Ты DRomGram AI — умный и дружелюбный помощник мессенджера DRomGram. Ты помогаешь пользователям, отвечаешь на вопросы, помогаешь составлять сообщения, переводишь текст. Когда присылают изображение — подробно описывай что на нём. Отвечай на русском языке. Будь дружелюбным и кратким.';

function sanitiseMessage(m) {
  if (!m || !['user', 'assistant', 'system'].includes(m.role)) return null;
  if (typeof m.content === 'string') return { role: m.role, content: m.content };
  if (Array.isArray(m.content)) {
    const parts = [];
    for (const part of m.content) {
      if (part.type === 'text' && typeof part.text === 'string') {
        parts.push({ type: 'text', text: part.text });
      } else if (part.type === 'image_url' && part.image_url?.url) {
        const url = part.image_url.url;
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

// Supports both old format {message, history, imageData} and new {messages}
router.post('/chat', authenticateJWT, async (req, res) => {
  try {
    const apiKey = process.env.OPENROUTER_KEY || process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey.length < 20) {
      return res.status(503).json({ success: false, error: 'AI service not configured' });
    }

    let payloadMessages = [];

    // NEW format: { messages: [...] } — from AIAssistantPanel
    if (Array.isArray(req.body.messages)) {
      payloadMessages = req.body.messages
        .slice(-20)
        .map(sanitiseMessage)
        .filter(Boolean);
    }
    // OLD format: { message, history, imageData } — backward compat
    else if (req.body.message || req.body.imageData) {
      const { message, history = [], imageData } = req.body;
      // Add history
      for (const h of history.slice(-18)) {
        const s = sanitiseMessage(h);
        if (s) payloadMessages.push(s);
      }
      // Build current user message
      if (imageData) {
        const url = imageData.startsWith('data:') ? imageData : `data:image/jpeg;base64,${imageData}`;
        const content = [{ type: 'image_url', image_url: { url } }];
        if (message) content.push({ type: 'text', text: message });
        payloadMessages.push({ role: 'user', content });
      } else if (message) {
        payloadMessages.push({ role: 'user', content: message });
      }
    } else {
      return res.status(400).json({ success: false, error: 'message or messages required' });
    }

    if (payloadMessages.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid messages' });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://orproject.ru',
        'X-Title': 'DRomGram AI',
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...payloadMessages,
        ],
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[AI] OpenRouter error:', response.status, JSON.stringify(data).slice(0, 300));
      return res.status(502).json({
        success: false,
        error: data.error?.message || 'AI upstream error',
        detail: JSON.stringify(data).slice(0, 300),
      });
    }

    const content = data.choices?.[0]?.message?.content || 'Нет ответа';

    // Return both formats for compatibility
    return res.json({
      success: true,
      reply: content,           // old format
      data: { content, model: data.model }, // new format
    });
  } catch (err) {
    console.error('[AI] Route error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
