import { AppShell } from './components/AppShell.js';
import { Router } from './logic/Router.js';
import { store } from './logic/TripStore.js';
import { TripSetupForm } from './components/TripSetupForm.js';
import { ChecklistComponent } from './components/Checklist.js';
import { ItineraryComponent } from './components/Itinerary.js';
import { BudgetComponent } from './components/Budget.js';
import { ExploreComponent } from './components/Explore.js';

// Vertical Stack Layout - No Carousel
const HomeView = () => {
    const trip = store.getTrip();

    if (!trip) {
        return TripSetupForm();
    }

    const daysUntil = Math.ceil((new Date(trip.startDate) - new Date()) / (1000 * 60 * 60 * 24));

    return `
    <div class="flex flex-col animate-fade-in pb-xxl" style="gap: 2.5rem;">
        <div>
            <h1 class="text-xl mb-lg pl-xs font-bold tracking-wide">Upcoming Trips</h1>
            <div class="glass p-lg rounded-md shadow-lg">
                <div class="flex justify-between items-center mb-md">
                    <h3 class="text-primary font-bold text-2xl">${trip.destination}</h3>
                    <span class="text-xs text-muted bg-white/10 px-md py-xs rounded-full border border-white/5 shadow-sm">${daysUntil > 0 ? `${daysUntil} Days away` : 'Happening Now'}</span>
                </div>
                <p class="text-sm text-text-main capitalize mb-lg flex items-center gap-sm opacity-90">
                    <div class="bg-primary/20 p-xs rounded-full"><i class="ph ph-suitcase-simple text-primary"></i></div>
                    ${trip.type} Trip • ${new Date(trip.startDate).toLocaleDateString()}
                </p>
                
                <div class="mt-xl">
                    <div class="flex justify-between mb-xs text-xs text-muted">
                        <span>Trip Progress</span>
                        <span>0%</span>
                    </div>
                    <div class="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div style="width: 5%; height: 100%; background: var(--gradient-primary); border-radius: 99px;"></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="w-full h-px bg-white/5"></div>

        ${trip.insights && trip.insights.length > 0 ? `
            <div>
                 <h2 class="text-lg mb-lg pl-xs text-secondary font-bold flex items-center gap-sm">
                    <i class="ph ph-sparkle text-secondary"></i>
                    City Insights
                 </h2>
                 
                 <div class="flex flex-col gap-lg">
                    ${trip.insights.map(insight => `
                        <div class="glass p-lg rounded-md shadow-md hover:bg-white/5 transition-colors">
                            <div class="flex justify-between items-start mb-md">
                                <h3 class="font-bold text-xl text-white">${insight.city}</h3>
                                <div class="flex items-center gap-xs bg-white/5 px-sm py-xs rounded-lg">
                                    <i class="ph ph-cloud-sun text-xl text-warning"></i>
                                    <span class="font-bold text-lg">${insight.weather.temp}</span>
                                </div>
                            </div>
                            <p class="text-sm italic text-muted mb-lg leading-relaxed border-l-2 border-primary/30 pl-md">"${insight.commentary}"</p>
                            
                            <div class="flex flex-col gap-sm bg-black/20 p-md rounded-md">
                                 ${insight.tips.map(tip => `
                                    <div class="flex gap-sm items-start text-xs text-muted">
                                        <i class="ph ph-lightbulb text-accent text-sm mt-[2px]"></i>
                                        <span>${tip}</span>
                                    </div>
                                 `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
        
        <div class="mt-lg">
            <button id="reset-trip-btn" class="w-full glass p-lg rounded-md flex items-center justify-center gap-sm text-danger hover:bg-danger/10 transition-colors border border-dashed border-danger/30">
                <i class="ph ph-trash text-xl"></i>
                <span class="font-bold">Reset / Plan New Trip</span>
            </button>
        </div>
    </div>
    `;
};

const ChecklistView = () => {
    return ChecklistComponent();
};

const ItineraryView = () => {
    return ItineraryComponent();
};

const BudgetView = () => {
    return BudgetComponent();
};

document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');

    // Initialize App Shell
    app.appendChild(AppShell());

    // Initialize Chat Overlay
    import { ChatOverlay } from './components/ChatOverlay.js';
    app.appendChild(ChatOverlay());

    // Initialize Router
    const router = new Router({
        '#/': HomeView,
        '#/checklist': ChecklistView,
        '#/itinerary': ItineraryView,
        '#/budget': BudgetView,
        '#/explore': () => ExploreComponent()
    });

    // Handle Store updates (re-render current view if needed)
    store.subscribe(() => {
        router.render();
    });

    // Global event delegation for generic actions
    document.addEventListener('click', (e) => {
        if (e.target.closest('#reset-trip-btn')) {
            if (confirm('Are you sure you want to delete this trip and start over?')) {
                store.clearTrip();
            }
        }

        if (e.target.closest('#prev-slide')) {
            if (currentInsightIndex > 0) {
                currentInsightIndex--;
                router.render(); // Re-render to update UI and index
            }
        }

        if (e.target.closest('#next-slide')) {
            const trip = store.getTrip();
            if (trip && trip.insights && currentInsightIndex < trip.insights.length - 1) {
                currentInsightIndex++;
                router.render();
            }
        }
    });

    // Register Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('SW registered', reg))
            .catch(err => console.log('SW registration failed', err));
    }
});
