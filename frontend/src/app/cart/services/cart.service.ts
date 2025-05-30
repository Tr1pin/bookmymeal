import { Injectable, signal, computed } from '@angular/core';
import { CartItem } from '../interfaces/CartItem';
import { Product } from '../../products/interfaces/Product';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Private signal to hold cart items
  private cartItems = signal<CartItem[]>([]);

  // Public signals for readonly access
  public readonly items = this.cartItems.asReadonly();

  // Computed signal for the total number of items in the cart
  public readonly totalItemCount = computed(() => {
    return this.cartItems().reduce((total, item) => total + item.quantity, 0);
  });

  // Computed signal for the total price of items in the cart
  public readonly totalPrice = computed(() => {
    return this.cartItems().reduce((total, item) => {
      // Ensure product.precio is treated as a number
      const price = parseFloat(item.product.precio);
      return total + (price * item.quantity);
    }, 0);
  });

  constructor() {
    // Optional: Load cart from localStorage if you want persistence
    // const storedCart = localStorage.getItem('shoppingCart');
    // if (storedCart) {
    //   this.cartItems.set(JSON.parse(storedCart));
    // }
  }

  addItem(product: Product, quantity: number = 1): void {
    this.cartItems.update(currentItems => {
      const existingItemIndex = currentItems.findIndex(item => item.product.producto_id === product.producto_id);
      let updatedItems;

      if (existingItemIndex > -1) {
        // Product already in cart, update quantity
        updatedItems = currentItems.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      } else {
        // Product not in cart, add as new item
        updatedItems = [...currentItems, { product, quantity }];
      }
      return updatedItems;
    });
  }

  removeItem(productId: string): void {
    this.cartItems.update(currentItems => {
      const updatedItems = currentItems.filter(item => item.product.producto_id !== productId);
      return updatedItems;
    });
  }

  updateQuantity(productId: string, quantity: number): void {
    this.cartItems.update(currentItems => {
      if (quantity <= 0) {
        // If quantity is zero or less, remove the item
        return currentItems.filter(item => item.product.producto_id !== productId);
      }
      const updatedItems = currentItems.map(item => 
        item.product.producto_id === productId 
          ? { ...item, quantity: quantity } 
          : item
      );
      // Optional: Save to localStorage
      // localStorage.setItem('shoppingCart', JSON.stringify(updatedItems));
      return updatedItems;
    });
  }

  clearCart(): void {
    this.cartItems.set([]);
    // Optional: Save to localStorage
    // localStorage.removeItem('shoppingCart');
  }
} 