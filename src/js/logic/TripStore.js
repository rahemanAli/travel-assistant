import { generateChecklist } from './checklistGenerator.js';
import { AIRecommender } from './AIRecommender.js';

const ai = new AIRecommender();

export class TripStore {
    constructor() {
        this.trip = this.loadFromStorage() || null;
        this.listeners = [];
    }

    loadFromStorage() {
        const data = localStorage.getItem('travel_assistant_trip');
        return data ? JSON.parse(data) : null;
    }

    saveToStorage() {
        localStorage.setItem('travel_assistant_trip', JSON.stringify(this.trip));
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(listener => listener(this.trip));
    }

    setTripDetails(details) {
        this.trip = {
            ...this.trip,
            destination: details.destination,
            startDate: details.startDate,
            endDate: details.endDate,
            type: details.type, // 'leisure', 'business', 'adventure'
            vibe: details.vibe || [],
            checklist: generateChecklist(details, ai.getWeather(details.destination)),
            itinerary: ai.generateItinerary(details),
            recommendations: ai.generateRecommendations(details),
            insights: ai.generateInsights(details),
            itinerary: ai.generateItinerary(details),
            recommendations: ai.generateRecommendations(details),
            insights: ai.generateInsights(details),
            budget: {
                total: 0,
                currency: 'USD',
                expenses: [],
                estimated: ai.calculateBudget(details) // Store estimation
            },
            createdAt: new Date().toISOString()
        };
        this.saveToStorage();
        this.notify();
    }

    toggleChecklistItem(itemId) {
        if (!this.trip) return;

        this.trip.checklist = this.trip.checklist.map(item =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
        );
        this.saveToStorage();
        this.notify();
    }

    addChecklistItem(text, category = 'Custom') {
        if (!this.trip) return;

        const newItem = {
            id: `custom-${Math.random().toString(36).substr(2, 9)}`,
            text,
            category,
            checked: false
        };

        this.trip.checklist.push(newItem);
        this.saveToStorage();
        this.notify();
    }

    addItineraryItem(item) {
        if (!this.trip) return;

        const newItem = {
            id: `itin-${Math.random().toString(36).substr(2, 9)}`,
            ...item
        };

        // Ensure array exists
        if (!this.trip.itinerary) this.trip.itinerary = [];

        this.trip.itinerary.push(newItem);
        // Sort by date/time
        this.trip.itinerary.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));

        this.saveToStorage();
        this.notify();
    }

    deleteItineraryItem(id) {
        if (!this.trip) return;
        this.trip.itinerary = this.trip.itinerary.filter(i => i.id !== id);
        this.saveToStorage();
        this.notify();
    }

    setBudgetTotal(amount, currency = 'USD') {
        if (!this.trip) return;
        if (!this.trip.budget) this.trip.budget = { total: 0, currency, expenses: [] };

        this.trip.budget.total = parseFloat(amount);
        this.trip.budget.currency = currency;
        this.saveToStorage();
        this.notify();
    }

    addExpense(expense) {
        if (!this.trip) return;
        if (!this.trip.budget) this.trip.budget = { total: 0, currency: 'USD', expenses: [] };

        const newExpense = {
            id: `exp-${Math.random().toString(36).substr(2, 9)}`,
            amount: parseFloat(expense.amount),
            description: expense.description,
            category: expense.category,
            date: new Date().toISOString()
        };

        this.trip.budget.expenses.push(newExpense);
        this.saveToStorage();
        this.notify();
    }

    deleteExpense(id) {
        if (!this.trip || !this.trip.budget) return;
        this.trip.budget.expenses = this.trip.budget.expenses.filter(e => e.id !== id);
        this.saveToStorage();
        this.notify();
    }

    getTrip() {
        return this.trip;
    }

    clearTrip() {
        this.trip = null;
        localStorage.removeItem('travel_assistant_trip');
        this.notify();
    }
}

export const store = new TripStore();
