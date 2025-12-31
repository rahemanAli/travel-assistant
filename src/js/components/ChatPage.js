import { store } from '../logic/TripStore.js';
import { AIRecommender } from '../logic/AIRecommender.js';

export function ChatComponent() {
    const container = document.createElement('div');
    container.className = 'flex flex-col h-[calc(100vh-140px)] animate-fade-in';

    container.innerHTML = `
        <div class="flex-none mb-md">
            <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary w-fit">AI Planner</h1>
            <p class="text-sm text-muted">Describe your dream trip, and I'll build it.</p>
        </div>

        <div id="chat-messages" class="flex-1 overflow-y-auto pr-xs flex flex-col gap-md pb-md scroll-smooth">
            <div class="bg-white/5 self-start rounded-lg rounded-tl-none p-md max-w-[85%] border border-white/5">
                <p class="text-white leading-relaxed">Hi! I'm your travel architect. 🌍✈️</p>
                <p class="text-sm text-muted mt-sm">Tell me your details (Budget, Dates, Interests) OR ask to modify your current plan.</p>
            </div>
            <div class="bg-white/5 self-start rounded-lg rounded-tl-none p-sm max-w-[85%] border border-white/5">
                <p class="text-xs text-secondary italic">Try: "Plan a romantic week in Paris and Nice for $3000"</p>
            </div>
        </div>
        
        <div class="flex-none mt-md">
            <form id="chat-form" class="relative">
                <input type="text" id="chat-input" placeholder="Type your plan..." class="w-full bg-black/30 border border-white/10 rounded-full pl-lg pr-xxl py-md text-white focus:outline-none focus:border-secondary shadow-inner transition-colors">
                <button type="submit" class="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-r from-secondary to-primary text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
                    <i class="ph ph-paper-plane-right text-lg"></i>
                </button>
            </form>
        </div>
    `;

    // Logic
    const form = container.querySelector('#chat-form');
    const input = container.querySelector('#chat-input');
    const messages = container.querySelector('#chat-messages');
    const sendBtn = form.querySelector('button');

    const addMessage = (text, isUser = false) => {
        const div = document.createElement('div');
        div.className = isUser
            ? 'bg-primary/20 self-end rounded-lg rounded-tr-none p-md max-w-[85%] animate-fade-in text-right'
            : 'bg-white/5 self-start rounded-lg rounded-tl-none p-md max-w-[85%] border border-white/5 animate-fade-in';
        div.innerHTML = `<p class="text-${isUser ? 'white' : 'gray-200'} leading-relaxed">${text}</p>`;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        addMessage(text, true);
        input.value = '';
        sendBtn.disabled = true;

        // Show loading
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'bg-white/5 self-start rounded-lg rounded-tl-none p-md max-w-[85%] border border-white/5';
        loadingDiv.innerHTML = '<div class="flex gap-xs items-center"><span class="text-xs text-muted">Thinking</span><div class="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce"></div><div class="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce delay-75"></div><div class="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce delay-150"></div></div>';
        messages.appendChild(loadingDiv);
        messages.scrollTop = messages.scrollHeight;

        try {
            const ai = new AIRecommender();
            const currentTrip = store.getTrip();
            // Default trip structure if empty
            const tripToSend = currentTrip || { destination: 'Paris', type: 'Leisure', budget: { estimated: { min: 2000, max: 3000 } }, itinerary: [], checklist: [], insights: [] };

            const updatedTrip = await ai.fetchSmartUpdate(tripToSend, text);

            messages.removeChild(loadingDiv);

            if (updatedTrip) {
                store.setTripDetails(updatedTrip);
                addMessage("✅ Trip updated! CHECK the Dashboard and Itinerary tabs to see the changes.");

                // Add follow up suggestions
                setTimeout(() => {
                    addMessage("Anything else? (e.g. 'Add a museum', 'Cheap eats')");
                }, 1000);

            } else {
                addMessage(`❌ <b>Connection Failed</b><br><br>Details: The app couldn't reach the backend.<br><br>Possible Causes:<br>1. <b>API Key Missing</b>: Did you set GEMINI_API_KEY in Vercel?<br>2. <b>Redeploy Needed</b>: Did you redeploy after setting the key?<br><br><i>Tech Info: Check console for 404/500 errors.</i>`);
            }
        } catch (err) {
            if (messages.contains(loadingDiv)) messages.removeChild(loadingDiv);
            addMessage(`❌ <b>Error Occurred</b><br>Message: ${err.message}<br><br>If this says "Failed to fetch", it might be a network issue or the API URL is wrong.`);
            console.error(err);
        } finally {
            sendBtn.disabled = false;
        }
    });

    return container;
}
