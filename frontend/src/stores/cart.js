import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
    state: () => ({
        items: [],
        remarks: '',
        isTakeaway: false,
    }),

    getters: {
        totalItems: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: (state) => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        consignationTotal: (state) => {
            if (!state.isTakeaway) return 0;
            return state.items.reduce((sum, item) => sum + (item.consignation_price || 0) * item.quantity, 0);
        },
        total() {
            return this.subtotal + this.consignationTotal;
        },
    },

    actions: {
        addItem(product) {
            const existing = this.items.find((i) => i.product_id === product.id);
            if (existing) {
                existing.quantity++;
            } else {
                this.items.push({
                    product_id: product.id,
                    name: product.name,
                    price: parseFloat(product.price),
                    consignation_price: parseFloat(product.consignation_price || 0),
                    quantity: 1,
                    image: product.image,
                });
            }
        },

        removeItem(productId) {
            this.items = this.items.filter((i) => i.product_id !== productId);
        },

        updateQuantity(productId, quantity) {
            const item = this.items.find((i) => i.product_id === productId);
            if (item) {
                item.quantity = Math.max(1, quantity);
            }
        },

        decrementItem(productId) {
            const item = this.items.find((i) => i.product_id === productId);
            if (item) {
                if (item.quantity > 1) {
                    item.quantity--;
                } else {
                    this.removeItem(productId);
                }
            }
        },

        clear() {
            this.items = [];
            this.remarks = '';
            this.isTakeaway = false;
        },
    },
});
