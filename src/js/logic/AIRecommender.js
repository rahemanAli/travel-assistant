export class AIRecommender {
    constructor() {
        // Mock data base for "AI" knowledge
        this.activitiesDB = {
            'tokyo': [
                { title: 'Senso-ji Temple', type: 'Culture', vibe: 'History', time: 'Morning' },
                { title: 'Shibuya Crossing', type: 'Sightseeing', vibe: 'Urban', time: 'Night' },
                { title: 'Tsukiji Outer Market', type: 'Food', vibe: 'Foodie', time: 'Morning' },
                { title: 'TeamLab Planets', type: 'Art', vibe: 'Modern', time: 'Afternoon' }
            ],
            'kyoto': [
                { title: 'Fushimi Inari Shrine', type: 'Culture', vibe: 'History', time: 'Morning' },
                { title: 'Arashiyama Bamboo Grove', type: 'Nature', vibe: 'Chill', time: 'Afternoon' },
                { title: 'Kinkaku-ji', type: 'Culture', vibe: 'History', time: 'Morning' }
            ],
            'osaka': [
                { title: 'Dotonbori', type: 'Food', vibe: 'Foodie', time: 'Night' },
                { title: 'Universal Studios', type: 'Fun', vibe: 'Adventure', time: 'All Day' }
            ],
            'paris': [
                { title: 'Eiffel Tower', type: 'Sightseeing', vibe: 'Romantic', time: 'Night' },
                { title: 'Louvre Museum', type: 'Art', vibe: 'History', time: 'Morning' }
            ]
        };

        this.weatherDB = {
            'tokyo': { temp: '15°C', condition: 'Partly Cloudy', summary: 'Perfect for walking.' },
            'kyoto': { temp: '14°C', condition: 'Sunny', summary: 'Great for temple visits.' },
            'osaka': { temp: '16°C', condition: 'Rain', summary: 'Bring an umbrella!' },
            'paris': { temp: '12°C', condition: 'Cloudy', summary: 'A bit chilly.' },
            'default': { temp: '20°C', condition: 'Sunny', summary: 'Pack sunscreen!' }
        };
    }

    getWeather(city) {
        if (!city) return this.weatherDB['default'];
        const key = city.split(',')[0].toLowerCase().trim();
        // Fallback for unknown cities
        if (!this.weatherDB[key]) {
            return { temp: '22°C', condition: 'Sunny', summary: 'Enjoy the weather!' };
        }
        return this.weatherDB[key];
    }

    generateInsights(details) {
        // Iterate over all stops
        const cities = details.stops.length > 0 ? details.stops : [details.destination];
        const intent = details.intent.toLowerCase();

        const insights = cities.map(city => {
            const weather = this.getWeather(city);
            let commentary = `Get ready for ${city}!`;

            if (intent.includes('romantic')) commentary = `Romantic vibes in ${city}.`;
            if (intent.includes('adventure')) commentary = `Adventure awaits in ${city}.`;

            return {
                city: city,
                weather: weather,
                commentary: commentary,
                tips: [
                    "Download offline maps.",
                    intent.includes('food') ? "Book dinner early." : "Check transport passes."
                ]
            };
        });

        return insights;
    }

    generateItinerary(details) {
        // Simple heuristic: distribute activities based on city and vibe match
        const days = Math.ceil((new Date(details.endDate) - new Date(details.startDate)) / (1000 * 60 * 60 * 24));
        const itinerary = [];
        const cities = details.stops.length > 0 ? details.stops : [details.destination.split(',')[0].trim()];

        let currentDate = new Date(details.startDate);
        const daysPerCity = Math.floor(days / cities.length);

        cities.forEach(city => {
            const cityKey = city.toLowerCase().trim();
            const potentialActivities = this.activitiesDB[cityKey] || [];

            // Filter by vibe if matches
            const vibeActivities = potentialActivities.filter(a =>
                details.vibe.includes(a.vibe) || details.vibe.includes('All')
            );

            // Fallback to all if no vibe match
            const actsToSchedule = vibeActivities.length > 0 ? vibeActivities : potentialActivities;

            // Schedule ~2 activities per day for this city
            for (let i = 0; i < daysPerCity; i++) {
                const dayActs = actsToSchedule.slice(i * 2, (i * 2) + 2);

                dayActs.forEach(act => {
                    itinerary.push({
                        id: `ai-${Math.random().toString(36).substr(2, 9)}`,
                        title: act.title,
                        date: currentDate.toISOString().split('T')[0],
                        time: act.time === 'Morning' ? '10:00' : (act.time === 'Afternoon' ? '14:00' : '19:00'),
                        location: city,
                        type: 'AI_GENERATED'
                    });
                });

                // Advance date
                currentDate.setDate(currentDate.getDate() + 1);
            }
        });

        // --- PRO ACTIVE AI INTENT INJECTION ---
        // We explicitly check the user's free-text intent and insert matching activities 
        // regardless of the city DB, to simulate "smart" understanding.
        // We calculate a random day within the trip range for these special events.

        const intent = details.intent.toLowerCase();

        const addIntentActivity = (title, type, vibe) => {
            // Pick a random day index
            const dayIndex = Math.floor(Math.random() * days);
            let date = new Date(details.startDate);
            date.setDate(date.getDate() + dayIndex);

            itinerary.push({
                id: `ai-intent-${Math.random().toString(36).substr(2, 9)}`,
                title: title,
                date: date.toISOString().split('T')[0],
                time: '18:00', // Default to evening
                location: cities[dayIndex % cities.length], // Assign to city of that day roughly
                type: 'AI_INTENT',
                vibe: vibe
            });
        };

        if (intent.includes('dinner') || intent.includes('romantic')) {
            addIntentActivity('Candlelit Dinner Reservation', 'Food', 'Romantic');
        }
        if (intent.includes('hike') || intent.includes('trek') || intent.includes('mountain')) {
            addIntentActivity('Sunrise Hike', 'Nature', 'Adventure');
        }
        if (intent.includes('shop')) {
            addIntentActivity('Afternoon Shopping Spree', 'Leisure', 'Urban');
        }
        if (intent.includes('museum') || intent.includes('art')) {
            addIntentActivity('Private Gallery Tour', 'Culture', 'History');
        }
        if (intent.includes('party') || intent.includes('club')) {
            addIntentActivity('VIP Nightclub Access', 'Nightlife', 'Urban');
        }

        // Resort by date/time to merge the new items correctly
        itinerary.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));

        return itinerary;
    }

    generateRecommendations(details) {
        const cities = details.stops.length > 0 ? details.stops : [details.destination];

        // Return a map of City -> { restaurants, experiences }
        const allRecs = {};

        cities.forEach(city => {
            const cityKey = city.split(',')[0].toLowerCase().trim();
            // Fallback Generator
            allRecs[city] = {
                restaurants: [
                    { name: `Top Rated in ${city}`, cuisine: 'Local Cuisine', rating: 4.7 },
                    { name: `${city} Street Food`, cuisine: 'Street Food', rating: 4.5 },
                    { name: 'The View Lounge', cuisine: 'International', rating: 4.4 }
                ],
                experiences: [
                    { title: `${city} Walking Tour`, duration: '3h' },
                    { title: 'Local Cooking Class', duration: '2h' },
                    { title: 'Historic Sites', duration: '4h' }
                ]
            };
        });

        return allRecs;
    }
    calculateBudget(details) {
        const days = Math.ceil((new Date(details.endDate) - new Date(details.startDate)) / (1000 * 60 * 60 * 24));
        const cities = details.stops.length > 0 ? details.stops : [details.destination];

        // Base cost per day (very rough heuristic)
        // Tokyo/London/Paris/NY = Expensive ($200/day)
        // Others = Moderate ($100/day)

        let dailyRate = 120;
        const expensiveCities = ['tokyo', 'london', 'paris', 'new york', 'singapore', 'dubai', 'zurich', 'iceland'];

        const isExpensive = cities.some(c => expensiveCities.some(ec => c.toLowerCase().includes(ec)));

        if (isExpensive) dailyRate = 220;
        if (details.type === 'leisure') dailyRate *= 1.2;
        if (details.type === 'adventure') dailyRate *= 0.8; // Maybe camping/hostels?

        const minTotal = Math.round(dailyRate * days * 0.8);
        const maxTotal = Math.round(dailyRate * days * 1.2);

        return { min: minTotal, max: maxTotal, currency: 'USD' };
    }

    async fetchSmartUpdate(currentTrip, prompt) {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentTrip, userPrompt: prompt })
            });

            if (!response.ok) {
                throw new Error('Server API failed');
            }

            const updatedTrip = await response.json();
            return updatedTrip;
        } catch (error) {
            console.warn('Backend API not available or failed. Falling back to local logic.', error);
            return null; // Signal that we should proceed with local logic
        }
    }
}
