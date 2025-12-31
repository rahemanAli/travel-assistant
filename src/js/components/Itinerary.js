import { store } from '../logic/TripStore.js';

export function ItineraryComponent() {
    const trip = store.getTrip();

    if (!trip) {
        return `<div class="p-md text-center text-muted">Please plan a trip first.</div>`;
    }

    const container = document.createElement('div');
    container.className = 'w-full pb-xl';

    const itinerary = trip.itinerary || [];

    // Helper to get dates between start and end
    const getDaysArray = (start, end) => {
        for (var arr = [], dt = new Date(start); dt <= new Date(end); dt.setDate(dt.getDate() + 1)) {
            arr.push(new Date(dt));
        }
        return arr;
    };

    const days = getDaysArray(trip.startDate, trip.endDate);

    let html = `
        <div class="flex justify-between items-center mb-md">
            <h1 class="text-xl">Itinerary</h1>
            <button id="add-activity-btn" class="text-primary text-sm font-bold glass p-xs px-md rounded-full">
                + Add Activity
            </button>
        </div>
    `;

    // Render Timeline
    html += `<div class="timeline flex flex-col gap-lg pl-md border-l border-white/10 ml-sm">`;

    days.forEach((dateObj, index) => {
        const dateStr = dateObj.toISOString().split('T')[0];
        const dayActivities = itinerary.filter(i => i.date === dateStr);

        const isPast = dateObj < new Date().setHours(0, 0, 0, 0);
        const isToday = dateObj.toDateString() === new Date().toDateString();

        html += `
            <div class="timeline-day relative">
                <div class="timeline-dot ${isToday ? 'active' : ''}"></div>
                <h3 class="text-sm font-bold mb-sm flex items-center gap-sm ${isPast ? 'text-muted' : ''}">
                    ${dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    ${isToday ? '<span class="text-xs bg-primary text-white px-xs rounded-sm">Today</span>' : ''}
                </h3>

                <div class="flex flex-col gap-sm">
                    ${dayActivities.length > 0 ? dayActivities.map(activity => `
                        <div class="activity-card glass p-sm rounded-md flex gap-md relative">
                            <div class="w-16 text-center border-r border-white/10 pr-sm flex flex-col justify-center">
                                <span class="text-sm font-bold">${activity.time}</span>
                            </div>
                            <div class="flex-1">
                                <h4 class="font-bold text-sm">${activity.title}</h4>
                                <p class="text-xs text-muted">${activity.location || ''}</p>
                            </div>
                             <button class="delete-btn absolute top-2 right-2 text-muted hover:text-danger" data-id="${activity.id}">&times;</button>
                        </div>
                    `).join('') : `
                        <div class="text-xs text-muted italic p-sm border border-dashed border-white/10 rounded-md">
                            No activities planned
                        </div>
                    `}
                </div>
            </div>
        `;
    });

    html += `</div>`;

    // Add Activity Modal (hidden by default)
    html += `
        <dialog id="activity-modal" class="glass rounded-lg p-lg m-auto backdrop:bg-black/50" style="max-width: 90%; width: 400px; color: white;">
            <h2 class="text-lg font-bold mb-md">Add Activity</h2>
            <form id="activity-form" class="flex flex-col gap-md">
                <div class="form-group">
                    <label class="text-xs text-muted mb-xs block">Title</label>
                    <input type="text" name="title" class="w-full glass" required placeholder="e.g. Visit Museum">
                </div>
                <div class="form-group">
                    <label class="text-xs text-muted mb-xs block">Date</label>
                    <input type="date" name="date" class="w-full glass" required min="${trip.startDate}" max="${trip.endDate}" value="${trip.startDate}">
                </div>
                <div class="grid grid-cols-2 gap-md">
                     <div class="form-group">
                        <label class="text-xs text-muted mb-xs block">Time</label>
                        <input type="time" name="time" class="w-full glass" required>
                    </div>
                     <div class="form-group">
                        <label class="text-xs text-muted mb-xs block">Location (Optional)</label>
                        <input type="text" name="location" class="w-full glass">
                    </div>
                </div>
                <div class="flex justify-end gap-sm mt-md">
                    <button type="button" class="close-modal bg-transparent text-muted p-sm">Cancel</button>
                    <button type="submit" class="bg-primary text-white p-sm px-lg rounded-full">Add</button>
                </div>
            </form>
        </dialog>
    `;

    container.innerHTML = html;

    // Add Interactivity
    const modal = container.querySelector('#activity-modal');
    const form = container.querySelector('#activity-form');

    container.querySelector('#add-activity-btn').addEventListener('click', () => {
        modal.showModal();
    });

    container.querySelector('.close-modal').addEventListener('click', () => {
        modal.close();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        store.addItineraryItem({
            title: formData.get('title'),
            date: formData.get('date'),
            time: formData.get('time'),
            location: formData.get('location')
        });
        modal.close();
    });

    container.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (confirm('Remove this activity?')) {
                store.deleteItineraryItem(e.target.dataset.id);
            }
        });
    });

    return container;
}
