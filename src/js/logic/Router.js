export class Router {
    constructor(routes) {
        this.routes = routes;
        this.currentRoute = null;
        this.appContainer = document.querySelector('#main-content');

        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute(); // Handle initial load
    }

    handleRoute() {
        const hash = window.location.hash || '#/';
        const route = this.routes[hash] || this.routes['#/'];

        if (this.currentRoute === route) return;
        this.currentRoute = route;

        this.render();
        this.updateActiveLink(hash);
    }

    render() {
        if (this.currentRoute && this.appContainer) {
            this.appContainer.innerHTML = '';
            // If the route is a function (component), call it
            // Ideally components return a DOM element or string
            const view = this.currentRoute();
            if (typeof view === 'string') {
                this.appContainer.innerHTML = view;
            } else if (view instanceof HTMLElement) {
                this.appContainer.appendChild(view);
            }
        }
    }

    updateActiveLink(hash) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === hash) {
                link.classList.add('active');
            }
        });
    }
}
