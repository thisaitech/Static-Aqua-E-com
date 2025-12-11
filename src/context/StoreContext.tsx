'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Product } from '@/data/products';

// Types
interface CartItem {
  product: Product;
  quantity: number;
}

interface User {
  id: string;
  email: string;
  name: string;
}

interface StoreState {
  cart: CartItem[];
  wishlist: string[];
  user: User | null;
  isAuthModalOpen: boolean;
  isCartOpen: boolean;
}

type StoreAction =
  | { type: 'ADD_TO_CART'; payload: Product }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_WISHLIST'; payload: string }
  | { type: 'SET_WISHLIST'; payload: string[] }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'TOGGLE_AUTH_MODAL' }
  | { type: 'TOGGLE_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

// Initial state
const initialState: StoreState = {
  cart: [],
  wishlist: [],
  user: null,
  isAuthModalOpen: false,
  isCartOpen: false,
};

// Reducer
function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.cart.find(item => item.product.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.product.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        ...state,
        cart: [...state.cart, { product: action.payload, quantity: 1 }],
      };
    }
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.product.id !== action.payload),
      };
    case 'UPDATE_CART_QUANTITY':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.product.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ).filter(item => item.quantity > 0),
      };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'TOGGLE_WISHLIST': {
      const isInWishlist = state.wishlist.includes(action.payload);
      return {
        ...state,
        wishlist: isInWishlist
          ? state.wishlist.filter(id => id !== action.payload)
          : [...state.wishlist, action.payload],
      };
    }
    case 'SET_WISHLIST':
      return { ...state, wishlist: action.payload };
    case 'LOAD_CART':
      return { ...state, cart: action.payload };
    case 'LOGIN':
      return { ...state, user: action.payload, isAuthModalOpen: false };
    case 'LOGOUT':
      return { ...state, user: null };
    case 'TOGGLE_AUTH_MODAL':
      return { ...state, isAuthModalOpen: !state.isAuthModalOpen };
    case 'TOGGLE_CART':
      return { ...state, isCartOpen: !state.isCartOpen };
    default:
      return state;
  }
}

// Context
interface StoreContextType extends StoreState {
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  login: (user: User) => void;
  logout: () => void;
  toggleAuthModal: () => void;
  toggleCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Provider
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('rainbow-aqua-cart');
    const savedWishlist = localStorage.getItem('rainbow-aqua-wishlist');
    const savedUser = localStorage.getItem('rainbow-aqua-user');

    if (savedCart) {
      try {
        dispatch({ type: 'LOAD_CART', payload: JSON.parse(savedCart) });
      } catch (e) {
        console.error('Failed to load cart', e);
      }
    }
    if (savedWishlist) {
      try {
        dispatch({ type: 'SET_WISHLIST', payload: JSON.parse(savedWishlist) });
      } catch (e) {
        console.error('Failed to load wishlist', e);
      }
    }
    if (savedUser) {
      try {
        dispatch({ type: 'LOGIN', payload: JSON.parse(savedUser) });
      } catch (e) {
        console.error('Failed to load user', e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('rainbow-aqua-cart', JSON.stringify(state.cart));
  }, [state.cart]);

  useEffect(() => {
    localStorage.setItem('rainbow-aqua-wishlist', JSON.stringify(state.wishlist));
  }, [state.wishlist]);

  useEffect(() => {
    if (state.user) {
      localStorage.setItem('rainbow-aqua-user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('rainbow-aqua-user');
    }
  }, [state.user]);

  const addToCart = (product: Product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  const removeFromCart = (id: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  };

  const updateCartQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const toggleWishlist = (id: string) => {
    dispatch({ type: 'TOGGLE_WISHLIST', payload: id });
  };

  const isInWishlist = (id: string) => state.wishlist.includes(id);

  const login = (user: User) => {
    dispatch({ type: 'LOGIN', payload: user });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const toggleAuthModal = () => {
    dispatch({ type: 'TOGGLE_AUTH_MODAL' });
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const cartTotal = state.cart.reduce(
    (total, item) => total + (item.product.price * item.quantity),
    0
  );

  const cartCount = state.cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        ...state,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        login,
        logout,
        toggleAuthModal,
        toggleCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

