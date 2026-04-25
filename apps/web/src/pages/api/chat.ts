import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  try {
    // Try OpenAI API first
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are AgroBot, an AI agricultural assistant specialized in Indian farming.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API request failed');
    }

    const data = await response.json();
    
    res.status(200).json({
      reply: data.choices[0].message.content,
      success: true
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    
    // Fallback to rule-based responses
    const fallbackReply = getFallbackReply(message);
    res.status(200).json({
      reply: fallbackReply,
      success: false,
      fallback: true
    });
  }
}

function getFallbackReply(text: string): string {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('rice') || lowerText.includes('paddy')) {
    return 'Rice grows best in wet conditions with temperatures between 20-35°C. Best season: Kharif (June-July).';
  }

  if (lowerText.includes('tractor') && (lowerText.includes('small') || lowerText.includes('1') || lowerText.includes('2'))) {
    return 'For 1-2 acres: Power tiller (₹40,000-80,000), sprayer (₹3,000-8,000), and basic hand tools.';
  }

  if (lowerText.includes('weather') || lowerText.includes('season')) {
    return 'Best planting season varies by crop. Rice: June-July, Wheat: October-November, Cotton: May-June.';
  }

  return 'I can help with crops, equipment, weather, and pest control. What would you like to know?';
}
