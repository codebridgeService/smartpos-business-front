"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useBusiness } from "@/context/business-context";
import { useOutlet } from "@/context/outlet-context";
import { outletsApi } from "@/lib/api/outlets";
import { registersApi } from "@/lib/api/registers";
import { useCashierSessionStore } from "@/stores/useCashierSessionStore";
import { TerminalLockOverlay } from "@/components/pos/terminal/TerminalLockOverlay";
import { CashierProfileModal } from "@/components/pos/terminal/CashierProfileModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { isAdminOrOwner } from "@/lib/utils/roles";
import type { Outlet, Register } from "@/types";
import {
  Store,
  Calculator,
  Lock,
  Wallet,
  Clock,
  LogOut,
  History,
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  QrCode,
  RotateCcw,
  CheckCircle2,
  Settings2,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  ChevronDown,
  User,
  UserPlus,
  Star,
  Check,
  Percent,
  Edit3,
  Maximize2,
  Minimize2,
  Printer,
  Smartphone,
  Laptop,
  Watch,
  Headphones,
  Footprints,
  Layers,
  PauseCircle,
  FileText,
  X,
  ShoppingCart,
  Gift,
  Split,
  Globe,
  FileCheck,
  Settings,
} from "lucide-react";

interface PosItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
  imgUrl?: string;
}

interface FlyingItem {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  image?: string;
  name: string;
}

const CATEGORIES = [
  { id: "all", name: "All", icon: <Layers className="w-4 h-4" /> },
  { id: "Headset", name: "Headset", icon: <Headphones className="w-4 h-4" /> },
  { id: "Shoes", name: "Shoes", icon: <Footprints className="w-4 h-4" /> },
  { id: "Mobiles", name: "Mobiles", icon: <Smartphone className="w-4 h-4" /> },
  { id: "Computer", name: "Computer", icon: <Laptop className="w-4 h-4" /> },
  { id: "Watches", name: "Watches", icon: <Watch className="w-4 h-4" /> },
];

const PAYMENT_METHODS = [
  { id: "Cash", label: "Cash", icon: <Banknote className="w-4 h-4 text-emerald-600" /> },
  { id: "Card", label: "Card", icon: <CreditCard className="w-4 h-4 text-blue-600" /> },
  { id: "Points", label: "Points", icon: <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> },
  { id: "Deposit", label: "Deposit", icon: <Wallet className="w-4 h-4 text-amber-600" /> },
  { id: "Cheque", label: "Cheque", icon: <FileCheck className="w-4 h-4 text-sky-600" /> },
  { id: "Gift Card", label: "Gift Card", icon: <Gift className="w-4 h-4 text-purple-600" /> },
  { id: "Scan", label: "Scan", icon: <QrCode className="w-4 h-4 text-indigo-600" /> },
  { id: "Pay Later", label: "Pay Later", icon: <Clock className="w-4 h-4 text-rose-500" /> },
  { id: "External", label: "External", icon: <Globe className="w-4 h-4 text-violet-600" /> },
  { id: "Split Bill", label: "Split Bill", icon: <Split className="w-4 h-4 text-purple-600" /> },
];

const SAMPLE_PRODUCTS: PosItem[] = [
  {
    id: "1",
    name: "iPhone 14 64GB",
    sku: "MOB-001",
    price: 15800,
    category: "Mobiles",
    stock: 45,
    image: "📱",
    imgUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "2",
    name: "MacBook Pro",
    sku: "COM-002",
    price: 1000,
    category: "Computer",
    stock: 20,
    image: "💻",
    imgUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "3",
    name: "Rolex Tribute V3",
    sku: "WAT-003",
    price: 6800,
    category: "Watches",
    stock: 12,
    image: "⌚",
    imgUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "4",
    name: "Red Nike Angelo",
    sku: "SHO-004",
    price: 7800,
    category: "Shoes",
    stock: 18,
    image: "👟",
    imgUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "5",
    name: "Airpod 2",
    sku: "HED-005",
    price: 5478,
    category: "Headset",
    stock: 35,
    image: "🎧",
    imgUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "6",
    name: "Blue White OGR",
    sku: "SHO-006",
    price: 987,
    category: "Shoes",
    stock: 22,
    image: "👟",
    imgUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "7",
    name: "IdeaPad Slim 5 Gen 7",
    sku: "COM-007",
    price: 1454,
    category: "Computer",
    stock: 16,
    image: "💻",
    imgUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "8",
    name: "SWAGME",
    sku: "HED-008",
    price: 6587,
    category: "Headset",
    stock: 40,
    image: "🎧",
    imgUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "9",
    name: "Tablet 1.02 inch",
    sku: "MOB-009",
    price: 3000,
    category: "Mobiles",
    stock: 15,
    image: "📱",
    imgUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "10",
    name: "IdeaPad Slim 3i",
    sku: "COM-010",
    price: 3000,
    category: "Computer",
    stock: 14,
    image: "💻",
    imgUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "11",
    name: "Classic Chrono Watch",
    sku: "WAT-011",
    price: 4500,
    category: "Watches",
    stock: 9,
    image: "⌚",
    imgUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "12",
    name: "Sony Studio Pro",
    sku: "HED-012",
    price: 399,
    category: "Headset",
    stock: 28,
    image: "🎧",
    imgUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&auto=format&fit=crop&q=80",
  },
];

