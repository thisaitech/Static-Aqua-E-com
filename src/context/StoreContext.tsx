'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';
import { Product } from '@/data/products';
import { useAuth } from '@/context/AuthContext';

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
      return { ...state, user: null, cart: [], wishlist: [] };
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
  const { user: authUser } = useAuth(); // Get user from AuthContext
  const isLoggingOutRef = React.useRef(false); // Track logout state
  const hasLoadedDataRef = React.useRef(false); // Track if we've loaded data from Supabase

  // Function to fetch cart from Supabase (defined before useEffect)
  const fetchCartFromSupabase = React.useCallback(async (userId: string) => {
    
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('cart_items')
      .select('cart_data')
      .eq('user_id', userId)
      .single();

    if (data && data.cart_data) {
      
      dispatch({ type: 'LOAD_CART', payload: data.cart_data });
      hasLoadedDataRef.current = true; // Mark that we've loaded data
    } else if (error && error.code === 'PGRST116') {
      // No cart found in Supabase - start with empty cart
      dispatch({ type: 'LOAD_CART', payload: [] });
      hasLoadedDataRef.current = true; // Mark that we've loaded (even if empty)
    } else if (error) {
      console.error('Failed to fetch cart from Supabase', error);
      dispatch({ type: 'LOAD_CART', payload: [] });
      hasLoadedDataRef.current = true; // Mark that we've loaded (even if error)
    }
  }, []);

  // Function to fetch wishlist from Supabase (defined before useEffect)
  const fetchWishlistFromSupabase = React.useCallback(async (userId: string) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('wishlists')
      .select('product_ids')
      .eq('user_id', userId)
      .single();

    if (data && data.product_ids) {
      dispatch({ type: 'SET_WISHLIST', payload: data.product_ids });
      hasLoadedDataRef.current = true; // Mark that we've loaded data
    } else if (error && error.code === 'PGRST116') {
      // No wishlist found in Supabase - start with empty wishlist
      dispatch({ type: 'SET_WISHLIST', payload: [] });
      hasLoadedDataRef.current = true; // Mark that we've loaded (even if empty)
    } else if (error) {
      dispatch({ type: 'SET_WISHLIST', payload: [] });
      hasLoadedDataRef.current = true; // Mark that we've loaded (even if error)
    }
  }, []);

  // Sync AuthContext user to StoreContext
  useEffect(() => {
    if (authUser) {
    
      // Reset logout flag BEFORE dispatching LOGIN to ensure syncs work
      isLoggingOutRef.current = false;
      const storeUser = {
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
      };
      dispatch({ type: 'LOGIN', payload: storeUser });
      // Immediately fetch cart and wishlist from Supabase when user syncs
      fetchCartFromSupabase(authUser.id);
      fetchWishlistFromSupabase(authUser.id);
    } else if (!authUser) {
      // Set logout flag FIRST to prevent saving empty arrays
      isLoggingOutRef.current = true;
      hasLoadedDataRef.current = false; // Reset loaded flag
      // Dispatch logout which clears cart/wishlist
      dispatch({ type: 'LOGOUT' });
      // Keep the flag set for a moment to prevent any sync attempts
      setTimeout(() => {
        isLoggingOutRef.current = false;
      }, 100);
    }
  }, [authUser, fetchCartFromSupabase, fetchWishlistFromSupabase]);

  // Cart and wishlist are fetched via the AuthContext sync effect above
  // No need for additional fetch logic here

  // Save cart to Supabase whenever it changes
  useEffect(() => {
    const syncCartToSupabase = async () => {
      // Skip syncing during logout
      if (isLoggingOutRef.current) {
;
        return;
      }

      // Skip syncing until we've loaded initial data from Supabase
      if (!hasLoadedDataRef.current) {
        return;
      }

      if (state.user && state.user.id) {
    
        const supabase = createSupabaseClient();
        const { data, error } = await supabase.from('cart_items').upsert({
          user_id: state.user.id,
          cart_data: state.cart,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        }).select();

        if (error) {
          console.error('Failed to sync cart to Supabase:', error);
          console.error('Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
        } else {
        }
      }
    };
    syncCartToSupabase();
  }, [state.cart, state.user]);


  // Save wishlist to Supabase whenever it changes
  useEffect(() => {
    const syncWishlistToSupabase = async () => {
      // Skip syncing during logout
      if (isLoggingOutRef.current) {
        return;
      }

      // Skip syncing until we've loaded initial data from Supabase
      if (!hasLoadedDataRef.current) {
        return;
      }

      if (state.user && state.user.id) {
      
        const supabase = createSupabaseClient();
        const { data, error } = await supabase.from('wishlists').upsert({
          user_id: state.user.id,
          product_ids: state.wishlist,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        }).select();

        if (error) {
          console.error('Failed to sync wishlist to Supabase:', error);
          console.error('Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
        } else {
        }
      }
    };
    syncWishlistToSupabase();
  }, [state.wishlist, state.user]);

  // User state is managed by AuthContext - no need for localStorage here

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
    // Log after dispatch to see the result
    setTimeout(() => {
    
    }, 0);
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

