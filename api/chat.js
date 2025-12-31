import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { currentTrip, userPrompt } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'Missing GEMINI_API_KEY environment variable' });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const systemPrompt = `
      You are a smart travel assistant. You receive a JSON object representing a trip and a User Request.
      MANDATORY: You must return ONLY valid JSON. No markdown, no comments.
      
      Current Trip: ${JSON.stringify(currentTrip)}
      
      User Request: "${userPrompt}"
      
      Task:
      1. Understand the intent.
      2. Modify the JSON object intelligently.
         - **If the user explicitly asks to add something (e.g., 'Add dinner'), YOU MUST add it to the 'itinerary' array.**
         - Ensure new itinerary items have unique IDs, 'type': 'AI_GENERATED', 'date' (infer from intent or use trip start date), and 'time'.
         - If user changes destination, update 'destination', 'stops', and REGENERATE 'insights' array with valid data for new cities.
         - If user adds interests (e.g. 'I like hiking'), add to 'interests' array if it exists, or 'vibe'.
      3. Return the COMPLETELY UPDATED JSON object. Do not delete existing data unless asked.
    `;

        const result = await model.generateContent(systemPrompt);
        const responseText = result.response.text();

        // Cleanup markdown if present
        const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const updatedTrip = JSON.parse(jsonStr);

        return res.status(200).json(updatedTrip);

    } catch (error) {
        console.error('Gemini API Error:', error);
        return res.status(500).json({ error: 'Failed to process AI request', details: error.message });
    }
}
