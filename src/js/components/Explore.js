import { store } from '../logic/TripStore.js';

export function ExploreComponent() {
    const trip = store.getTrip();

    if (!trip || !trip.recommendations) {
        return `<div class="p-md text-center text-muted">Please plan a trip to get recommendations.</div>`;
    }

    const recommendationsByCity = trip.recommendations;
    const vibes = trip.vibe.join(', ');

    const container = document.createElement('div');
    container.className = 'w-full pb-xl animate-fade-in';

    let contentHtml = `
        <h1 class="text-xl mb-sm">Explore</h1>
        <p class="text-xs text-muted mb-lg">Curated for your <strong>${vibes}</strong> vibe.</p>
    `;

    // Iterate over each city
    Object.keys(recommendationsByCity).forEach((city, index) => {
        const { restaurants, experiences } = recommendationsByCity[city];

        // Generate a deterministic but varied gradient for each city header
        const hues = [
            'from-blue-500 to-purple-500',
            'from-emerald-400 to-cyan-500',
            'from-orange-400 to-pink-500',
            'from-indigo-400 to-blue-600'
        ];
        const gradientClass = hues[index % hues.length];

        contentHtml += `
            <div class="mb-xl">
                <div class="h-24 w-full rounded-md bg-gradient-to-r ${gradientClass} mb-md flex items-end p-md relative overflow-hidden" style="background: var(--gradient-primary); filter: hue-rotate(${index * 45}deg);">
                     <h2 class="text-2xl font-bold text-white relative z-10 text-shadow-sm">${city}</h2>
                     <i class="ph ph-map-pin text-6xl absolute -bottom-2 -right-2 text-white/20"></i>
                </div>
                
                <h3 class="text-sm font-bold mb-sm text-primary">Top Restaurants</h3>
                <div class="flex flex-col gap-md mb-lg">
                <div class="flex flex-col gap-md mb-lg">
                    ${restaurants.map(r => `
                        <a href="https://www.tripadvisor.com/Search?q=${encodeURIComponent(r.name + ' ' + city)}" target="_blank" class="glass p-md rounded-md flex justify-between items-center hover:bg-white/5 transition-colors no-underline" style="text-decoration: none; color: inherit;">
                            <div>
                                <h3 class="font-bold text-sm flex items-center gap-xs" style="color: var(--color-text-main);">
                                    ${r.name} 
                                    <i class="ph ph-arrow-square-out text-xs text-muted"></i>
                                </h3>
                                <span class="text-xs text-muted">${r.cuisine}</span>
                            </div>
                            <div class="flex items-center gap-xs text-warning">
                                <i class="ph ph-star-fill"></i>
                                <span class="text-sm font-bold">${r.rating}</span>
                            </div>
                        </a>
                    `).join('')}
                </div>

                <h3 class="text-sm font-bold mb-sm text-secondary">Experiences</h3>
                <div class="grid grid-cols-2 gap-md">
                    ${experiences.map(e => `
                        <a href="https://www.tripadvisor.com/Search?q=${encodeURIComponent(e.title + ' ' + city)}" target="_blank" class="glass p-md rounded-md flex flex-col items-center text-center hover:bg-white/5 transition-colors no-underline" style="text-decoration: none; color: inherit;">
                            <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-sm">
                                <i class="ph ph-compass text-xl text-secondary"></i>
                            </div>
                            <h3 class="font-bold text-sm mb-xs flex items-center gap-xs" style="color: var(--color-text-main);">
                                ${e.title}
                            </h3>
                            <span class="text-xs text-muted">${e.duration}</span>
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    });

    container.innerHTML = contentHtml;
    return container;

    return container;
}
