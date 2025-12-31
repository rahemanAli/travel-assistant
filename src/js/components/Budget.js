import { store } from '../logic/TripStore.js';

export function BudgetComponent() {
    const trip = store.getTrip();

    if (!trip) {
        return `<div class="p-md text-center text-muted">Please plan a trip first.</div>`;
    }

    const container = document.createElement('div');
    container.className = 'w-full pb-xl';

    const budget = trip.budget || { total: 0, currency: 'USD', expenses: [] };
    const totalSpent = budget.expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const remaining = budget.total - totalSpent;
    const percentUsed = budget.total > 0 ? (totalSpent / budget.total) * 100 : 0;

    let html = `
        <h1 class="text-xl mb-md">Budget Planner</h1>
    `;

    // Overall Status Card
    if (budget.total === 0) {
        html += `
            <div class="glass p-lg rounded-md text-center mb-lg">
                <i class="ph ph-wallet text-xxl text-primary mb-sm"></i>
                <h3 class="mb-sm">Set your trip budget</h3>
                <p class="text-sm text-muted mb-md">Track expenses and stay on top of your spending.</p>
                ${budget.estimated ? `<p class="text-xs text-secondary mb-md bg-white/5 p-xs rounded inline-block">AI Estimate: $${budget.estimated.min} - $${budget.estimated.max}</p><br>` : ''}
                <button id="set-budget-btn" class="bg-primary text-white p-sm px-lg rounded-full font-bold">Set Budget</button>
            </div>
        `;
    } else {
        html += `
            <div class="glass p-lg rounded-md mb-lg relative overflow-hidden">
                <div class="flex justify-between items-end mb-xs relative z-10">
                    <div>
                        <span class="text-sm text-muted">Remaining</span>
                        <h2 class="text-2xl font-bold">${budget.currency} ${remaining.toFixed(2)}</h2>
                    </div>
                    <div class="text-right">
                         <span class="text-sm text-muted">Total Budget</span>
                         <p>${budget.currency} ${budget.total}</p>
                    </div>
                </div>
                
                <div class="w-full h-2 bg-white/10 rounded-full mt-md relative z-10">
                    <div class="h-full rounded-full ${percentUsed > 100 ? 'bg-danger' : 'bg-success'}" style="width: ${Math.min(percentUsed, 100)}%"></div>
                </div>

                <div class="flex justify-between mt-sm text-xs text-muted relative z-10">
                    <span>Spent: ${budget.currency} ${totalSpent.toFixed(2)}</span>
                    <span>${percentUsed.toFixed(0)}%</span>
                </div>
                
                <!-- Background Decoration -->
                <div class="absolute top-0 right-0 w-32 h-32 bg-primary blur-3xl opacity-10 rounded-full pointer-events-none"></div>
            </div>
            
            <button id="add-expense-btn" class="w-full glass p-md rounded-md flex items-center justify-center gap-sm text-primary mb-lg border-dashed">
                <i class="ph ph-plus-circle text-xl"></i>
                <span>Log Expense</span>
            </button>
        `;
    }

    // Expense List
    if (budget.expenses.length > 0) {
        html += `
            <h3 class="text-sm text-muted uppercase tracking-wider mb-sm font-bold">Transactions</h3>
            <div class="flex flex-col gap-sm">
                ${budget.expenses.slice().reverse().map(exp => `
                    <div class="glass p-md rounded-md flex justify-between items-center">
                        <div class="flex items-center gap-md">
                            <div class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                <i class="ph ph-receipt text-text-muted"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-sm">${exp.description}</h4>
                                <span class="text-xs text-muted">${exp.category}</span>
                            </div>
                        </div>
                        <span class="font-bold text-danger">- ${budget.currency} ${exp.amount.toFixed(2)}</span>
                        <button class="delete-expense text-muted hover:text-danger ml-sm" data-id="${exp.id}">&times;</button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Modal HTML (Shared for Set Budget and Add Expense)
    html += `
        <dialog id="budget-modal" class="glass rounded-lg p-lg m-auto backdrop:bg-black/50" style="width: 350px; color: white;">
            <h2 id="modal-title" class="text-lg font-bold mb-md">Set Budget</h2>
            <form id="budget-form" class="flex flex-col gap-md">
                <div id="total-input-group">
                    <label class="text-xs text-muted mb-xs block">Total Amount</label>
                    <input type="number" name="total" class="w-full glass" placeholder="0.00">
                </div>
                
                <div id="expense-inputs" class="hidden flex flex-col gap-md">
                    <div class="form-group">
                        <label class="text-xs text-muted mb-xs block">Description</label>
                        <input type="text" name="description" class="w-full glass" placeholder="e.g. Lunch">
                    </div>
                    <div class="form-group">
                        <label class="text-xs text-muted mb-xs block">Amount</label>
                        <input type="number" name="amount" class="w-full glass" placeholder="0.00">
                    </div>
                    <div class="form-group">
                        <label class="text-xs text-muted mb-xs block">Category</label>
                        <select name="category" class="w-full glass">
                            <option value="Food">Food & Drink</option>
                            <option value="Transport">Transport</option>
                            <option value="Accommodation">Accommodation</option>
                            <option value="Activity">Activity</option>
                            <option value="Shopping">Shopping</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                <div class="flex justify-end gap-sm mt-md">
                    <button type="button" class="close-modal bg-transparent text-muted p-sm">Cancel</button>
                    <button type="submit" class="bg-primary text-white p-sm px-lg rounded-full">Save</button>
                </div>
            </form>
        </dialog>
    `;

    container.innerHTML = html;

    // Interactivity
    const modal = container.querySelector('#budget-modal');
    const form = container.querySelector('#budget-form');
    const modalTitle = container.querySelector('#modal-title');
    const totalGroup = container.querySelector('#total-input-group');
    const expenseGroup = container.querySelector('#expense-inputs');

    let mode = 'set_total'; // or 'add_expense'

    const openModal = (newMode) => {
        mode = newMode;
        if (mode === 'set_total') {
            modalTitle.innerText = 'Set Total Budget';
            totalGroup.classList.remove('hidden');
            expenseGroup.classList.add('hidden');
            form.total.required = true;
            form.amount.required = false;
            form.description.required = false;
        } else {
            modalTitle.innerText = 'Add Expense';
            totalGroup.classList.add('hidden');
            expenseGroup.classList.remove('hidden');
            form.total.required = false;
            form.amount.required = true;
            form.description.required = true;
        }
        modal.showModal();
    };

    const setBtn = container.querySelector('#set-budget-btn');
    if (setBtn) setBtn.addEventListener('click', () => openModal('set_total'));

    const addBtn = container.querySelector('#add-expense-btn');
    if (addBtn) addBtn.addEventListener('click', () => openModal('add_expense'));

    container.querySelector('.close-modal').addEventListener('click', () => modal.close());

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        if (mode === 'set_total') {
            store.setBudgetTotal(formData.get('total'));
        } else {
            store.addExpense({
                description: formData.get('description'),
                amount: formData.get('amount'),
                category: formData.get('category')
            });
        }
        modal.close();
        form.reset();
    });

    container.querySelectorAll('.delete-expense').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (confirm('Remove this expense?')) {
                store.deleteExpense(e.target.dataset.id); // Note: data-id is on button, target might be icon if inside
            }
        });
    });

    return container;
}
