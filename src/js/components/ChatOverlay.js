import { store } from '../logic/TripStore.js';
import { AIRecommender } from '../logic/AIRecommender.js';

export function ChatOverlay() {
    // Initial Render of the FAB
    const container = document.createElement('div');
    container.id = 'chat-overlay-container';
    container.className = 'fixed bottom-6 right-6 z-50';

    container.innerHTML = `
        <button id="chat-fab" class="w-14 h-14 rounded-full bg-gradient-to-r from-secondary to-primary flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
            <i class="ph ph-sparkle text-2xl text-white"></i>
        </button>
        
        <div id="chat-modal" class="hidden absolute bottom-16 right-0 w-[90vw] max-w-sm h-[500px] glass rounded-xl flex flex-col shadow-2xl origin-bottom-right transition-all duration-300 transform scale-90 opacity-0">
            <div class="p-md border-b border-white/10 flex justify-between items-center bg-black/20 rounded-t-xl">
                <div class="flex items-center gap-sm">
                    <i class="ph ph-robot text-xl text-secondary"></i>
                    <h3 class="font-bold text-white">Trip Assistant</h3>
                </div>
                <button id="close-chat" class="p-xs hover:bg-white/10 rounded-full text-muted">
                    <i class="ph ph-x"></i>
                </button>
            </div>
            
            <div id="chat-messages" class="flex-1 overflow-y-auto p-md flex flex-col gap-md">
                <div class="bg-white/10 self-start rounded-lg rounded-tl-none p-sm max-w-[80%]">
                    <p class="text-sm text-white">Hi! I can help plan your trip. Tell me what you want to change or add.</p>
                </div>
                <div class="bg-white/10 self-start rounded-lg rounded-tl-none p-sm max-w-[80%]">
                    <p class="text-xs text-muted">Try: "Add a hiking day in Tokyo" or "Change budget to cheap"</p>
                </div>
            </div>
            
            <div class="p-md border-t border-white/10 bg-black/20 rounded-b-xl">
                <form id="chat-form" class="flex gap-sm">
                    <input type="text" id="chat-input" placeholder="Type a request..." class="flex-1 bg-white/5 border border-white/10 rounded-full px-md py-sm text-sm text-white focus:outline-none focus:border-primary">
                    <button type="submit" class="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center disabled:opacity-50">
                        <i class="ph ph-paper-plane-right"></i>
                    </button>
                </form>
            </div>
        </div>
    `;

    // Logic
    const fab = container.querySelector('#chat-fab');
    const modal = container.querySelector('#chat-modal');
    const closeBtn = container.querySelector('#close-chat');
    const form = container.querySelector('#chat-form');
    const input = container.querySelector('#chat-input');
    const messages = container.querySelector('#chat-messages');
    const sendBtn = form.querySelector('button');

    const toggleChat = () => {
        const isHidden = modal.classList.contains('hidden');
        if (isHidden) {
            modal.classList.remove('hidden');
            // Small timeout to allow display:block to apply before opacity transition
            setTimeout(() => {
                modal.classList.remove('scale-90', 'opacity-0');
            }, 10);
            input.focus();
        } else {
            modal.classList.add('scale-90', 'opacity-0');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        }
    };

    fab.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);

    const addMessage = (text, isUser = false) => {
        const div = document.createElement('div');
        div.className = isUser
            ? 'bg-primary/20 self-end rounded-lg rounded-tr-none p-sm max-w-[80%]'
            : 'bg-white/10 self-start rounded-lg rounded-tl-none p-sm max-w-[80%]';
        div.innerHTML = `<p class="text-sm text-white">${text}</p>`;
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
        loadingDiv.className = 'bg-white/10 self-start rounded-lg rounded-tl-none p-sm max-w-[80%]';
        loadingDiv.innerHTML = '<div class="flex gap-xs"><div class="w-2 h-2 bg-white/50 rounded-full animate-bounce"></div><div class="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-75"></div><div class="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-150"></div></div>';
        messages.appendChild(loadingDiv);
        messages.scrollTop = messages.scrollHeight;

        try {
            const ai = new AIRecommender();
            const currentTrip = store.getTrip();

            // Check if we have a trip. If not, create a dummy one or handle it.
            // For now assume user has at least started one, or we send an empty object.
            const tripToSend = currentTrip || { destination: 'Unknown', type: 'Any', budget: { estimated: { min: 0, max: 0 } }, itinerary: [], checklist: [] };

            const updatedTrip = await ai.fetchSmartUpdate(tripToSend, text);

            messages.removeChild(loadingDiv);

            if (updatedTrip) {
                store.setTripDetails(updatedTrip);
                addMessage("I've updated your trip plan! Check the dashboard.");
            } else {
                addMessage("I couldn't reach the brain (API). Are you online / is key set?");
            }
        } catch (err) {
            messages.removeChild(loadingDiv);
            addMessage("Sorry, something went wrong.");
            console.error(err);
        } finally {
            sendBtn.disabled = false;
        }
    });

    return container;
}
