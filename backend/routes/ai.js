const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/suggest', auth, async (req, res) => {
  const { current_order } = req.body;
  const restaurant_id = req.user.restaurant_id;

  try {
    // Fetch this restaurant's menu only
    const [menu] = await db.query(`
      SELECT m.id, m.name, m.description, m.price, c.name as category
      FROM menu_items m
      JOIN categories c ON m.category_id = c.id
      WHERE m.restaurant_id = ? AND m.is_available = TRUE
      ORDER BY c.display_order, m.name
    `, [restaurant_id]);

    const current_total = current_order.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const menuText = menu.map(item =>
      `[ID:${item.id}] ${item.name} (${item.category}) - $${item.price} — ${item.description || ''}`
    ).join('\n');

    const orderText = current_order.map(item =>
      `${item.name} x${item.quantity} ($${item.price})`
    ).join('\n');

    const prompt = `You are a smart assistant for a Lebanese restaurant POS system. A waiter is taking an order and you must suggest up to 3 additional items to add.

CURRENT ORDER (total: $${current_total.toFixed(2)}):
${orderText}

FULL MENU:
${menuText}

RULES:
- Suggest exactly 3 items that complement the current order
- Do NOT suggest items already in the order
- Think about food pairings, missing drink, missing dessert, or popular combos
- If order total is between $50-$59, prioritize suggesting items that would bring total to $60 for free delivery
- Keep reasons short (max 8 words)
- Respond ONLY with a JSON array, no extra text, no markdown:
[
  { "menu_item_id": 1, "name": "Item Name", "price": 8.00, "reason": "Short reason here" },
  { "menu_item_id": 2, "name": "Item Name", "price": 4.00, "reason": "Short reason here" },
  { "menu_item_id": 3, "name": "Item Name", "price": 5.00, "reason": "Short reason here" }
]`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.7
    });

    const text = response.choices[0].message.content.trim();
    const suggestions = JSON.parse(text);

    res.json({ suggestions });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;