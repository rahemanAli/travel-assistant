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

        // Strategy: Try latest models first, fall back to older ones if 404/availability issues
        const modelNames = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro', 'gemini-pro'];

        let usedModel = '';
        let result = null;
        let lastError = null;

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

        for (const modelName of modelNames) {
            try {
                console.log(`Attempting to use model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                result = await model.generateContent(systemPrompt);
                usedModel = modelName;
                break; // Success!
            } catch (e) {
                console.warn(`Failed with model ${modelName}: ${e.message}`);
                lastError = e;
                // If 404 (Not Found) or 400 (Bad Request), try next. 
                // If 401 (Auth) or 429 (Quota), it might not help to switch, but we try anyway just in case.
                if (modelNames.indexOf(modelName) === modelNames.length - 1) {
                    // Last one failed, throw proper error
                    throw new Error(`All models failed. Last error with ${modelName}: ${e.message}`);
                }
            }
        }

        const responseText = result.response.text();

        // Cleanup markdown if present
        const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const updatedTrip = JSON.parse(jsonStr);

        // Add metadata about which model was used (debug)
        updatedTrip.debug_model_used = usedModel;

        return res.status(200).json(updatedTrip);

    } catch (error) {
        console.error('Gemini API Error:', error);

        // Debug info: Show which key is being used (safe partial reveal)
        const keyPrefix = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'NONE';

        return res.status(500).json({
            error: 'Failed to process AI request',
            details: error.message,
            debug: {
                using_key_prefix: keyPrefix,
                models_tried: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro', 'gemini-pro']
            }
        });
    }
}