interface CartItem extends PosItem {
  quantity: number;
}

function PosCashierTerminalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const outletFromQuery = searchParams.get("outlet");

  const toast = useToast();
  const { user, logout } = useAuth();
  const { activeBusiness } = useBusiness();
  const { activeOutlet, selectOutlet } = useOutlet();

  const {
    currentSession,
    isLocked,
    idleTimeoutSeconds,
    lastActivityTime,
    fetchCurrentSession,
    startSession,
    lockSession,
    endSession,
    recordActivity,
    setIdleTimeout,
  } = useCashierSessionStore();

  // Outlets & Registers
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [registers, setRegisters] = useState<Register[]>([]);
  const [selectedOutletUuid, setSelectedOutletUuid] = useState<string>("");
  const [selectedRegisterUuid, setSelectedRegisterUuid] = useState<string>("");

  // Modals & UI States
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const [isFeaturedOnly, setIsFeaturedOnly] = useState(false);

  // Cart & Order State
  const [cart, setCart] = useState<CartItem[]>([
    { ...SAMPLE_PRODUCTS[2], quantity: 4 }, // Rolex Tribute V3 ($6,800 * 4 = $27,200)
    { ...SAMPLE_PRODUCTS[4], quantity: 4 }, // Airpod 2 ($5,478 * 4 = $21,912)
    { ...SAMPLE_PRODUCTS[3], quantity: 1 }, // Red Nike Angelo ($7,800)
    { ...SAMPLE_PRODUCTS[1], quantity: 1 }, // MacBook Pro ($1,000)
    { ...SAMPLE_PRODUCTS[6], quantity: 1 }, // IdeaPad Slim 5 ($1,454)
    { ...SAMPLE_PRODUCTS[5], quantity: 1 }, // Blue White OGR ($987)
    { ...SAMPLE_PRODUCTS[11], quantity: 1 }, // Sony Studio Pro ($101 approx to equal $60,454)
  ]);
  const [orderNumber] = useState<string>("#ORD123");
  const [customer, setCustomer] = useState<string>("Walk in Customer");
  const [isLoyaltyApplied, setIsLoyaltyApplied] = useState<boolean>(false);
  const [isDiscountApplied, setIsDiscountApplied] = useState<boolean>(true);
  const [shippingFee, setShippingFee] = useState<number>(40.21);
  const [taxAmount, setTaxAmount] = useState<number>(25.0);
  const [couponAmount, setCouponAmount] = useState<number>(25.0);
  const [discountAmount, setDiscountAmount] = useState<number>(15.21);
  const [isRoundoffActive, setIsRoundoffActive] = useState<boolean>(true);
  const [roundoffValue, setRoundoffValue] = useState<number>(0.11);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("Cash");

  // Fly-to-cart Animation States
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [cartBump, setCartBump] = useState<boolean>(false);
  const cartContainerRef = useRef<HTMLDivElement>(null);

  // Checkout modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>("09:25:32");
  const [currentDate, setCurrentDate] = useState<string>("September 22, 2026");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Live Clock & Date (client-side only to prevent SSR hydration mismatch)
  useEffect(() => {
    const updateTimeAndDate = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", { hour12: false }));
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      );
    };
    updateTimeAndDate();
    const interval = setInterval(updateTimeAndDate, 1000);
    return () => clearInterval(interval);
  }, []);

  // 1. Fetch Outlets & Set Target Store
  useEffect(() => {
    if (!activeBusiness?.uuid) return;
    let isMounted = true;
    const loadOutlets = async () => {
      try {
        const fetched = await outletsApi.getOutlets(activeBusiness.uuid);
        if (isMounted && fetched.length > 0) {
          setOutlets(fetched);

          let targetUuid = "";
          if (outletFromQuery && fetched.some((o) => o.uuid === outletFromQuery)) {
            targetUuid = outletFromQuery;
          } else if (activeOutlet?.uuid && fetched.some((o) => o.uuid === activeOutlet.uuid)) {
            targetUuid = activeOutlet.uuid;
          } else {
            targetUuid = fetched[0].uuid;
          }

          setSelectedOutletUuid(targetUuid);
          selectOutlet(targetUuid);
        }
      } catch (e) {
        console.error("Failed to load outlets:", e);
      }
    };
    loadOutlets();
    return () => {
      isMounted = false;
    };
  }, [activeBusiness?.uuid, outletFromQuery, activeOutlet?.uuid, selectOutlet]);

  // Keep selected outlet in sync if URL query parameter changes
  useEffect(() => {
    if (outletFromQuery && outletFromQuery !== selectedOutletUuid && outlets.length > 0) {
      if (outlets.some((o) => o.uuid === outletFromQuery)) {
        setSelectedOutletUuid(outletFromQuery);
        selectOutlet(outletFromQuery);
      }
    }
  }, [outletFromQuery, outlets, selectedOutletUuid, selectOutlet]);

  // 2. Fetch Registers
  useEffect(() => {
    if (!selectedOutletUuid) {
      setRegisters([]);
      setSelectedRegisterUuid("");
      return;
    }
    let isMounted = true;
    const loadRegisters = async () => {
      try {
        const fetched = await registersApi.getRegisters(selectedOutletUuid);
        if (isMounted && fetched.length > 0) {
          setRegisters(fetched);
          setSelectedRegisterUuid(fetched[0].uuid);
        } else if (isMounted) {
          setRegisters([]);
          setSelectedRegisterUuid("");
        }
      } catch (e) {
        console.error("Failed to load registers:", e);
      }
    };
    loadRegisters();
    return () => {
      isMounted = false;
    };
  }, [selectedOutletUuid]);

  // 3. Load Current Cashier Session
  useEffect(() => {
    if (selectedOutletUuid) {
      fetchCurrentSession(selectedOutletUuid, selectedRegisterUuid || undefined);
    }
  }, [selectedOutletUuid, selectedRegisterUuid, fetchCurrentSession]);

  // 4. Inactivity Auto-Lock
  useEffect(() => {
    if (isLocked || idleTimeoutSeconds <= 0) return;

    const handleActivity = () => recordActivity();
    window.addEventListener("mousemove", handleActivity, { passive: true });
    window.addEventListener("keydown", handleActivity, { passive: true });
    window.addEventListener("touchstart", handleActivity, { passive: true });

    const timer = setInterval(() => {
      const elapsed = (Date.now() - lastActivityTime) / 1000;
      if (elapsed >= idleTimeoutSeconds && !isLocked && selectedOutletUuid) {
        lockSession(selectedOutletUuid);
        toast.info("Terminal locked due to inactivity.");
      }
    }, 5000);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      clearInterval(timer);
    };
  }, [isLocked, idleTimeoutSeconds, lastActivityTime, selectedOutletUuid, lockSession, recordActivity, toast]);

  // Totals Calculation
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const loyaltyCredit = useMemo(() => {
    return isLoyaltyApplied ? 20 : 0;
  }, [isLoyaltyApplied]);

  const grandTotal = useMemo(() => {
    let total =
      subtotal +
      shippingFee +
      taxAmount -
      (isDiscountApplied ? discountAmount : 0) -
      couponAmount -
      loyaltyCredit;
    if (isRoundoffActive) {
      total += roundoffValue;
    }
    return Math.max(0, total);
  }, [
    subtotal,
    shippingFee,
    taxAmount,
    isDiscountApplied,
    discountAmount,
    couponAmount,
    loyaltyCredit,
    isRoundoffActive,
    roundoffValue,
  ]);

  // Trigger Fly-to-Cart Animation
  const triggerFlyAnimation = (product: PosItem, e?: React.MouseEvent) => {
    if (e && cartContainerRef.current) {
      const card = (e.currentTarget as HTMLElement).closest(".product-card") || (e.currentTarget as HTMLElement);
      const cardRect = card.getBoundingClientRect();
      const cartRect = cartContainerRef.current.getBoundingClientRect();

      const startX = cardRect.left + cardRect.width / 2;
      const startY = cardRect.top + cardRect.height / 2;
      const endX = cartRect.left + 60;
      const endY = cartRect.top + 200;

      const flyId = Date.now() + Math.random();
      setFlyingItems((prev) => [
        ...prev,
        {
          id: flyId,
          startX,
          startY,
          endX,
          endY,
          image: product.image,
          name: product.name,
        },
      ]);

      setTimeout(() => {
        setFlyingItems((prev) => prev.filter((item) => item.id !== flyId));
        setCartBump(true);
        setTimeout(() => setCartBump(false), 250);
      }, 650);
    }
  };

  // Add Item to Cart
  const addToCart = (product: PosItem, e?: React.MouseEvent) => {
    triggerFlyAnimation(product, e);
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Barcode Scanner Handler
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const matched = SAMPLE_PRODUCTS.find(
      (p) =>
        p.sku.toLowerCase() === barcodeInput.trim().toLowerCase() ||
        p.name.toLowerCase().includes(barcodeInput.trim().toLowerCase())
    );

    if (matched) {
      addToCart(matched);
      toast.success(`Scanned: ${matched.name}`);
      setBarcodeInput("");
    } else {
      toast.error(`No item found matching SKU: "${barcodeInput}"`);
    }
  };

  // Checkout Execution
  const handleCheckout = (method: string) => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);

    setTimeout(() => {
      setIsCheckingOut(false);
      setIsPaymentModalOpen(false);
      clearCart();
      toast.success(`Payment Approved via ${method}! Receipt #${orderNumber} printed.`);
    }, 800);
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return SAMPLE_PRODUCTS.filter((product) => {
      const matchesCategory =
        activeCategory === "All" || product.category.toLowerCase() === activeCategory.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFeatured = !isFeaturedOnly || ["1", "2", "3", "4"].includes(product.id);
      return matchesCategory && matchesSearch && matchesFeatured;
    });
  }, [activeCategory, searchQuery, isFeaturedOnly]);

  const selectedOutlet = outlets.find((o) => o.uuid === selectedOutletUuid);
  const selectedRegister = registers.find((r) => r.uuid === selectedRegisterUuid);

  return (
    <div
      className="min-h-screen flex flex-col bg-[#f4f7fa] dark:bg-zinc-950 select-none text-zinc-900 dark:text-zinc-50 font-sans animate-fade-in"
      onMouseMove={recordActivity}
      onKeyDown={recordActivity}
    >
      {/* Dynamic Keyframe Style for Fly-to-Cart Animation */}
      <style jsx global>{`
        @keyframes flyToCartKeyframe {
          0% {
            transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
            opacity: 1;
          }
          35% {
            transform: translate3d(calc(var(--delta-x) * 0.35), calc(var(--delta-y) * 0.2 - 60px), 0) scale(1.15) rotate(-12deg);
            opacity: 0.95;
          }
          75% {
            transform: translate3d(calc(var(--delta-x) * 0.75), calc(var(--delta-y) * 0.75 - 20px), 0) scale(0.6) rotate(12deg);
            opacity: 0.85;
          }
          100% {
            transform: translate3d(var(--delta-x), var(--delta-y), 0) scale(0.18) rotate(25deg);
            opacity: 0;
          }
        }
        .animate-fly-to-cart {
          animation: flyToCartKeyframe 0.65s cubic-bezier(0.2, 0.9, 0.3, 1) forwards;
        }
      `}</style>

      {/* FLYING ITEMS ANIMATION OVERLAY */}
      {flyingItems.map((item) => {
        const deltaX = item.endX - item.startX;
        const deltaY = item.endY - item.startY;
        return (
          <div
            key={item.id}
            className="fixed pointer-events-none z-[100] animate-fly-to-cart"
            style={{
              left: `${item.startX - 28}px`,
              top: `${item.startY - 28}px`,
              "--delta-x": `${deltaX}px`,
              "--delta-y": `${deltaY}px`,
            } as React.CSSProperties}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-2xl flex items-center justify-center text-2xl font-bold border-2 border-white ring-4 ring-orange-500/20">
              {item.image || "🛍️"}
            </div>
          </div>
        );
      })}

      {/* 1. TOP BAR (Matching Dreams POS Header) */}
      <header className="h-16 px-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-2xs z-30 shrink-0">
        {/* Left: Brand Logo & Clock */}
        <div className="flex items-center gap-4">
          <Link href="/businesses" className="flex items-center gap-2 group">
            <div className="h-10 w-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-base shadow-sm group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-lg tracking-tight text-zinc-900 dark:text-white">
                  Dreams
                </span>
                <span className="text-xs font-black px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-600 dark:text-orange-400">
                  POS
                </span>
              </div>
            </div>
          </Link>

          {/* Live Clock Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-mono font-bold shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-emerald-200" />
            <span suppressHydrationWarning>{currentTime}</span>
          </div>
        </div>

        {/* Right Utility Buttons & Controls */}
        <div className="flex items-center gap-2.5">
          {/* Dashboard Button */}
          <Link href="/businesses">
            <button
              type="button"
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
          </Link>

          {/* Store Outlet Selector Dropdown */}
          <div className="relative">
            <select
              value={selectedOutletUuid}
              onChange={(e) => {
                const newUuid = e.target.value;
                setSelectedOutletUuid(newUuid);
                selectOutlet(newUuid);
                router.push(`/pos?outlet=${newUuid}`);
              }}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer shadow-2xs"
            >
              {outlets.map((o) => (
                <option key={o.uuid} value={o.uuid}>
                  🏬 {o.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action Icons Bar */}
          <div className="hidden md:flex items-center gap-1">
            {/* Drawer */}
            <Link href="/pos/drawer">
              <button
                type="button"
                className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 transition-colors"
                title="Cash Drawer"
              >
                <Wallet className="w-4 h-4 text-orange-500" />
              </button>
            </Link>

            {/* Shifts */}
            <Link href="/pos/shifts">
              <button
                type="button"
                className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 transition-colors"
                title="Register Shifts"
              >
                <History className="w-4 h-4 text-blue-500" />
              </button>
            </Link>

            {/* Fullscreen */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Print */}
            <button
              type="button"
              onClick={() => window.print()}
              className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 transition-colors"
              title="Print Register"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Reset */}
            <button
              type="button"
              onClick={clearCart}
              className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 transition-colors"
              title="Reset Active Order"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Lock Screen */}
            <button
              type="button"
              onClick={() => selectedOutletUuid && lockSession(selectedOutletUuid)}
              className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 transition-colors"
              title="Lock Terminal"
            >
              <Lock className="w-4 h-4 text-amber-500" />
            </button>

            {/* Cashier Permissions Modal */}
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 transition-colors"
              title="Cashier Privileges & PIN"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>

          {/* User Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "WA"}
            </div>
            <button
              type="button"
              onClick={async () => {
                if (selectedOutletUuid) await endSession(selectedOutletUuid);
                await logout();
                router.push("/auth/login");
              }}
              className="text-zinc-400 hover:text-rose-500 p-1 rounded-lg"
              title="Logout Cashier"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN POS WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT VERTICAL CATEGORY BAR (Matches Dreams POS exact layout) */}
        <aside className="w-20 sm:w-24 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col items-center py-3 gap-2 shrink-0 overflow-y-auto no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.name)}
                className={`w-16 sm:w-18 py-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-[11px] font-semibold transition-all relative cursor-pointer ${
                  isActive
                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/40 shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent"
                }`}
              >
                {isActive && (
                  <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-orange-500 rounded-r-full" />
                )}
                <div
                  className={`p-2 rounded-xl ${
                    isActive ? "bg-orange-500 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {cat.icon}
                </div>
                <span className="truncate max-w-full px-1">{cat.name}</span>
              </button>
            );
          })}
        </aside>

        {/* CENTER: PRODUCTS CATALOG GRID */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] dark:bg-zinc-950 p-4 overflow-hidden">
          {/* Welcome Banner & Search Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                Welcome, {user?.name || "Wesley Adrian"}
              </h2>
              <p className="text-xs text-zinc-400" suppressHydrationWarning>
                {currentDate}
              </p>
            </div>

            {/* Search Input & Action Filters */}
            <div className="flex items-center gap-2">
              <form onSubmit={handleBarcodeSubmit} className="relative w-64 sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Product or Barcode..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs"
                />
              </form>

              <button
                type="button"
                onClick={() => {
                  setActiveCategory("All");
                  setIsFeaturedOnly(false);
                }}
                className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-semibold whitespace-nowrap shadow-xs cursor-pointer"
              >
                View All Brands
              </button>

              <button
                type="button"
                onClick={() => setIsFeaturedOnly(!isFeaturedOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shadow-xs flex items-center gap-1 transition-all cursor-pointer ${
                  isFeaturedOnly
                    ? "bg-amber-500 text-white"
                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25"
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>Featured</span>
              </button>
            </div>
          </div>

          {/* PRODUCT CARDS GRID */}
          <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 auto-rows-max">
            {filteredProducts.map((product) => {
              const inCart = cart.find((i) => i.id === product.id);
              return (
                <div
                  key={product.id}
                  className="product-card smooth-card group relative p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 hover:border-orange-500 hover:shadow-xl hover:shadow-orange-500/10 flex flex-col justify-between cursor-pointer"
                  onClick={(e) => addToCart(product, e)}
                >
                  {/* Selected Green Checkmark Badge */}
                  {inCart && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs z-10 animate-scale-in">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}

                  {/* Product Thumbnail with Clean White Center Frame */}
                  <div className="h-32 w-full rounded-xl bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform overflow-hidden relative">
                    <span className="text-5xl select-none drop-shadow-sm">{product.image}</span>
                  </div>

                  {/* Product Details */}
                  <div>
                    <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
                      {product.category}
                    </span>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate mt-0.5">
                      {product.name}
                    </h3>
                  </div>

                  {/* Price & Quantity Controls */}
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80">
                    <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-50 font-mono">
                      ${product.price.toLocaleString()}
                    </span>

                    {/* Quantity Stepper when in Cart, otherwise simple + button */}
                    {inCart ? (
                      <div
                        className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-1 rounded-xl"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, -1)}
                          className="w-5 h-5 rounded-lg bg-white dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 flex items-center justify-center hover:bg-zinc-200 shadow-2xs text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold font-mono px-1">{inCart.quantity}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            addToCart(product, e);
                          }}
                          className="w-5 h-5 rounded-lg bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 shadow-2xs text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product, e);
                        }}
                        className="w-7 h-7 rounded-xl bg-zinc-100 dark:bg-zinc-800 group-hover:bg-orange-500 group-hover:text-white text-zinc-600 dark:text-zinc-300 flex items-center justify-center transition-colors shadow-2xs"
                        title="Add to cart"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* RIGHT: ORDER LIST / CART PANEL (Matches Dreams POS exact structure) */}
        <aside
          ref={cartContainerRef}
          className={`w-96 lg:w-[420px] bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 flex flex-col shrink-0 shadow-lg transition-transform duration-200 ${
            cartBump ? "scale-[1.01] ring-2 ring-orange-500/40" : ""
          }`}
        >
          {/* Order Header */}
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Order List</h3>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white">
                {orderNumber}
              </span>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Clear all items"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Customer Information Card */}
            <div>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block mb-1.5">
                Customer Information
              </span>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <select
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-orange-500 appearance-none"
                  >
                    <option value="Walk in Customer">Walk in Customer</option>
                    <option value="James Anderson">James Anderson</option>
                    <option value="Sarah Jenkins">Sarah Jenkins</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>

                <button
                  type="button"
                  className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                  title="Add New Customer"
                >
                  <UserPlus className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-2xs"
                  title="Scan Member Card"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Loyalty / Promotion Card (Matches Dreams POS Peach Card) */}
            <div className="p-3 rounded-2xl border border-orange-200 dark:border-orange-950/60 bg-orange-50/60 dark:bg-orange-950/20 flex items-center justify-between gap-3 relative">
              <div className="min-w-0">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                  James Anderson
                </span>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5 font-medium">
                  <span>Bonus :</span>
                  <span className="px-1.5 py-0.2 rounded bg-sky-500 text-white font-bold text-[10px]">
                    148
                  </span>
                  <span>| Loyalty :</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white font-bold text-[10px]">
                    $20
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsLoyaltyApplied(!isLoyaltyApplied);
                  toast.success(
                    isLoyaltyApplied ? "Loyalty credit removed." : "Loyalty $20 credit applied!"
                  );
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  isLoyaltyApplied
                    ? "bg-emerald-600 text-white"
                    : "bg-orange-500 hover:bg-orange-600 text-white"
                }`}
              >
                {isLoyaltyApplied ? "Applied ✓" : "Apply"}
              </button>
            </div>

            {/* Order Details Header */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Order Details</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  Items : {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="px-2 py-0.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold shadow-2xs"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Cart Table Headers */}
            <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider pb-1 border-b border-zinc-100 dark:border-zinc-800">
              <span className="flex-1">Item</span>
              <span className="w-24 text-center">QTY</span>
              <span className="w-16 text-right">Cost</span>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-zinc-400">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-1 text-zinc-300 dark:text-zinc-700" />
                  <p className="text-xs">No items in the order list</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-2 py-1">
                    {/* Item Name & Remove */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-zinc-400 hover:text-rose-500"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                        {item.name}
                      </span>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-1 w-24 justify-center">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-5 h-5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-bold font-mono">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-5 h-5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Cost */}
                    <div className="w-16 text-right font-bold text-xs text-zinc-900 dark:text-zinc-100 font-mono">
                      ${(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Purple Minimum Purchase Promo Card (Matches Dreams POS top banner) */}
            <div className="p-2.5 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 bg-[#6366f1]/10 dark:bg-indigo-950/40 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#6366f1] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Wallet className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-semibold text-indigo-950 dark:text-indigo-200 truncate">
                For $20 Minimum Purchase, all Items
              </span>
            </div>

            {/* Payment Summary */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2 text-xs">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 block">
                Payment Summary
              </h4>

              {/* Shipping */}
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <span>Shipping</span>
                  <button
                    type="button"
                    onClick={() => {
                      const val = prompt("Enter shipping amount ($):", shippingFee.toString());
                      if (val && !isNaN(Number(val))) setShippingFee(parseFloat(val));
                    }}
                    className="hover:text-orange-500 cursor-pointer"
                    title="Edit Shipping"
                  >
                    <Edit3 className="w-3 h-3 text-zinc-400" />
                  </button>
                </div>
                <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">
                  ${shippingFee.toFixed(2)}
                </span>
              </div>

              {/* Tax */}
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <span>Tax</span>
                  <button
                    type="button"
                    onClick={() => {
                      const val = prompt("Enter tax amount ($):", taxAmount.toString());
                      if (val && !isNaN(Number(val))) setTaxAmount(parseFloat(val));
                    }}
                    className="hover:text-orange-500 cursor-pointer"
                    title="Edit Tax"
                  >
                    <Edit3 className="w-3 h-3 text-zinc-400" />
                  </button>
                </div>
                <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">
                  ${taxAmount.toFixed(0)}
                </span>
              </div>

              {/* Coupon */}
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <span>Coupon</span>
                  <button
                    type="button"
                    onClick={() => {
                      const val = prompt("Enter coupon discount ($):", couponAmount.toString());
                      if (val && !isNaN(Number(val))) setCouponAmount(parseFloat(val));
                    }}
                    className="hover:text-orange-500 cursor-pointer"
                    title="Edit Coupon"
                  >
                    <Edit3 className="w-3 h-3 text-zinc-400" />
                  </button>
                </div>
                <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">
                  ${couponAmount.toFixed(0)}
                </span>
              </div>

              {/* Discount (Red text) */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-rose-500 font-semibold">
                  <span>Discount</span>
                  <button
                    type="button"
                    onClick={() => {
                      const val = prompt("Enter discount amount ($):", discountAmount.toString());
                      if (val && !isNaN(Number(val))) setDiscountAmount(parseFloat(val));
                    }}
                    className="hover:text-rose-600 cursor-pointer"
                    title="Edit Discount"
                  >
                    <Edit3 className="w-3 h-3 text-rose-400" />
                  </button>
                </div>
                <span className="font-mono font-bold text-rose-500">
                  -${discountAmount.toFixed(2)}
                </span>
              </div>

              {/* Roundoff Toggle */}
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 pt-0.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRoundoffActive(!isRoundoffActive)}
                    className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                      isRoundoffActive ? "bg-[#f97316]" : "bg-zinc-300 dark:bg-zinc-700"
                    }`}
                    title="Toggle Roundoff"
                  >
                    <span
                      className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform ${
                        isRoundoffActive ? "left-4" : "left-0.5"
                      }`}
                    />
                  </button>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">Roundoff</span>
                </div>
                <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">
                  {isRoundoffActive ? `+${roundoffValue.toFixed(2)}` : "$0.00"}
                </span>
              </div>

              {/* Sub Total */}
              <div className="flex items-center justify-between pt-1">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">Sub Total</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  ${subtotal.toLocaleString()}
                </span>
              </div>

              {/* Total Payable */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Total Payable
                </span>
                <span className="text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono">
                  ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            {/* Select Payment Methods Grid */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
              <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                Select Payment
              </h4>

              <div className="grid grid-cols-3 gap-1.5">
                {PAYMENT_METHODS.map((method) => {
                  const isSelected = selectedPaymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`px-2 py-2 rounded-xl border flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-all shadow-2xs ${
                        isSelected
                          ? "border-orange-500 bg-orange-50/70 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-bold ring-1 ring-orange-500/30"
                          : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                      }`}
                    >
                      <span className="shrink-0">{method.icon}</span>
                      <span className="truncate">{method.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL BOTTOM ACTION BUTTONS: Print Order & Place Order */}
          <div className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                window.print();
                toast.info("Receipt sent to printer");
              }}
              className="flex-1 py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4 text-zinc-500" />
              <span>Print Order</span>
            </button>

            <button
              type="button"
              onClick={() => handleCheckout(selectedPaymentMethod)}
              disabled={cart.length === 0 || isCheckingOut}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#0e2238] hover:bg-[#163556] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98 disabled:opacity-50 transition-colors"
            >
              <ShoppingCart className="w-4 h-4 text-white" />
              <span>{isCheckingOut ? "Placing..." : "Place Order"}</span>
            </button>
          </div>
        </aside>

        {/* FLOATING ORANGE SETTINGS GEAR TAB (Right Edge) */}
        <button
          type="button"
          onClick={() => setIsProfileModalOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 bg-[#f97316] hover:bg-[#ea580c] text-white p-2.5 rounded-l-xl shadow-xl z-30 transition-transform hover:scale-105 cursor-pointer flex items-center justify-center"
          title="Terminal Settings & Cashier Privileges"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* 3. STICKY DOCKED BOTTOM NAVBAR (Matches reference screenshot exact styling) */}
      <footer className="sticky bottom-0 z-30 w-full bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 py-3 px-4 flex items-center justify-center gap-3 shadow-md shrink-0 overflow-x-auto">
        {/* 1. Hold */}
        <button
          type="button"
          onClick={() => {
            toast.info("Order placed on Hold (#ORD123)");
          }}
          disabled={cart.length === 0}
          className="h-10 px-5 rounded-2xl bg-[#f09f7a] hover:bg-[#e48c64] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50 transition-all shrink-0"
        >
          <PauseCircle className="w-4 h-4 text-white" />
          <span>Hold</span>
        </button>

        {/* 2. Void */}
        <button
          type="button"
          onClick={() => {
            if (confirm("Void current transaction?")) {
              clearCart();
              toast.error("Order Voided");
            }
          }}
          disabled={cart.length === 0}
          className="h-10 px-5 rounded-2xl bg-[#8da7fc] hover:bg-[#7b97f0] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50 transition-all shrink-0"
        >
          <RotateCcw className="w-4 h-4 text-white" />
          <span>Void</span>
        </button>

        {/* 3. Payment */}
        <button
          type="button"
          onClick={() => setIsPaymentModalOpen(true)}
          disabled={cart.length === 0}
          className="h-10 px-5 rounded-2xl bg-[#8cd7e5] hover:bg-[#72c9d8] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50 transition-all shrink-0"
        >
          <CreditCard className="w-4 h-4 text-white" />
          <span>Payment</span>
        </button>

        {/* 4. View Orders */}
        <button
          type="button"
          onClick={() => {
            toast.info("Displaying order queue (3 open orders)");
          }}
          className="h-10 px-5 rounded-2xl bg-[#0e2238] hover:bg-[#163556] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-2xs cursor-pointer active:scale-95 transition-all shrink-0"
        >
          <ShoppingBag className="w-4 h-4 text-white" />
          <span>View Orders</span>
        </button>

        {/* 5. Reset */}
        <button
          type="button"
          onClick={() => {
            clearCart();
            setCustomer("Walk in Customer");
            setIsLoyaltyApplied(false);
            toast.info("Register Reset to default state");
          }}
          className="h-10 px-5 rounded-2xl bg-[#5046e5] hover:bg-[#4338ca] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-2xs cursor-pointer active:scale-95 transition-all shrink-0"
        >
          <RotateCcw className="w-4 h-4 text-white" />
          <span>Reset</span>
        </button>

        {/* 6. Transaction */}
        <button
          type="button"
          onClick={() => handleCheckout("Cashier Transaction")}
          disabled={cart.length === 0 || isCheckingOut}
          className="h-10 px-5 rounded-2xl bg-[#f48a8a] hover:bg-[#e87676] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50 transition-all shrink-0"
        >
          <Check className="w-4 h-4 text-white stroke-[2.5]" />
          <span>{isCheckingOut ? "Processing..." : "Transaction"}</span>
        </button>
      </footer>

      {/* PAYMENT TENDER MODAL */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Select Tender</h3>
                  <p className="text-xs text-zinc-400">Order {orderNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 text-center">
              <span className="text-xs text-zinc-500 font-medium">Amount Due</span>
              <div className="text-3xl font-black text-zinc-900 dark:text-zinc-50 font-mono mt-1">
                ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleCheckout("Cash")}
                className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 hover:bg-emerald-50/50 flex flex-col items-center gap-2 text-xs font-bold transition-all"
              >
                <Banknote className="w-6 h-6 text-emerald-600" />
                <span>Cash Tender</span>
              </button>

              <button
                type="button"
                onClick={() => handleCheckout("Card")}
                className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 hover:bg-blue-50/50 flex flex-col items-center gap-2 text-xs font-bold transition-all"
              >
                <CreditCard className="w-6 h-6 text-blue-600" />
                <span>Credit Card</span>
              </button>

              <button
                type="button"
                onClick={() => handleCheckout("QR Code")}
                className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-purple-500 hover:bg-purple-50/50 flex flex-col items-center gap-2 text-xs font-bold transition-all"
              >
                <QrCode className="w-6 h-6 text-purple-600" />
                <span>KHQR Pay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TERMINAL LOCK OVERLAY */}
      {isLocked && selectedOutletUuid && (
        <TerminalLockOverlay
          outletUuid={selectedOutletUuid}
          cashierName={user?.name || "Active Cashier"}
          registerName={selectedRegister?.name || "Counter 1"}
          onUnlocked={() => {
            toast.success("Terminal Unlocked: Welcome back!");
          }}
        />
      )}

      {/* CASHIER PROFILE & PERMISSIONS MODAL */}
      {activeBusiness?.uuid && (
        <CashierProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          businessUuid={activeBusiness.uuid}
          businessUserUuid="current"
          userName={user?.name || "Current Cashier"}
          onSuccess={() => {
            if (selectedOutletUuid) fetchCurrentSession(selectedOutletUuid);
          }}
        />
      )}
    </div>
  );
}

export default function PosCashierTerminalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-500 animate-spin flex items-center justify-center font-bold">
              P
            </div>
            <p className="text-xs text-zinc-400">Loading POS Terminal...</p>
          </div>
        </div>
      }
    >
      <PosCashierTerminalContent />
    </Suspense>
  );
}
