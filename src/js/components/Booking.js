export function BookingComponent() {
    const container = document.createElement('div');
    container.className = 'w-full pb-xl';

    container.innerHTML = `
        <h1 class="text-xl mb-md">Travel Assistant</h1>
        
        <div class="glass p-md rounded-md mb-lg">
            <h2 class="text-lg font-bold mb-sm text-primary">Find Best Deals</h2>
            <p class="text-sm text-muted mb-md">Quickly search for flights and hotels using our partner aggregators.</p>
            
            <div class="grid grid-cols-2 gap-md">
                <a href="https://www.google.com/travel/flights" target="_blank" class="glass p-md rounded-md flex flex-col items-center justify-center text-center hover:bg-white/5 transition">
                    <i class="ph ph-airplane-tilt text-3xl text-primary mb-sm"></i>
                    <span class="text-sm font-bold">Flights</span>
                </a>
                <a href="https://www.booking.com" target="_blank" class="glass p-md rounded-md flex flex-col items-center justify-center text-center hover:bg-white/5 transition">
                    <i class="ph ph-bed text-3xl text-secondary mb-sm"></i>
                    <span class="text-sm font-bold">Hotels</span>
                </a>
                <a href="https://www.airbnb.com" target="_blank" class="glass p-md rounded-md flex flex-col items-center justify-center text-center hover:bg-white/5 transition">
                    <i class="ph ph-house-line text-3xl text-accent mb-sm"></i>
                    <span class="text-sm font-bold">Stays</span>
                </a>
                <a href="https://www.rome2rio.com" target="_blank" class="glass p-md rounded-md flex flex-col items-center justify-center text-center hover:bg-white/5 transition">
                    <i class="ph ph-map-pin text-3xl text-success mb-sm"></i>
                    <span class="text-sm font-bold">Routes</span>
                </a>
            </div>
        </div>

        <div class="glass p-md rounded-md">
            <h2 class="text-lg font-bold mb-sm">Travel Tips</h2>
            <ul class="list-disc pl-md text-sm text-muted space-y-sm">
                <li>Check visa requirements for your destination early.</li>
                <li>Download offline maps before you travel.</li>
                <li>Notify your bank about your travel dates.</li>
                <li>Pack a universal travel adapter.</li>
            </ul>
        </div>
    `;

    return container;
}
