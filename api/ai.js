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
        try {
            console.log("Checking available models via raw API...");
            // Use native fetch (Node 18+)
            const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            if (listResponse.ok) {
                const data = await listResponse.json();
                if (data.models) {
                    availableModels = data.models.map(m => m.name.replace('models/', ''));
                    console.log("Available models:", availableModels);
                }
            } else {
                console.warn("List models failed:", listResponse.status, await listResponse.text());
            }
        } catch (listErr) {
            console.warn("Failed to list models:", listErr);
        }

        // Strategy: Try latest models and stable versions
        // If we found specific models, prioritize them!
        let modelNames = [
            'gemini-1.5-flash',
            'gemini-1.5-flash-001',
            'gemini-1.5-pro',
            'gemini-1.5-pro-001',
            'gemini-1.0-pro',
            'gemini-pro'
        ];

        // If we successfully listed models, try to find matches and PREPEND them
        if (availableModels.length > 0) {
            const priorities = availableModels.filter(m => m.includes('gemini') && m.includes('flash'));
            // Add found models to the start of the list to try them first
            modelNames = [...new Set([...priorities, ...availableModels.filter(m => m.includes('gemini')), ...modelNames])];
        }

        let usedModel = '';
        let result = null;
        let errors = [];

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
                errors.push(`${modelName}: ${e.message}`);

                if (modelNames.indexOf(modelName) === modelNames.length - 1) {
                    // Last one failed, throw error with all details
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
