export const BASE_ITEMS = [
    { id: 'base-1', text: 'Passport / ID', category: 'Essentials', reason: 'Travel requirement' },
    { id: 'base-2', text: 'Wallet & Credit Cards', category: 'Essentials', reason: 'Payments' },
    { id: 'base-3', text: 'Phone & Charger', category: 'Electronics', reason: 'Communication' },
    { id: 'base-4', text: 'Toiletries Kit', category: 'Toiletries', reason: 'Hygiene' },
    { id: 'base-5', text: 'Underwear (Daily + Extra)', category: 'Clothing', reason: 'Daily Wear' },
    { id: 'base-6', text: 'Socks', category: 'Clothing', reason: 'Daily Wear' }
];

export const LEISURE_ITEMS = [
    { id: 'leis-1', text: 'Comfortable Walking Shoes', category: 'Clothing', reason: 'Walking Tours' },
    { id: 'leis-2', text: 'Camera', category: 'Electronics', reason: 'Capturing memories' },
    { id: 'leis-3', text: 'Sunglasses', category: 'Accessories', reason: 'Sun protection' }
];

export const BUSINESS_ITEMS = [
    { id: 'bus-1', text: 'Laptop & Charger', category: 'Electronics', reason: 'Work' },
    { id: 'bus-2', text: 'Formal Wear / Suit', category: 'Clothing', reason: 'Meetings' },
    { id: 'bus-3', text: 'Business Cards', category: 'Essentials', reason: 'Networking' }
];

export const ADVENTURE_ITEMS = [
    { id: 'adv-1', text: 'Hiking Boots', category: 'Clothing', reason: 'Trekking' },
    { id: 'adv-2', text: 'First Aid Kit', category: 'Essentials', reason: 'Safety' },
    { id: 'adv-3', text: 'Backpack / Daypack', category: 'Accessories', reason: 'Carrying gear' },
    { id: 'adv-4', text: 'Rain Jacket', category: 'Clothing', reason: 'Weather protection' }
];

// Simple keyword matching for demo purposes
export const WEATHER_MAPPINGS = {
    'cold': [
        { id: 'w-1', text: 'Heavy Coat', category: 'Clothing', reason: 'Cold Weather' },
        { id: 'w-2', text: 'Thermal Layers', category: 'Clothing', reason: 'Low Temperatures' },
        { id: 'w-3', text: 'Gloves & Beanie', category: 'Clothing', reason: 'Cold Weather' }
    ],
    'hot': [
        { id: 'w-4', text: 'Swimsuit', category: 'Clothing', reason: 'Beach/Pool' },
        { id: 'w-5', text: 'Sunscreen', category: 'Toiletries', reason: 'UV Protection' },
        { id: 'w-6', text: 'Hat / Cap', category: 'Accessories', reason: 'Sun' }
    ],
    'rain': [
        { id: 'w-7', text: 'Umbrella', category: 'Accessories', reason: 'Rainy Forecast' },
        { id: 'w-8', text: 'Waterproof Shoes', category: 'Clothing', reason: 'Rainy Forecast' }
    ]
};

export function generateChecklist(tripDetails, weather = null) {
    const days = Math.ceil((new Date(tripDetails.endDate) - new Date(tripDetails.startDate)) / (1000 * 60 * 60 * 24));

    let items = [...BASE_ITEMS];

    // Smart Quantities Logic
    const underwearCount = days + 2;
    const socksCount = days + 2;

    // Update base items with quantities
    items = items.map(item => {
        if (item.text.includes('Underwear')) return { ...item, text: `Underwear (${underwearCount} pairs)` };
        if (item.text.includes('Socks')) return { ...item, text: `Socks (${socksCount} pairs)` };
        return item;
    });

    // Add items based on trip type
    if (tripDetails.type === 'leisure') items = [...items, ...LEISURE_ITEMS];
    if (tripDetails.type === 'business') items = [...items, ...BUSINESS_ITEMS];
    if (tripDetails.type === 'adventure') items = [...items, ...ADVENTURE_ITEMS];

    // Basic keyword checking in destination
    const dest = tripDetails.destination.toLowerCase();

    if (dest.includes('beach') || dest.includes('hawaii') || dest.includes('cancun')) {
        items = [...items, ...WEATHER_MAPPINGS['hot']];
    }

    if (dest.includes('snow') || dest.includes('alps') || dest.includes('winter')) {
        items = [...items, ...WEATHER_MAPPINGS['cold']];
    }

    if (dest.includes('london') || dest.includes('seattle')) {
        items = [...items, ...WEATHER_MAPPINGS['rain']];
    }

    // Dynamic Weather Logic (from AI) - SCANS ALL CITIES in multi-city
    // Assumes 'weather' passed might be array or single object. 
    // If it's single (from earlier implementation), wraps it. 
    // Actually TripStore calls ai.getWeather(destination).
    // If destination is "Tokyo, Kyoto", getWeather should ideally handle it or we passed array?
    // In TripStore we updated: checklist: generateChecklist(details, ai.getWeather(details.destination)),
    // ai.getWeather only handles one city string. 
    // We should fix this in the next steps, but currently let's handle what we have.

    if (weather) {
        const cond = weather.condition ? weather.condition.toLowerCase() : '';
        if (cond.includes('rain') || cond.includes('cloudy')) {
            items = [...items, ...WEATHER_MAPPINGS['rain']];
        }
        if (cond.includes('sun') || cond.includes('hot')) {
            items = [...items, ...WEATHER_MAPPINGS['hot']];
        }
    }

    // Intent-based Logic
    const intent = tripDetails.intent ? tripDetails.intent.toLowerCase() : '';

    if (intent.includes('hiking') || intent.includes('trek')) {
        items.push({ id: 'int-1', text: 'Hiking Boots', category: 'Clothing', reason: 'Hiking Intent' });
        items.push({ id: 'int-2', text: 'Water Bottle', category: 'Accessories', reason: 'Hiking Intent' });
    }
    if (intent.includes('dinner') || intent.includes('formal') || intent.includes('date')) {
        items.push({ id: 'int-3', text: 'Formal/Evening Wear', category: 'Clothing', reason: 'Formal Plans' });
    }
    if (intent.includes('swim') || intent.includes('pool')) {
        items.push({ id: 'int-4', text: 'Swimsuit', category: 'Clothing', reason: 'Swimming Intent' });
    }

    // Deduplicate just in case
    return items.filter((item, index, self) =>
        index === self.findIndex((t) => (
            t.text === item.text
        ))
    ).map(item => ({
        ...item,
        checked: false,
        id: item.id || `gen-${Math.random().toString(36).substr(2, 9)}`
    }));
}
