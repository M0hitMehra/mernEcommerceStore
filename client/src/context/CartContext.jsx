import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const CartContext = createContext(null);
const STORAGE_KEY = "mohit_store_cart_v1";

function loadInitialCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadInitialCart);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage quota errors
    }
  }, [items]);

  const addItem = (product, quantity = 1) => {
    if (!product?._id) return;
    const stock = Number(product.quantity ?? 0);
    if (stock <= 0) {
      toast.error("This product is currently out of stock");
      return;
    }

    setItems((prev) => {
      const existing = prev.find((item) => item.product === product._id);
      if (existing) {
        const nextQty = Math.min(stock, existing.quantity + quantity);
        if (nextQty === existing.quantity) {
          toast.error(`Maximum stock (${stock}) reached in cart`);
          return prev;
        }
        toast.success(`Updated "${product.name}" quantity`);
        return prev.map((item) =>
          item.product === product._id
            ? {
                ...item,
                quantity: nextQty,
                maxQuantity: stock,
                price: product.price,
              }
            : item
        );
      }

      toast.success(`Added "${product.name}" to cart`);
      return [
        ...prev,
        {
          product: product._id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          image: product.images?.[0]?.url || "",
          maxQuantity: stock,
          quantity: Math.min(stock, Math.max(1, quantity)),
        },
      ];
    });
  };

  const updateQuantity = (productId, nextQty) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.product !== productId) return item;
          const clamped = Math.max(
            0,
            Math.min(item.maxQuantity || 999, Number(nextQty))
          );
          return { ...item, quantity: clamped };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((item) => item.product !== productId));
    toast.success("Item removed from cart");
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalCount,
        subtotal,
        drawerOpen,
        setDrawerOpen,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
}
