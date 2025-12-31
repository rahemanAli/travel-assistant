import { store } from '../logic/TripStore.js';

// Mock DB for autocomplete
const MOCK_CITIES = [
    'Tokyo, Japan', 'Kyoto, Japan', 'Osaka, Japan',
    'Paris, France', 'London, UK', 'New York, USA',
    'Seoul, South Korea', 'Bangkok, Thailand', 'Barcelona, Spain',
    'Rome, Italy', 'Berlin, Germany', 'Amsterdam, Netherlands',
    'Singapore', 'Dubai, UAE', 'Los Angeles, USA'
];

export function TripSetupForm() {
    const container = document.createElement('div');
    container.className = 'trip-setup-form animate-fade-in';

    container.innerHTML = `
        <h2 class="text-xl mb-md text-gradient">Plan Your Next Adventure</h2>
        <form id="setup-form" class="flex flex-col gap-md">
            <div class="form-group relative">
                <label class="text-xs text-muted mb-sm block">Destinations (Type & Select)</label>
                
                <div id="selected-tags" class="flex flex-wrap gap-xs mb-xs"></div>
                
                <input type="text" id="city-input" placeholder="Search cities..." class="w-full glass" autocomplete="off">
                
                <div id="autocomplete-list" class="absolute w-full mt-1 glass rounded-md hidden max-h-40 overflow-y-auto z-50"></div>
                <input type="hidden" name="destination" id="final-destination">
            </div>
            
            <div class="grid grid-cols-2 gap-md">
                <div class="form-group">
                    <label class="text-xs text-muted mb-sm block">Start Date</label>
                    <input type="date" name="startDate" class="w-full glass" required>
                </div>
                <div class="form-group">
                    <label class="text-xs text-muted mb-sm block">End Date</label>
                    <input type="date" name="endDate" class="w-full glass" required>
                </div>
            </div>

            <div class="form-group">
                <label class="text-xs text-muted mb-sm block">Trip Type</label>
                <div class="trip-type-selector grid grid-cols-3 gap-sm">
                    <label class="type-option glass p-md flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all hover:bg-white/10 active:scale-95 border border-transparent">
                        <input type="radio" name="type" value="leisure" checked class="hidden">
                        <div class="bg-primary/20 p-xs rounded-full mb-xs"><i class="ph ph-sun text-xl text-primary"></i></div>
                        <span class="text-xs font-bold text-white">Leisure</span>
                    </label>
                    <label class="type-option glass p-md flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all hover:bg-white/10 active:scale-95 border border-transparent">
                        <input type="radio" name="type" value="business" class="hidden">
                        <div class="bg-secondary/20 p-xs rounded-full mb-xs"><i class="ph ph-briefcase text-xl text-secondary"></i></div>
                        <span class="text-xs font-bold text-white">Business</span>
                    </label>
                    <label class="type-option glass p-md flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all hover:bg-white/10 active:scale-95 border border-transparent">
                        <input type="radio" name="type" value="adventure" class="hidden">
                        <div class="bg-accent/20 p-xs rounded-full mb-xs"><i class="ph ph-mountains text-xl text-accent"></i></div>
                        <span class="text-xs font-bold text-white">Adventure</span>
                    </label>
                </div>
            </div>

            <div class="form-group">
                <label class="text-xs text-muted mb-sm block">What's the Vibe? (Select all that apply)</label>
                <div class="vibe-selector grid grid-cols-3 gap-sm">
                    <label class="vibe-option glass p-sm flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all hover:bg-white/10 border border-transparent">
                        <input type="checkbox" name="vibe" value="Foodie" class="hidden">
                        <span class="text-xl mb-1">🍜</span>
                        <span class="text-[10px] font-bold tracking-wide uppercase text-muted">Foodie</span>
                    </label>
                    <label class="vibe-option glass p-sm flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all hover:bg-white/10 border border-transparent">
                        <input type="checkbox" name="vibe" value="History" class="hidden">
                        <span class="text-xl mb-1">⛩️</span>
                        <span class="text-[10px] font-bold tracking-wide uppercase text-muted">History</span>
                    </label>
                    <label class="vibe-option glass p-sm flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all hover:bg-white/10 border border-transparent">
                        <input type="checkbox" name="vibe" value="Nature" class="hidden">
                        <span class="text-xl mb-1">🌿</span>
                        <span class="text-[10px] font-bold tracking-wide uppercase text-muted">Nature</span>
                    </label>
                     <label class="vibe-option glass p-sm flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all hover:bg-white/10 border border-transparent">
                        <input type="checkbox" name="vibe" value="Urban" class="hidden">
                        <span class="text-xl mb-1">🏙️</span>
                        <span class="text-[10px] font-bold tracking-wide uppercase text-muted">Urban</span>
                    </label>
                    <label class="vibe-option glass p-sm flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all hover:bg-white/10 border border-transparent">
                        <input type="checkbox" name="vibe" value="Chill" class="hidden">
                        <span class="text-xl mb-1">🧘</span>
                        <span class="text-[10px] font-bold tracking-wide uppercase text-muted">Chill</span>
                    </label>
                     <label class="vibe-option glass p-sm flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all hover:bg-white/10 border border-transparent">
                        <input type="checkbox" name="vibe" value="Adventure" class="hidden">
                        <span class="text-xl mb-1">🎢</span>
                        <span class="text-[10px] font-bold tracking-wide uppercase text-muted">Thrills</span>
                    </label>
                </div>
            </div>

            <div class="form-group">
                <label class="text-xs text-muted mb-sm block">What's the plan? (Optional)</label>
                <textarea name="intent" rows="3" placeholder="e.g. Planning a romantic dinner, maybe some hiking, and lots of shopping!" class="w-full glass text-sm p-sm rounded-md" style="resize: none;"></textarea>
            </div>

            <button type="submit" class="primary-btn mt-md p-md rounded-full font-bold shadow-lg">
                Create My Trip
            </button>
        </form>
    `;

    // --- Logic for Autocomplete Tags ---
    const cityInput = container.querySelector('#city-input');
    const autocompleteList = container.querySelector('#autocomplete-list');
    const selectedTagsContainer = container.querySelector('#selected-tags');
    const finalDestinationInput = container.querySelector('#final-destination');

    let selectedCities = [];

    function renderTags() {
        selectedTagsContainer.innerHTML = '';
        selectedCities.forEach((city, index) => {
            const tag = document.createElement('div');
            tag.className = 'glass px-sm py-xs rounded-full flex items-center gap-xs text-xs';
            tag.innerHTML = `
                <span>${city}</span>
                <i class="ph ph-x cursor-pointer hover:text-danger" data-index="${index}"></i>
            `;
            tag.querySelector('i').addEventListener('click', () => {
                removeCity(index);
            });
            selectedTagsContainer.appendChild(tag);
        });
        finalDestinationInput.value = selectedCities.join(', ');
    }

    function addCity(city) {
        if (!selectedCities.includes(city)) {
            selectedCities.push(city);
            renderTags();
        }
        cityInput.value = '';
        autocompleteList.classList.add('hidden');
    }

    function removeCity(index) {
        selectedCities.splice(index, 1);
        renderTags();
    }

    cityInput.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase();
        autocompleteList.innerHTML = '';

        if (val.length < 1) {
            autocompleteList.classList.add('hidden');
            return;
        }

        const matches = MOCK_CITIES.filter(c => c.toLowerCase().includes(val));

        if (matches.length > 0) {
            matches.forEach(city => {
                const item = document.createElement('div');
                item.className = 'p-sm hover:bg-white/10 cursor-pointer text-sm border-b border-glass last:border-0';
                item.textContent = city;
                item.addEventListener('click', () => addCity(city));
                autocompleteList.appendChild(item);
            });
            autocompleteList.classList.remove('hidden');
        } else {
            autocompleteList.classList.add('hidden');
        }
    });

    // Close list if clicked outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.form-group.relative')) {
            autocompleteList.classList.add('hidden');
        }
    });


    // --- Existing Logic ---
    const form = container.querySelector('#setup-form');
    const typeOptions = container.querySelectorAll('.type-option');

    typeOptions.forEach(option => {
        option.addEventListener('click', () => {
            typeOptions.forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
        });
    });
    typeOptions[0].classList.add('selected');

    const vibeOptions = container.querySelectorAll('.vibe-option');
    vibeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const input = option.querySelector('input');
            if (input.checked) option.classList.add('selected');
            else option.classList.remove('selected');
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const vibes = Array.from(formData.getAll('vibe'));

        // Use selectedTags logic
        const stops = selectedCities;
        const rawDest = selectedCities.join(', ');

        if (stops.length === 0) {
            alert('Please select at least one city!');
            return;
        }

        const details = {
            destination: rawDest,
            stops: stops,
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            type: formData.get('type'),
            vibe: vibes.length > 0 ? vibes : ['All'],
            intent: formData.get('intent') || ''
        };

        store.setTripDetails(details);
    });

    return container;
}
