export function Navigation() {
    const nav = document.createElement('nav');
    nav.className = 'navigation glass';

    // CSS for navigation is specialized, adding inline for specific component style or we could move to global
    // Using inline style for positioning relative to the fixed bottom

    nav.innerHTML = `
        <a href="#/" class="nav-link active">
            <i class="ph ph-house"></i>
            <span>Home</span>
        </a>
        <a href="#/checklist" class="nav-link">
            <i class="ph ph-suitcase"></i>
            <span>Pack</span>
        </a>
        <a href="#/itinerary" class="nav-link">
            <i class="ph ph-map-trifold"></i>
            <span>Plan</span>
        </a>
        <a href="#/budget" class="nav-link">
            <i class="ph ph-wallet"></i>
            <span>Budget</span>
        </a>
        <a href="#/explore" class="nav-link">
            <i class="ph ph-compass"></i>
            <span>Explore</span>
        </a>
    `;

    return nav;
}
