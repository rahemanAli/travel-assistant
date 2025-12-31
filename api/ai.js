export default async function handler(req, res) {
    // Health Check for debugging
    if (req.method === 'GET') {
        return res.status(200).json({ status: 'ok', message: 'Travel Assistant API is Running!' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Variables validation for scope access in catch block
    let modelNames = [];
    let availableModels = [];
    let errors = [];

    try {
        // DYNAMIC IMPORT: Safe-guard against load failures
        // This prevents "Crash on Start" if the library is missing/incompatible
        const { GoogleGenerativeAI } = await import('@google/generative-ai');

        // Safe Parse Body
        const body = req.body || {};
        const { currentTrip, userPrompt } = body;

        const apiKey = process.env.GEMINI_API_KEY;

        if (!currentTrip && !userPrompt) {
            return res.status(400).json({ error: 'Missing request body (currentTrip or userPrompt)' });
        }

        if (!apiKey) {
            return res.status(500).json({ error: 'Missing GEMINI_API_KEY environment variable' });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // Strategy: Force try all known working models
        // We removed the auto-discovery 'fetch' to prevent 500 server crashes/timeouts on cold starts
        modelNames = [
            'gemini-1.5-flash',
            'gemini-1.5-flash-latest',
            'gemini-1.5-flash-001',
            'gemini-1.5-pro',
            'gemini-1.5-pro-latest',
            'gemini-1.5-pro-001',
            'gemini-1.0-pro',
            'gemini-pro'
        ];

        // Placeholder to prevent reference errors in debug response

        let usedModel = '';
        let result = null;

        const systemPrompt = `
      You are a smart, friendly travel assistant. 
      Your goal is to have a NATURAL conversation with the user to help them plan a trip.
      
      Current Trip State: ${JSON.stringify(currentTrip)}
      User Input: "${userPrompt}"
      
      BEHAVIOR GUIDELINES:
      - **Be Conversational**: If the user says "Hi" or asks a general question, just chat! You don't need to force a trip update.
      - **Incremental Updates**: If the user gives one piece of info (e.g. "I want to go to Tokyo"), update JUST that field ('destination'). Don't invent dates or budgets unless asked.
      - **Zero Destructive Actions**: Never delete existing itinerary items or data unless explicitly asked to "remove" or "clear" them.
      
      MANDATORY OUTPUT FORMAT:
      You must return a VALID JSON object with this EXACT structure (no markdown):
      {
        "chat_response": "Your friendly text response to the user here.",
        "destination": "Current or updated destination string",
        "startDate": "YYYY-MM-DD (keep existing if not changed)",
        "endDate": "YYYY-MM-DD (keep existing if not changed)",
        "type": "Trip type (Leisure, etc.)",
        "vibe": ["Array", "of", "Strings"],
        "stops": ["Array", "of", "Cities"],
        "itinerary": [ ...keep existing array items, add new ones if requested... ],
        "intent": "Summary of user's goal so far"
      }
    `;

        for (const modelName of modelNames) {
            try {
                console.log(`Attempting to use model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });

                // Use generateContent with the constructed prompt
                // Force JSON mode instruction in prompt is usually enough, but for 1.5-flash we can be specific
                result = await model.generateContent(systemPrompt);
                usedModel = modelName;
                break; // Success!
            } catch (e) {
                console.warn(`Failed with model ${modelName}: ${e.message}`);
                errors.push(`${modelName}: ${e.message}`);

                if (modelNames.indexOf(modelName) === modelNames.length - 1) {
                    throw new Error(`All models failed. Details:\n${errors.join('\n')}`);
                }
            }
        }

        const responseText = result.response.text();
        console.log("Raw AI Response:", responseText); // Debug log

        // ROBUST JSON EXTRACTION: Find the first '{' and last '}'
        const firstOpen = responseText.indexOf('{');
        const lastClose = responseText.lastIndexOf('}');

        let jsonStr = responseText;
        if (firstOpen !== -1 && lastClose !== -1) {
            jsonStr = responseText.substring(firstOpen, lastClose + 1);
        }

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
                // Pass the list we found (or empty if failed) to the UI
                available_models_for_key: availableModels || [],
                models_tried: modelNames
            }
        });
    }
}
