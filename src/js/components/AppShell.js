import { Navigation } from './Navigation.js';

export function AppShell() {
    const shell = document.createElement('div');
    shell.className = 'app-shell';

    shell.innerHTML = `
        <header class="app-header glass-panel">
            <div class="header-content flex items-center justify-between p-md">
                <span class="logo text-gradient font-bold">TravelAssist</span>
                <button class="icon-btn"><i class="ph ph-gear"></i></button>
            </div>
        </header>

        <main id="main-content" class="p-md animate-fade-in">
            <!-- Router Outlet -->
        </main>
    `;

    const nav = Navigation();
    shell.appendChild(nav);

    return shell;
}
