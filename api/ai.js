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

        // DEBUG: Check which models are actually available to this Key
        let availableModels = [];

        async function fetchModels(version) {
            try {
                console.log(`Checking models via ${version}...`);
                const response = await fetch(`https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.models) {
                        return data.models.map(m => m.name.replace('models/', ''));
                    }
                }
            } catch (e) {
                console.warn(`Failed to list models on ${version}:`, e);
            }
            return [];
        }

        // Try v1beta first, then v1
        availableModels = await fetchModels('v1beta');
        if (availableModels.length === 0) {
            availableModels = await fetchModels('v1');
        }

        console.log("Discovered available models:", availableModels);

        // Strategy: Try latest models and stable versions
        let modelNames = [
            'gemini-1.5-flash',
            'gemini-1.5-flash-latest',
            'gemini-1.5-flash-001',
            'gemini-1.5-pro',
            'gemini-1.5-pro-latest',
            'gemini-1.5-pro-001',
            'gemini-1.0-pro',
            'gemini-pro'
        ];

        // If we successfully listed models, try to find matches and PREPEND them
        if (availableModels.length > 0) {
            const priorities = availableModels.filter(m => m.includes('gemini'));
            // Add found models to the start of the list to try them first
            modelNames = [...new Set([...priorities, ...modelNames])];
        }

        let usedModel = '';
        let result = null;
        let errors = [];

        const systemPrompt = `
      You are a smart, friendly travel assistant. 
      Your goal is to have a NATURAL conversation with the user to help them plan a trip.
      
      Current Trip State: ${JSON.stringify(currentTrip)}
      User Input: "${userPrompt}"
      
      BEHAVIOR GUIDELINES:
      - **Be Conversational**: If the user says "Hi" or asks a general question, just chat! You don't need to force a trip update.
      - **Incremental Updates**: If the user gives one piece of info (e.g. "I want to go to Tokyo"), update JUST that field (`destination`). Don't invent dates or budgets unless asked.
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
                // Pass the list we found (or empty if failed) to the UI
                available_models_for_key: availableModels || [],
                models_tried: modelNames
            }
        });
    }
}
