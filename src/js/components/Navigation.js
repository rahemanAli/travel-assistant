export function Navigation() {
    const nav = document.createElement('nav');
    nav.className = 'navigation glass shadow-2xl border border-white/10 backdrop-blur-xl';

    const activeRoute = window.location.hash || '#/';

    const navItems = [
        { href: '#/', icon: 'ph-house', label: 'Home' },
        { href: '#/itinerary', icon: 'ph-calendar', label: 'Plan' },
        { href: '#/chat', icon: 'ph-sparkle', label: 'AI', special: true },
        { href: '#/explore', icon: 'ph-compass', label: 'Find' },
        { href: '#/checklist', icon: 'ph-suitcase', label: 'Pack' }
    ];

    nav.innerHTML = navItems.map(link => `
        <a href="${link.href}" class="nav-link ${activeRoute === link.href ? 'active' : ''} ${link.special ? 'special-nav-btn' : ''}">
            <i class="ph ${link.icon}"></i>
            ${link.label ? `<span>${link.label}</span>` : ''}
        </a>
    `).join('');

    return nav;
};
