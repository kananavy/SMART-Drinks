import { defineStore } from 'pinia';

export const useToastStore = defineStore('toast', {
    state: () => ({
        toasts: [],
    }),

    actions: {
        show(message, type = 'info', duration = 4000) {
            const id = Date.now();
            this.toasts.push({ id, message, type });
            setTimeout(() => {
                this.toasts = this.toasts.filter((t) => t.id !== id);
            }, duration);
        },
        success(message) { this.show(message, 'success'); },
        error(message) { this.show(message, 'error'); },
        info(message) { this.show(message, 'info'); },
    },
});
