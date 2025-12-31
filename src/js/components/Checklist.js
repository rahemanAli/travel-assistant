import { store } from '../logic/TripStore.js';

export function ChecklistComponent() {
    const trip = store.getTrip();

    if (!trip) {
        return `<div class="p-md text-center text-muted">Please plan a trip first.</div>`;
    }

    const container = document.createElement('div');
    container.className = 'w-full pb-xl'; // padding bottom for fab

    // Group items by category
    const items = trip.checklist || [];
    const grouped = items.reduce((acc, item) => {
        acc[item.category] = acc[item.category] || [];
        acc[item.category].push(item);
        return acc;
    }, {});

    // Overall Progress
    const total = items.length;
    const completed = items.filter(i => i.checked).length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    let html = `
        <div class="flex justify-between items-end mb-md">
            <div>
                <h1 class="text-xl">Checklist</h1>
                <p class="text-xs text-muted">${completed} of ${total} items packed</p>
            </div>
            <div class="glass p-xs rounded-full">
                <span class="text-xs font-bold text-primary px-sm">${progress}%</span>
            </div>
        </div>

        <div class="progress-bar-bg w-full h-1 bg-white/10 rounded-full mb-lg overflow-hidden">
            <div class="h-full bg-gradient-to-r from-cyan-400 to-blue-500" style="width: ${progress}%; background: var(--gradient-primary); transition: width 0.3s ease;"></div>
        </div>
    `;

    // Render Groups
    Object.keys(grouped).forEach(category => {
        html += `
            <div class="mb-md">
                <h3 class="text-sm text-primary mb-sm uppercase tracking-wider font-bold opacity-80">${category}</h3>
                <div class="flex flex-col gap-sm">
                    ${grouped[category].map(item => `
                <label class="checklist-item glass p-md rounded-md flex items-center gap-md cursor-pointer ${item.checked ? 'checked' : ''}" data-id="${item.id}">
                    <div class="checkbox ${item.checked ? 'active' : ''} flex-shrink-0">
                        ${item.checked ? '<i class="ph ph-check text-white text-xs"></i>' : ''}
                    </div>
                    <div class="flex flex-col">
                        <span class="text-sm ${item.checked ? 'line-through text-muted' : ''}">${item.text}</span>
                        ${item.reason ? `<span class="text-[10px] text-muted italic">${item.reason}</span>` : ''}
                    </div>
                </label>
                    `).join('')}
                </div>
            </div>
        `;
    });

    html += `
        <button id="add-item-btn" class="fab glass">
            <i class="ph ph-plus text-xl text-primary"></i>
        </button>
    `;

    container.innerHTML = html;

    // Add interactivity
    container.querySelectorAll('.checklist-item').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent double toggling if label wraps input
            const id = el.dataset.id;
            store.toggleChecklistItem(id);
        });
    });

    const fab = container.querySelector('#add-item-btn');
    if (fab) {
        fab.addEventListener('click', () => {
            const text = prompt("What item would you like to add?");
            if (text) {
                store.addChecklistItem(text);
            }
        });
    }

    return container;
}
