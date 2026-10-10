
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Order, OrderItem, ProductDefinition, ClientDefinition, FinancialRecord, ScheduleEvent } from './types';
import { ChevronLeft, ChevronRight, Plus, Truck, CheckCircle, Trash, GripVertical, Settings, Pencil, Download, Upload, ChevronDown, ChevronUp, Phone, Search, Check, X, Calendar, Volume2, VolumeX } from './components/Icons';
import { getSmartLoadingAdvice } from './services/geminiService';
import { soundService } from './services/soundService';

const HOLIDAYS: Record<string, string> = {
  '01-01': '신정',
  '03-01': '삼일절',
  '05-05': '어린이날',
  '06-06': '현충일',
  '08-15': '광복절',
  '10-03': '개천절',
  '10-09': '한글날',
  '12-25': '성탄절',
  '2025-01-28': '설날',
  '2025-01-29': '설날',
  '2025-01-30': '설날',
  '2025-05-05': '부처님오신날',
  '2025-10-05': '추석',
  '2025-10-06': '추석',
  '2025-10-07': '추석',
  '2025-10-08': '대체공휴일'
};

const PRODUCT_CATEGORIES = ['생물미끼', '크릴', '파우다', '미끼', '조구', '기타'];
const CLIENT_CATEGORIES = ['마산', '통영', '거제'];

// Helper for Korean Chosung search
const getChosung = (str: string) => {
  const cho = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
  let result = "";
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i) - 44032;
    if (code > -1 && code < 11172) result += cho[Math.floor(code / 588)];
    else result += str.charAt(i);
  }
  return result;
};

const getProductCategoryColor = (category: string, isDark: boolean = false) => {
  switch (category) {
    case '크릴': return isDark ? 'text-red-400' : 'text-red-500';
    case '파우다': return isDark ? 'text-orange-400' : 'text-orange-500';
    case '미끼': return isDark ? 'text-green-400' : 'text-green-500';
    case '생물미끼': return isDark ? 'text-teal-400' : 'text-teal-500';
    case '조구': return isDark ? 'text-blue-400' : 'text-blue-500';
    case '기타': return isDark ? 'text-slate-400' : 'text-slate-500';
    default: return isDark ? 'text-slate-400' : 'text-slate-500';
  }
};

const getProductCategoryBadge = (category: string, isDark: boolean = false) => {
  if (isDark) {
    switch (category) {
      case '크릴': return 'bg-red-500/25 text-red-200 border border-red-400/50';
      case '파우다': return 'bg-orange-500/25 text-orange-200 border border-orange-400/50';
      case '미끼': return 'bg-green-500/25 text-green-200 border border-green-400/50';
      case '생물미끼': return 'bg-teal-500/25 text-teal-200 border border-teal-400/50';
      case '조구': return 'bg-blue-500/25 text-blue-200 border border-blue-400/50';
      case '기타': return 'bg-purple-500/25 text-purple-200 border border-purple-400/50';
      default: return 'bg-slate-700 text-slate-200 border border-slate-500/50';
    }
  }
  switch (category) {
    case '크릴': return 'bg-red-100 text-red-600';
    case '파우다': return 'bg-orange-100 text-orange-600';
    case '미끼': return 'bg-green-100 text-green-600';
    case '생물미끼': return 'bg-teal-100 text-teal-600';
    case '조구': return 'bg-blue-100 text-blue-600';
    case '기타': return 'bg-purple-100 text-purple-600';
    default: return 'bg-slate-100 text-slate-600';
  }
};

const getProductCategoryBgColor = (category: string) => {
  switch (category) {
    case '크릴': return 'bg-red-600';
    case '파우다': return 'bg-orange-600';
    case '미끼': return 'bg-green-600';
    case '생물미끼': return 'bg-teal-600';
    case '조구': return 'bg-blue-600';
    case '기타': return 'bg-slate-600';
    default: return 'bg-slate-600';
  }
};

const getCategorySummaryTheme = (category: string) => {
  switch (category) {
    case '크릴':
      return {
        cardBorder: 'border-rose-500/30',
        cardBg: 'bg-rose-950/25',
        headerBorder: 'border-rose-500/25',
        titleText: 'text-rose-300',
        titleBadge: 'bg-rose-500/20 text-rose-300 border-rose-500/35',
        numBadge: 'bg-rose-500/25 hover:bg-rose-500/40 text-rose-100 border-rose-400/40 hover:border-rose-300',
        idleCheck: 'border-rose-400/40 hover:border-rose-300',
        rowHover: 'hover:bg-rose-500/10',
      };
    case '파우다':
      return {
        cardBorder: 'border-amber-500/30',
        cardBg: 'bg-amber-950/25',
        headerBorder: 'border-amber-500/25',
        titleText: 'text-amber-300',
        titleBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/35',
        numBadge: 'bg-amber-500/25 hover:bg-amber-500/40 text-amber-100 border-amber-400/40 hover:border-amber-300',
        idleCheck: 'border-amber-400/40 hover:border-amber-300',
        rowHover: 'hover:bg-amber-500/10',
      };
    case '생물미끼':
      return {
        cardBorder: 'border-teal-500/30',
        cardBg: 'bg-teal-950/25',
        headerBorder: 'border-teal-500/25',
        titleText: 'text-teal-300',
        titleBadge: 'bg-teal-500/20 text-teal-300 border-teal-500/35',
        numBadge: 'bg-teal-500/25 hover:bg-teal-500/40 text-teal-100 border-teal-400/40 hover:border-teal-300',
        idleCheck: 'border-teal-400/40 hover:border-teal-300',
        rowHover: 'hover:bg-teal-500/10',
      };
    case '미끼':
      return {
        cardBorder: 'border-emerald-500/30',
        cardBg: 'bg-emerald-950/25',
        headerBorder: 'border-emerald-500/25',
        titleText: 'text-emerald-300',
        titleBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35',
        numBadge: 'bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-100 border-emerald-400/40 hover:border-emerald-300',
        idleCheck: 'border-emerald-400/40 hover:border-emerald-300',
        rowHover: 'hover:bg-emerald-500/10',
      };
    case '조구':
      return {
        cardBorder: 'border-sky-500/30',
        cardBg: 'bg-sky-950/25',
        headerBorder: 'border-sky-500/25',
        titleText: 'text-sky-300',
        titleBadge: 'bg-sky-500/20 text-sky-300 border-sky-500/35',
        numBadge: 'bg-sky-500/25 hover:bg-sky-500/40 text-sky-100 border-sky-400/40 hover:border-sky-300',
        idleCheck: 'border-sky-400/40 hover:border-sky-300',
        rowHover: 'hover:bg-sky-500/10',
      };
    case '기타':
    default:
      return {
        cardBorder: 'border-purple-500/30',
        cardBg: 'bg-purple-950/25',
        headerBorder: 'border-purple-500/25',
        titleText: 'text-purple-300',
        titleBadge: 'bg-purple-500/20 text-purple-300 border-purple-500/35',
        numBadge: 'bg-purple-500/25 hover:bg-purple-500/40 text-purple-100 border-purple-400/40 hover:border-purple-300',
        idleCheck: 'border-purple-400/40 hover:border-purple-300',
        rowHover: 'hover:bg-purple-500/10',
      };
  }
};

type WidgetType = 'CALENDAR' | 'SCHEDULE_LIST' | 'SUMMARY' | 'ORDER_LIST' | 'DAILY_CLOSING';

const App: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('smart_orders_v11'); 
    return saved ? JSON.parse(saved) : [];
  });

  const [products, setProducts] = useState<ProductDefinition[]>(() => {
    const saved = localStorage.getItem('smart_products_v11');
    return saved ? JSON.parse(saved) : []; 
  });

  const [clients, setClients] = useState<ClientDefinition[]>(() => {
    const saved = localStorage.getItem('smart_clients_v11');
    return saved ? JSON.parse(saved) : []; 
  });

  const [financials, setFinancials] = useState<FinancialRecord[]>(() => {
    const saved = localStorage.getItem('smart_financials_v11');
    return saved ? JSON.parse(saved) : [];
  });

  const [schedules, setSchedules] = useState<ScheduleEvent[]>(() => {
    const saved = localStorage.getItem('smart_schedules_v11');
    return saved ? JSON.parse(saved) : [];
  });

  // Widget State
  const [layoutOrder, setLayoutOrder] = useState<WidgetType[]>(() => {
    const saved = localStorage.getItem('smart_layout_v11');
    const parsed: WidgetType[] = saved ? JSON.parse(saved) : ['SUMMARY', 'ORDER_LIST'];
    const filtered = parsed.filter(t => t !== 'DAILY_CLOSING' && t !== 'CALENDAR' && t !== 'SCHEDULE_LIST');
    return filtered.length > 0 ? filtered : ['SUMMARY', 'ORDER_LIST'];
  });
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });
  
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showProductManager, setShowProductManager] = useState(false);
  const [showClientManager, setShowClientManager] = useState(false);
  const [showDataManager, setShowDataManager] = useState(false);
  const [showItemSearchManager, setShowItemSearchManager] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [summaryItemDetail, setSummaryItemDetail] = useState<{ name: string, category: string } | null>(null);
  
  // Sound effects state & global click sound listener
  const [isSoundOn, setIsSoundOn] = useState(() => soundService.isEnabled());

  useEffect(() => {
    const cleanup = soundService.initGlobalClickListener();
    return cleanup;
  }, []);

  const [aiAdvice, setAiAdvice] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Drag states
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);
  const [draggedWidget, setDraggedWidget] = useState<WidgetType | null>(null);
  
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleEvent | null>(null);
  
  // Draft state for OrderForm (to preserve data when switching modals)
  const [orderDraft, setOrderDraft] = useState<{ clientName: string, itemsStr: string, memo: string, date?: string } | null>(null);

  // Collapse state for Order List
  const [collapsedOrders, setCollapsedOrders] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('smart_collapsed_orders_v1');
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch (e) {
        return new Set();
      }
    }
    return new Set();
  });

  // Category filter state for Order List
  const [selectedCategories, setSelectedCategories] = useState<string[]>(PRODUCT_CATEGORIES);
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [showOnlyUnloaded, setShowOnlyUnloaded] = useState(false);
  const [hideDelivered, setHideDelivered] = useState(false);

  useEffect(() => { localStorage.setItem('smart_orders_v11', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('smart_products_v11', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('smart_clients_v11', JSON.stringify(clients)); }, [clients]);
  useEffect(() => { localStorage.setItem('smart_financials_v11', JSON.stringify(financials)); }, [financials]);
  useEffect(() => { localStorage.setItem('smart_schedules_v11', JSON.stringify(schedules)); }, [schedules]);
  useEffect(() => { localStorage.setItem('smart_layout_v11', JSON.stringify(layoutOrder)); }, [layoutOrder]);
  useEffect(() => { localStorage.setItem('smart_collapsed_orders_v1', JSON.stringify(Array.from(collapsedOrders))); }, [collapsedOrders]);

  function formatDate(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const getHolidayName = (date: Date) => {
    const fullDate = formatDate(date);
    const monthDay = fullDate.substring(5);
    return HOLIDAYS[fullDate] || HOLIDAYS[monthDay] || null;
  };

  const monthYear = useMemo(() => {
    return currentDate.toLocaleString('ko-KR', { month: 'long', year: 'numeric' });
  }, [currentDate]);

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= lastDate; i++) days.push(new Date(year, month, i));
    return days;
  }, [currentDate]);

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const parseShortcuts = (input: string): OrderItem[] => {
    const parts = input.split(/[\s,]+/).map(p => p.trim()).filter(p => p !== "");
    const parsedItems: OrderItem[] = [];

    parts.forEach(part => {
      const match = part.match(/^([a-zA-Z가-힣]+)([\d]+(\.\d)?)$/);
      if (match) {
        const shortcut = match[1].toUpperCase();
        const unitQty = parseFloat(match[2]) || 0;
        const product = products.find(p => p.shortcut.toUpperCase() === shortcut);
        if (product) {
          parsedItems.push({
            id: Math.random().toString(36).substr(2, 9),
            productId: product.id,
            name: product.name,
            category: product.category,
            unitQuantity: unitQty,
            isLoaded: false
          });
        } else {
          parsedItems.push({
            id: Math.random().toString(36).substr(2, 9),
            productId: 'unregistered',
            name: `${shortcut} (없음)`,
            category: '기타',
            unitQuantity: unitQty,
            isLoaded: false,
            isUnregistered: true
          });
        }
      }
    });
    return parsedItems;
  };

  const reconstructItemsStr = (items: OrderItem[]) => {
    return items.map(i => {
        const p = products.find(prod => prod.id === i.productId);
        let code = p ? p.shortcut : i.name;
        if (i.isUnregistered) {
            code = code.replace(' (없음)', '');
        }
        return `${code}${i.unitQuantity}`;
    }).join(' ');
  };

  const handleSaveOrder = (clientName: string, itemsStr: string, memo: string, orderDate: string) => {
    if (!orderDate || !clientName || !itemsStr) return;
    const items = parseShortcuts(itemsStr);
    if (items.length === 0) return;

    items.sort((a, b) => {
      const idxA = PRODUCT_CATEGORIES.indexOf(a.category);
      const idxB = PRODUCT_CATEGORIES.indexOf(b.category);
      const categoryOrderA = idxA === -1 ? 999 : idxA;
      const categoryOrderB = idxB === -1 ? 999 : idxB;
      if (categoryOrderA !== categoryOrderB) {
        return categoryOrderA - categoryOrderB;
      }
      return a.name.localeCompare(b.name);
    });

    if (editingOrder) {
      // 품목 수정 시 기존 체크박스(isLoaded) 상태와 ID를 기억하여 복원
      const availableExisting = [...editingOrder.items];

      const updatedItems = items.map(item => {
        const key = item.productId && item.productId !== 'unregistered' ? item.productId : item.name;
        
        // 1. 기존 품목 중 동일 품목이면서 isLoaded: true인 항목 우선 매칭
        const trueMatchIdx = availableExisting.findIndex(prev => {
          const prevKey = prev.productId && prev.productId !== 'unregistered' ? prev.productId : prev.name;
          return prevKey === key && prev.isLoaded;
        });

        if (trueMatchIdx !== -1) {
          const [matched] = availableExisting.splice(trueMatchIdx, 1);
          return {
            ...item,
            id: matched.id,
            isLoaded: true // 체크박스 상태 유지
          };
        }

        // 2. 기존 품목 중 동일 품목 매칭 (isLoaded: false)
        const anyMatchIdx = availableExisting.findIndex(prev => {
          const prevKey = prev.productId && prev.productId !== 'unregistered' ? prev.productId : prev.name;
          return prevKey === key;
        });

        if (anyMatchIdx !== -1) {
          const [matched] = availableExisting.splice(anyMatchIdx, 1);
          return {
            ...item,
            id: matched.id,
            isLoaded: false
          };
        }

        return item;
      });

      setOrders(prev => prev.map(o => o.id === editingOrder.id ? { ...o, clientName, items: updatedItems, memo, date: orderDate } : o));
      setEditingOrder(null);
      setOrderDraft(null);
    } else {
      const newOrder: Order = {
        id: Math.random().toString(36).substr(2, 9),
        clientName,
        date: orderDate,
        createdAt: Date.now(),
        items,
        memo
      };
      
      setOrders(prev => {
        const newOrders = [...prev];
        const sameDayOrders = newOrders.filter(o => o.date === orderDate);
        const client = clients.find(c => c.name === clientName);
        const newSeq = client?.sequence ?? 999;

        // Find the correct insertion point relative to other orders of the SAME date
        // Orders should be added according to client sequence among existing day orders
        const nextOrderOnDay = sameDayOrders.find(o => {
          const oClient = clients.find(c => c.name === o.clientName);
          const oSeq = oClient?.sequence ?? 999;
          return oSeq > newSeq;
        });

        if (nextOrderOnDay) {
          const insertIdx = newOrders.findIndex(o => o.id === nextOrderOnDay.id);
          newOrders.splice(insertIdx, 0, newOrder);
        } else {
          // No order with a later sequence exists for this day, 
          // find the LAST order of this day and insert after it.
          const lastOrderOnDayIdx = [...newOrders].reverse().findIndex(o => o.date === orderDate);
          if (lastOrderOnDayIdx !== -1) {
            const insertIdx = newOrders.length - lastOrderOnDayIdx;
            newOrders.splice(insertIdx, 0, newOrder);
          } else {
            // No orders for this day yet, append for simplicity
            newOrders.push(newOrder);
          }
        }
        return newOrders;
      });
    }
    setShowOrderForm(false);
    setOrderDraft(null); // Clear draft after save
  };

  const handleSaveSchedule = (title: string, content: string, time: string, alarm: number, scheduleDate?: string) => {
    const targetDate = scheduleDate || selectedDate || formatDate(new Date());
    if (!targetDate || !title.trim()) return;
    
    if (editingSchedule) {
        setSchedules(prev => prev.map(s => s.id === editingSchedule.id ? { ...s, title: title.trim(), content, time, alarm, date: targetDate } : s));
        setEditingSchedule(null);
    } else {
        const newSchedule: ScheduleEvent = {
            id: Math.random().toString(36).substr(2, 9),
            title: title.trim(),
            content,
            date: targetDate,
            time,
            alarm,
            createdAt: Date.now()
        };
        setSchedules(prev => [...prev, newSchedule]);
        setSelectedDate(targetDate);
    }
    setShowScheduleForm(false);
  };

  const deleteOrder = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    if (confirm('이 주문을 삭제하시겠습니까?')) {
      setOrders(prev => prev.filter(o => o.id !== orderId));
    }
  };

  const deleteSchedule = (e: React.MouseEvent, scheduleId: string) => {
      e.stopPropagation();
      if (confirm('이 일정을 삭제하시겠습니까?')) {
          setSchedules(prev => prev.filter(s => s.id !== scheduleId));
      }
  };

  const startEditOrder = (order: Order) => {
    setEditingOrder(order);
    setShowOrderForm(true);
  };

  const startEditSchedule = (schedule: ScheduleEvent) => {
      setEditingSchedule(schedule);
      setShowScheduleForm(true);
  };

  const toggleItemLoaded = (orderId: string, itemId: string) => {
    let nextLoadedState = true;
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      return {
        ...order,
        items: order.items.map(item => {
          if (item.id === itemId) {
            nextLoadedState = !item.isLoaded;
            return { ...item, isLoaded: nextLoadedState };
          }
          return item;
        })
      };
    }));
    soundService.playLoadSound(nextLoadedState);
  };

  const toggleAllItemsByNameAndCategory = (targetName: string, targetCategory: string, willBeLoaded: boolean) => {
    soundService.playLoadSound(willBeLoaded);
    setOrders(prev => prev.map(order => {
      if (order.date !== selectedDate) return order;
      if (collapsedOrders.has(order.id)) return order;
      const hasTarget = order.items.some(i => i.name === targetName && (i.category || '기타') === targetCategory);
      if (!hasTarget) return order;

      return {
        ...order,
        items: order.items.map(item => {
          if (item.name === targetName && (item.category || '기타') === targetCategory) {
            return { ...item, isLoaded: willBeLoaded };
          }
          return item;
        })
      };
    }));
  };

  const toggleOrderDelivered = (orderId: string) => {
    let nextDelivered = true;
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      nextDelivered = !order.isDelivered;
      return {
        ...order,
        isDelivered: nextDelivered
      };
    }));
    if (nextDelivered) {
      soundService.playSuccessSound();
    } else {
      soundService.playButtonClick();
    }
  };

  const toggleOrderCollapse = (orderId: string) => {
    setCollapsedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const updateFinancialRecord = (date: string, field: keyof FinancialRecord, value: string | boolean) => {
    let parsedValue: any = value;
    if (typeof value === 'string' && field !== 'expenseMemo') {
      parsedValue = parseInt(value.replace(/,/g, ''), 10) || 0;
    }
    
    setFinancials(prev => {
      const existing = prev.find(f => f.date === date);
      if (existing) {
        return prev.map(f => f.date === date ? { ...f, [field]: parsedValue } : f);
      } else {
        return [...prev, { date, cash: 0, transfer: 0, card: 0, note: 0, expense: 0, expenseMemo: '', isClosed: false, [field]: parsedValue } as FinancialRecord];
      }
    });
  };

  const selectedDateOrders = useMemo(() => {
    if (!selectedDate) return [];
    return orders
      .filter(o => o.date === selectedDate)
      .sort((a, b) => {
        const clientA = clients.find(c => c.name === a.clientName);
        const clientB = clients.find(c => c.name === b.clientName);
        const seqA = clientA?.sequence ?? 999;
        const seqB = clientB?.sequence ?? 999;
        if (seqA !== seqB) return seqA - seqB;
        return a.createdAt - b.createdAt;
      });
  }, [orders, selectedDate, clients]);

  const selectedDateSchedules = useMemo(() => {
      if (!selectedDate) return [];
      return schedules.filter(s => s.date === selectedDate);
  }, [schedules, selectedDate]);

  const selectedFinancial = useMemo(() => {
    if (!selectedDate) return { cash: 0, transfer: 0, card: 0, note: 0, expense: 0 };
    return financials.find(f => f.date === selectedDate) || { cash: 0, transfer: 0, card: 0, note: 0, expense: 0 };
  }, [financials, selectedDate]);

  const categoryTotals = useMemo(() => {
    const totals: Record<string, Record<string, number>> = {};
    selectedDateOrders.forEach(o => {
      // Exclude items from orders that are currently collapsed (hidden)
      if (collapsedOrders.has(o.id)) return;
      
      o.items.forEach(i => {
        const cat = i.category || '기타';
        if (!selectedCategories.includes(cat)) return;
        if (!totals[cat]) totals[cat] = {};
        if (!totals[cat][i.name]) totals[cat][i.name] = 0;
        totals[cat][i.name] += i.unitQuantity;
      });
    });
    return totals;
  }, [selectedDateOrders, selectedCategories, collapsedOrders]);

  const changeDateByDays = (days: number) => {
    if (!selectedDate) return;
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    const newDateStr = formatDate(d);
    setSelectedDate(newDateStr);
    setCurrentDate(d);
  };

  const fetchAiAdvice = async () => {
    if (selectedDateOrders.length === 0) return;
    setIsAiLoading(true);
    const advice = await getSmartLoadingAdvice(selectedDateOrders);
    setAiAdvice(advice);
    setIsAiLoading(false);
  };

  // --- Order Drag & Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.stopPropagation(); // Prevent widget drag
    setDraggedOrderId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedOrderId || draggedOrderId === id) return;
    
    // Ensure we are not dragging a widget
    if (draggedWidget) return;

    const newOrders = [...orders];
    const draggedIdx = newOrders.findIndex(o => o.id === draggedOrderId);
    const targetIdx = newOrders.findIndex(o => o.id === id);
    if (draggedIdx > -1 && targetIdx > -1) {
      const [draggedItem] = newOrders.splice(draggedIdx, 1);
      newOrders.splice(targetIdx, 0, draggedItem);
      setOrders(newOrders);
    }
  };

  const handleDragEnd = () => setDraggedOrderId(null);

  // --- Widget Drag & Drop Handlers ---
  const handleWidgetDragStart = (e: React.DragEvent, type: WidgetType) => {
    e.stopPropagation();
    setDraggedWidget(type);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleWidgetDragOver = (e: React.DragEvent, targetType: WidgetType) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Ensure we are dragging a widget, not an order
    if (!draggedWidget || draggedWidget === targetType || draggedOrderId) return;

    const newLayout = [...layoutOrder];
    const draggedIdx = newLayout.indexOf(draggedWidget);
    const targetIdx = newLayout.indexOf(targetType);
    
    if (draggedIdx > -1 && targetIdx > -1) {
      newLayout.splice(draggedIdx, 1);
      newLayout.splice(targetIdx, 0, draggedWidget);
      setLayoutOrder(newLayout);
    }
  };

  const handleWidgetDragEnd = () => {
    setDraggedWidget(null);
  };

  const handleImportData = (data: any, message?: string) => {
    if (data.orders) setOrders(data.orders);
    if (data.products) setProducts(data.products);
    if (data.clients) setClients(data.clients);
    if (data.financials) setFinancials(data.financials);
    if (data.schedules) setSchedules(data.schedules);
    setShowDataManager(false);
    alert(message || '데이터가 성공적으로 복원되었습니다.');
  };

  const handleSelectClientForOrder = (clientName: string) => {
    setOrderDraft(prev => ({ 
        clientName: clientName, 
        itemsStr: prev?.itemsStr || '',
        memo: prev?.memo || '',
        date: prev?.date
    }));
    setShowClientManager(false);
    setShowOrderForm(true);
  };

  const handleSelectProductForOrder = (product: ProductDefinition) => {
      setOrderDraft(prev => ({
          clientName: prev?.clientName || '',
          itemsStr: (prev?.itemsStr ? prev.itemsStr + ' ' : '') + product.shortcut,
          memo: prev?.memo || '',
          date: prev?.date
      }));
      setShowProductManager(false);
      setShowOrderForm(true);
  };

  const handleOpenProductManagerFromOrder = (currentClientName: string, currentItemsStr: string, currentMemo: string, currentDate: string) => {
      setOrderDraft({ clientName: currentClientName, itemsStr: currentItemsStr, memo: currentMemo, date: currentDate });
      setShowOrderForm(false);
      setShowProductManager(true);
  };

  const handleOpenClientManagerFromOrder = (currentClientName: string, currentItemsStr: string, currentMemo: string, currentDate: string) => {
      setOrderDraft({ clientName: currentClientName, itemsStr: currentItemsStr, memo: currentMemo, date: currentDate });
      setShowOrderForm(false);
      setShowClientManager(true);
  };

  const handleCloseOrderForm = () => {
      setShowOrderForm(false); 
      setEditingOrder(null); 
      setOrderDraft(null);
  };

  const handleCloseScheduleForm = () => {
      setShowScheduleForm(false);
      setEditingSchedule(null);
  };

  const renderCalendar = () => (
    <div className="overflow-hidden">
      <div className="grid grid-cols-7 border-b border-slate-100 mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
          <div key={day} className={`py-2 text-center text-xs font-extrabold uppercase tracking-wider ${idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-slate-400'}`}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((date, idx) => {
          if (!date) return <div key={`empty-${idx}`} className="aspect-square bg-slate-50/20 rounded-xl" />;
          const dateStr = formatDate(date);
          const dayOrders = orders.filter(o => o.date === dateStr);
          const daySchedules = schedules.filter(s => s.date === dateStr);
          const isSelected = selectedDate === dateStr;
          const isToday = formatDate(new Date()) === dateStr;
          const holidayName = getHolidayName(date);
          const dayOfWeek = date.getDay();
          const isSunday = dayOfWeek === 0;
          const isSaturday = dayOfWeek === 6;
          const fin = financials.find(f => f.date === dateStr);
          const hasFinancial = fin && (fin.cash > 0 || fin.transfer > 0 || fin.card > 0 || fin.note > 0);

          return (
            <div 
              key={dateStr} 
              onClick={() => setSelectedDate(dateStr)} 
              className={`aspect-square p-1 md:p-2 cursor-pointer transition-all rounded-xl relative overflow-hidden flex flex-col justify-between border ${
                isSelected 
                  ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20' 
                  : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-xs md:text-sm font-extrabold w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday 
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-200' 
                    : holidayName || isSunday 
                      ? 'text-red-500' 
                      : isSaturday 
                        ? 'text-blue-500' 
                        : 'text-slate-600'
                }`}>
                  {date.getDate()}
                </span>
                
                {dayOrders.length > 0 && (
                  <span className="bg-blue-50 text-blue-600 text-[9px] md:text-xs px-1.5 py-0.5 rounded-lg font-black border border-blue-100/50">
                    {dayOrders.length}
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between gap-1 mt-auto">
                <div className="flex gap-0.5 items-center">
                  {hasFinancial && (
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="매출 입력됨"></div>
                  )}
                  {daySchedules.length > 0 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" title="일정 있음"></div>
                  )}
                </div>
                {holidayName && (
                  <span className="text-[8px] md:text-[9px] text-red-400 font-bold truncate max-w-[40px]">
                    {holidayName}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100">
        <button onClick={() => setShowScheduleForm(true)} className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-slate-600 font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs text-xs">
           <Plus className="w-4 h-4 text-slate-500" />
           <span>새 일정 추가</span>
        </button>
      </div>
    </div>
  );

  const renderScheduleList = () => {
    if (selectedDateSchedules.length === 0) {
      return (
        <div className="py-8 text-center text-slate-400 text-xs font-medium bg-slate-50/50 rounded-xl border border-slate-100">
          이날은 등록된 일정이 없습니다.
        </div>
      );
    }
    return (
      <div className="space-y-2">
        {selectedDateSchedules.map(sch => (
            <div key={sch.id} className="bg-amber-50/50 border border-amber-100/60 rounded-xl p-3.5 flex justify-between items-start group hover:border-amber-200 hover:bg-amber-50 transition-all shadow-xs">
                <div onClick={() => startEditSchedule(sch)} className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 flex-wrap">
                        {sch.time && <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-lg border border-amber-200/50">{sch.time}</span>}
                        <span className="font-extrabold text-sm text-slate-800">{sch.title}</span>
                        {sch.alarm > 0 && <span className="text-[9px] text-amber-600 bg-white/80 px-2 py-0.5 rounded-lg border border-amber-100/60 font-bold">🔔 {sch.alarm < 60 ? `${sch.alarm}분 전` : `${sch.alarm / 60}시간 전`}</span>}
                    </div>
                    {sch.content && <p className="text-xs text-slate-600 mt-2 pl-2 border-l-2 border-amber-300 font-medium leading-relaxed">{sch.content}</p>}
                </div>
                <button onClick={(e) => deleteSchedule(e, sch.id)} className="text-amber-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors ml-2"><Trash className="w-4 h-4" /></button>
            </div>
        ))}
      </div>
    );
  };

  const renderCalendarModal = () => (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setShowCalendarModal(false)}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden max-h-[92vh] border border-slate-100 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
                일정
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                setShowCalendarModal(false);
                setShowOrderForm(true);
              }}
              className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs flex items-center gap-1 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>주문 추가</span>
            </button>
            <button 
              onClick={() => setShowCalendarModal(false)} 
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: 2 Columns on Desktop */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-6">
          {/* Left Column: Calendar (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <div className="flex justify-between items-center bg-slate-50/80 border border-slate-200/60 p-2.5 rounded-2xl">
              <button 
                onClick={handlePrevMonth}
                className="p-2 hover:bg-white text-slate-600 rounded-xl transition-all shadow-xs border border-transparent hover:border-slate-200/60"
                title="이전 달"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-sm font-black text-slate-800 font-mono tracking-tight">
                {monthYear}
              </div>
              <button 
                onClick={handleNextMonth}
                className="p-2 hover:bg-white text-slate-600 rounded-xl transition-all shadow-xs border border-transparent hover:border-slate-200/60"
                title="다음 달"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white border border-slate-200/60 rounded-2xl p-3 shadow-xs">
              {renderCalendar()}
            </div>
          </div>

          {/* Right Column: Schedule for selected date (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-3">
            <div className="bg-slate-50/80 border border-slate-200/60 p-3 rounded-2xl flex justify-between items-center">
              <div>
                <span className="text-xs font-black text-slate-800 font-mono">📅 {selectedDate}</span>
                <span className="text-[11px] text-slate-500 font-medium ml-2">선택일 일정</span>
              </div>
              <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                {selectedDateSchedules.length}건
              </span>
            </div>

            <div className="flex-1 min-h-[220px] max-h-[380px] lg:max-h-[500px] overflow-y-auto space-y-2 pr-0.5">
              {renderScheduleList()}
            </div>

            <button 
              onClick={() => setShowScheduleForm(true)} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-2xl transition-all shadow-sm shadow-blue-200 text-xs flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>{selectedDate} 새 일정 등록</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSummary = () => (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-slate-200/50">
         <div className="flex items-center gap-1.5 bg-slate-100/80 rounded-xl p-1 border border-slate-200/60">
            <button 
               onClick={() => changeDateByDays(-1)}
               className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-500 hover:text-slate-800"
               title="전날"
            >
               <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-px h-3 bg-slate-200 mx-0.5" />
            <button 
               onClick={() => changeDateByDays(1)}
               className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-500 hover:text-slate-800"
               title="다음 날"
            >
               <ChevronRight className="w-4 h-4" />
            </button>
         </div>
         <div className="text-xs text-slate-600 font-extrabold bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/60 font-mono">{selectedDate} 기준</div>
      </div>
      
      <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-xl">
        <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2.5">
           <h4 className="text-sm font-black uppercase tracking-widest text-slate-200">카테고리별 품목 합계</h4>
           <div className="text-xs text-slate-400 font-medium font-mono">{selectedDate} 기준</div>
        </div>
        {Object.keys(categoryTotals).length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">{selectedDateOrders.length === 0 ? '등록된 주문 내역이 없습니다.' : '선택된 카테고리의 품목이 없습니다.'}</p>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PRODUCT_CATEGORIES.map(category => ({ category, items: categoryTotals[category] }))
                .filter((group): group is { category: string, items: Record<string, number> } => !!group.items && Object.keys(group.items).length > 0)
                .map(({ category, items }) => {
                  const categoryTotal = Object.values(items).reduce((acc, count) => acc + count, 0);
                  const sortedItems = Object.entries(items).sort((a, b) => (b[1] as number) - (a[1] as number) || a[0].localeCompare(b[0]));
                  const theme = getCategorySummaryTheme(category);
                  
                  const allCategoryItemsLoaded = sortedItems.length > 0 && sortedItems.every(([name]) => {
                    const matchingItems: { isLoaded: boolean }[] = [];
                    selectedDateOrders.forEach(o => {
                      if (collapsedOrders.has(o.id)) return;
                      o.items.forEach(i => {
                        if (i.name === name && (i.category || '기타') === category) {
                          matchingItems.push({ isLoaded: !!i.isLoaded });
                        }
                      });
                    });
                    return matchingItems.length > 0 && matchingItems.every(m => m.isLoaded);
                  });

                  return (
                    <div 
                      key={category} 
                      className={`rounded-2xl border ${theme.cardBorder} ${theme.cardBg} p-3.5 space-y-2 flex flex-col transition-all shadow-xs`}
                    >
                      {/* Category Header: Divided strictly by category */}
                      <div className={`flex justify-between items-center border-b ${theme.headerBorder} pb-2`}>
                        <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${theme.titleBadge}`}>
                          {category}
                        </span>
                        {allCategoryItemsLoaded ? (
                          <span className="text-[10px] font-extrabold text-emerald-400 flex items-center gap-1 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            <CheckCircle className="w-3 h-3" />
                            상차 완료
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold text-slate-300 bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                            총 {Number(categoryTotal.toFixed(1))}개
                          </span>
                        )}
                      </div>

                      {/* Items list: No individual box/borders ("칸 없앰"), clean unified rows inside category */}
                      <div className="space-y-0.5 divide-y divide-white/5 flex-1">
                        {sortedItems.map(([name, count], idx) => {
                          const matchingItems: { isLoaded: boolean }[] = [];
                          selectedDateOrders.forEach(o => {
                            if (collapsedOrders.has(o.id)) return;
                            o.items.forEach(i => {
                              if (i.name === name && (i.category || '기타') === category) {
                                matchingItems.push({ isLoaded: !!i.isLoaded });
                              }
                            });
                          });

                          const isAllLoaded = matchingItems.length > 0 && matchingItems.every(m => m.isLoaded);
                          const isSomeLoaded = matchingItems.length > 0 && matchingItems.some(m => m.isLoaded);

                          return (
                            <div 
                              key={name} 
                              onClick={() => toggleAllItemsByNameAndCategory(name, category, !isAllLoaded)}
                              title={isAllLoaded ? "클릭 시 상차 해제" : "클릭 시 해당 품목 전체 상차 완료"}
                              className={`flex items-center gap-2.5 px-2.5 py-2 cursor-pointer transition-all rounded-lg select-none ${
                                isAllLoaded 
                                  ? 'bg-emerald-500/15 text-emerald-200' 
                                  : `${theme.rowHover} text-white`
                              }`}
                            >
                              {/* Round Check status button */}
                              <div
                                className={`w-4.5 h-4.5 flex-shrink-0 rounded-full border flex items-center justify-center transition-all ${
                                  isAllLoaded 
                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs' 
                                    : isSomeLoaded
                                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                                      : `${theme.idleCheck} bg-white/5 text-transparent`
                                }`}
                              >
                                {isAllLoaded && <Check className="w-3 h-3 stroke-[3]" />}
                                {!isAllLoaded && isSomeLoaded && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />}
                              </div>

                              {/* Item index */}
                              <span className="text-[10px] font-extrabold text-white/40 w-3 text-right">
                                {idx + 1}
                              </span>

                              {/* Item name (clicking anywhere on item toggles loading) */}
                              <div className="flex-1 overflow-hidden">
                                <span className={`text-xs font-bold truncate block ${
                                  isAllLoaded ? 'text-emerald-300 line-through opacity-85' : 'text-slate-100'
                                }`}>
                                  {name}
                                </span>
                              </div>

                              {/* Number button (clicking it opens ordering clients modal) */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSummaryItemDetail({ name, category });
                                }}
                                title="클릭 시 주문한 거래처 목록 보기"
                                className={`flex-shrink-0 text-[11px] font-black px-2.5 py-0.5 rounded-lg border transition-all cursor-pointer shadow-xs active:scale-95 ${
                                  isAllLoaded 
                                    ? `${theme.numBadge} ring-1 ring-emerald-400/40` 
                                    : `${theme.numBadge}`
                                }`}
                              >
                                {Number((count as number).toFixed(1))}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
        )}
      </div>
    </div>
  );

  const renderOrderList = () => {
    const visibleOrders = selectedDateOrders.map(order => {
      if (hideDelivered && order.isDelivered) {
        return { order, filteredItems: [] };
      }
      const filteredItems = order.items.filter(item => {
        if (showOnlyUnloaded && item.isLoaded) return false;
        const matchesCategory = selectedCategories.includes(item.category);
        const matchesSearch = !itemSearchTerm || 
                             item.name.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
                             (item.isUnregistered && item.name.toLowerCase().includes(itemSearchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
      });
      return { order, filteredItems };
    }).filter(g => g.filteredItems.length > 0);

    return (
    <div className="space-y-4">
      {/* Interactive Category Filter Pills */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] tracking-wider font-extrabold text-slate-400 uppercase">품목 카테고리 필터</span>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => {
              if (selectedCategories.length === PRODUCT_CATEGORIES.length) {
                setSelectedCategories([]);
              } else {
                setSelectedCategories([...PRODUCT_CATEGORIES]);
              }
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
              selectedCategories.length === PRODUCT_CATEGORIES.length
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-500 border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            전체 선택
          </button>
          {PRODUCT_CATEGORIES.map(category => {
            const isSelected = selectedCategories.includes(category);
            return (
              <button
                key={category}
                onClick={() => {
                  if (isSelected) {
                    setSelectedCategories(prev => prev.filter(c => c !== category));
                  } else {
                    setSelectedCategories(prev => [...prev, category]);
                  }
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-xs font-black'
                    : 'bg-white text-slate-500 border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Switcher & Item Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1.5">
          <button 
            onClick={() => changeDateByDays(-1)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1 bg-white hover:bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200/80 shadow-xs transition-colors text-xs font-bold text-slate-600"
          >
            <ChevronLeft className="w-4 h-4 text-slate-400" />
            <span>전날</span>
          </button>
          <button 
            onClick={() => changeDateByDays(1)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1 bg-white hover:bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200/80 shadow-xs transition-colors text-xs font-bold text-slate-600"
          >
            <span>다음날</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        <div className="relative flex-1">
          <input
            type="text"
            value={itemSearchTerm}
            onChange={(e) => setItemSearchTerm(e.target.value)}
            placeholder="품목명으로 주문 검색..."
            className="w-full bg-white border border-slate-200/80 rounded-xl pl-10 pr-8 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 shadow-xs transition-all"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          {itemSearchTerm && (
            <button 
              onClick={() => setItemSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 text-sm font-bold"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* 필터 스위치: 미상차 품목만 보기 & 납품 완료 거래처 가리기 */}
      <div className="grid grid-cols-2 gap-2">
        {/* 미상차 품목만 보기 Toggle Switch */}
        <div className="flex items-center justify-between bg-white border border-slate-200/80 px-3 sm:px-4 py-2.5 rounded-xl shadow-xs">
          <div className="flex flex-col min-w-0 pr-1">
            <span className="text-xs font-bold text-slate-700 truncate">미상차 품목만 보기</span>
            {showOnlyUnloaded ? (
              <span className="text-[10px] font-black text-blue-600 truncate">
                상차 완료 숨김
              </span>
            ) : (
              <span className="text-[10px] font-medium text-slate-400 truncate">
                전체 품목 표시
              </span>
            )}
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={showOnlyUnloaded}
            onClick={() => {
              soundService.playButtonClick();
              setShowOnlyUnloaded(!showOnlyUnloaded);
            }}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              showOnlyUnloaded ? 'bg-blue-600' : 'bg-slate-200'
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                showOnlyUnloaded ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 납품 완료 거래처 가리기 Toggle Switch */}
        <div className="flex items-center justify-between bg-white border border-slate-200/80 px-3 sm:px-4 py-2.5 rounded-xl shadow-xs">
          <div className="flex flex-col min-w-0 pr-1">
            <span className="text-xs font-bold text-slate-700 truncate">납품 완료 거래처 가리기</span>
            {hideDelivered ? (
              <span className="text-[10px] font-black text-emerald-600 truncate">
                납품 완료 숨김
              </span>
            ) : (
              <span className="text-[10px] font-medium text-slate-400 truncate">
                전체 거래처 표시
              </span>
            )}
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={hideDelivered}
            onClick={() => {
              soundService.playButtonClick();
              setHideDelivered(!hideDelivered);
            }}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              hideDelivered ? 'bg-emerald-600' : 'bg-slate-200'
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                hideDelivered ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Order List Cards */}
      {selectedDateOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200/80 p-6">
          <Truck className="w-10 h-10 text-slate-300 mb-2" />
          <p className="font-extrabold text-sm text-slate-500">등록된 주문이 없습니다.</p>
          <button onClick={() => setShowOrderForm(true)} className="mt-2 text-xs text-blue-600 font-extrabold hover:text-blue-700 transition-colors">새로운 주문을 추가해 보세요</button>
        </div>
      ) : visibleOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-14 bg-white rounded-2xl border border-dashed border-slate-200/80 p-6">
          {showOnlyUnloaded && hideDelivered ? (
            <>
              <CheckCircle className="w-9 h-9 text-emerald-500 mb-2" />
              <p className="font-extrabold text-sm text-slate-700">미상차 또는 납품 대기 중인 주문이 없습니다!</p>
              <div className="flex items-center justify-center gap-3 mt-2 text-xs font-extrabold">
                <button 
                  onClick={() => setShowOnlyUnloaded(false)}
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                >
                  상차 품목 보기
                </button>
                <span className="text-slate-300">·</span>
                <button 
                  onClick={() => setHideDelivered(false)}
                  className="text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  납품 거래처 보기
                </button>
              </div>
            </>
          ) : showOnlyUnloaded ? (
            <>
              <CheckCircle className="w-9 h-9 text-emerald-500 mb-2" />
              <p className="font-extrabold text-sm text-slate-700">모든 품목의 상차가 완료되었습니다!</p>
              <button 
                onClick={() => setShowOnlyUnloaded(false)}
                className="mt-2 text-xs text-blue-600 font-extrabold hover:text-blue-700 transition-colors"
              >
                전체 품목 다시 보기
              </button>
            </>
          ) : hideDelivered ? (
            <>
              <CheckCircle className="w-9 h-9 text-emerald-500 mb-2" />
              <p className="font-extrabold text-sm text-slate-700">모든 거래처의 납품이 완료되었습니다!</p>
              <button 
                onClick={() => setHideDelivered(false)}
                className="mt-2 text-xs text-emerald-600 font-extrabold hover:text-emerald-700 transition-colors"
              >
                전체 거래처 다시 보기
              </button>
            </>
          ) : (
            <p className="font-extrabold text-sm text-slate-500">조건에 맞는 품목이 없습니다.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {visibleOrders.map(({ order, filteredItems }) => {
            const totalQty = filteredItems.reduce((sum, i) => sum + i.unitQuantity, 0);
            const isCollapsed = collapsedOrders.has(order.id);
            const client = clients.find(c => c.name === order.clientName);
            
            return (
              <div 
                key={order.id} 
                draggable 
                onDragStart={(e) => handleDragStart(e, order.id)} 
                onDragOver={(e) => handleDragOver(e, order.id)} 
                onDragEnd={handleDragEnd}
                className={`bg-white border rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all ${
                  order.isDelivered 
                    ? 'border-emerald-200/60 bg-emerald-50/5' 
                    : 'border-slate-200/70'
                } ${draggedOrderId === order.id ? 'opacity-40 grayscale scale-[0.98]' : ''}`}
              >
                {/* Order Header */}
                <div className={`px-4 py-3 flex justify-between items-center border-b transition-colors ${
                  order.isDelivered 
                    ? 'bg-emerald-50/30 border-emerald-100/50' 
                    : 'bg-slate-50/60 border-slate-100'
                }`}>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleOrderCollapse(order.id); }} 
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-150/50 transition-all"
                    >
                        {isCollapsed ? <Plus className="w-3.5 h-3.5" /> : <div className="w-3 h-0.5 bg-current rounded" />}
                    </button>
                    {client?.phone ? (
                      <a 
                        href={`tel:${client.phone}`}
                        className={`font-black text-sm hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1.5 ${
                          order.isDelivered ? 'text-emerald-800' : 'text-slate-800'
                        }`}
                        title="클릭하여 전화 걸기"
                      >
                        <span>{order.clientName}</span>
                        <Phone className="w-3 h-3 text-slate-400" />
                      </a>
                    ) : (
                      <span className={`font-black text-sm ${
                        order.isDelivered ? 'text-emerald-800' : 'text-slate-800'
                      }`}>
                        {order.clientName}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1.5 items-center">
                    <button 
                      onClick={() => toggleOrderDelivered(order.id)}
                      className={`text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 hover:scale-102 ${
                        order.isDelivered 
                          ? 'bg-emerald-600 text-white shadow-xs' 
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {order.isDelivered && <CheckCircle className="w-3 h-3" />}
                      납품 완료
                    </button>
                    <button onClick={() => startEditOrder(order)} className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => deleteOrder(e, order.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                
                {/* Order Items - Unified by Client, row list without individual box cells */}
                {!isCollapsed && (
                  <div className="divide-y divide-slate-100 bg-white">
                      {filteredItems.map((item, idx) => (
                      <div 
                        key={item.id} 
                        onClick={() => toggleItemLoaded(order.id, item.id)}
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all ${
                          item.isLoaded 
                            ? 'bg-slate-900 text-white' 
                            : 'bg-white hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <span className={`text-[10px] font-extrabold w-4 text-right ${
                          item.isLoaded ? 'text-slate-400' : 'text-slate-300'
                        }`}>{idx + 1}</span>

                        <div className={`w-4.5 h-4.5 flex-shrink-0 rounded-full border flex items-center justify-center transition-all ${
                          item.isLoaded 
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs' 
                            : 'border-slate-300 bg-white'
                        }`}>
                          {item.isLoaded && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        
                        <div className="flex-1 flex justify-between items-center gap-2 overflow-hidden">
                          <div className="flex items-center gap-2 truncate">
                              <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                                getProductCategoryBadge(item.category, item.isLoaded)
                              }`}>
                                {item.category}
                              </span>
                              <span className={`text-xs font-bold truncate ${
                                item.isLoaded ? 'text-white' : 'text-slate-700'
                              } ${item.isUnregistered ? (item.isLoaded ? 'text-red-300 font-extrabold' : 'text-red-500 font-extrabold') : ''}`}>
                                  {item.name}
                              </span>
                              {item.isUnregistered && (
                                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md whitespace-nowrap border ${
                                    item.isLoaded 
                                      ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                                      : 'bg-red-50 text-red-500 border-red-100'
                                  }`}>미등록</span>
                              )}
                          </div>
                          <div className={`flex-shrink-0 text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg border ${
                            item.isLoaded 
                              ? 'bg-white/15 text-white border-white/20' 
                              : 'bg-slate-50 text-slate-600 border-slate-200/40'
                          }`}>
                            {item.unitQuantity}
                          </div>
                        </div>
                      </div>
                      ))}
                  </div>
                )}

                {/* Memo & Footer Summary */}
                {order.memo && !isCollapsed && (
                  <div className="px-4 py-2 border-t border-slate-50 bg-amber-50/20 text-amber-800">
                    <p className="text-xs font-medium italic leading-relaxed">* {order.memo}</p>
                  </div>
                )}
                <div className="bg-slate-50/40 px-4 py-2 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] tracking-wider font-extrabold text-slate-400 uppercase">개별 합계</span>
                    <span className="text-xs font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/50">{Number(totalQty.toFixed(1))} 개</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    );
  };

  const renderDailyClosing = () => {
    if (!selectedDate) return null;
    const isClosed = selectedFinancial.isClosed || false;
    
    return (
      <div className="space-y-5">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${isClosed ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
              <CheckCircle className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-black text-slate-800">
              {isClosed ? '일일 마감 확인됨' : '일일 마감 (매출 입력)'}
            </h4>
          </div>
          <button 
            onClick={() => updateFinancialRecord(selectedDate, 'isClosed', !isClosed)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              isClosed 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-xs' 
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {isClosed ? '✓ 마감 취소' : '마감 승인'}
          </button>
        </div>

        {/* Closing Form Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">현금 매출</label>
                <input type="text" 
                    value={selectedFinancial.cash.toLocaleString()} 
                    onChange={e => updateFinancialRecord(selectedDate, 'cash', e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-3 py-2.5 text-right text-sm font-extrabold text-slate-800 outline-none transition-all" 
                    placeholder="0" />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">지출액</label>
                <input type="text" 
                    value={(selectedFinancial.expense || 0).toLocaleString()} 
                    onChange={e => updateFinancialRecord(selectedDate, 'expense', e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 rounded-xl px-3 py-2.5 text-right text-sm font-extrabold text-red-500 outline-none transition-all" 
                    placeholder="0" />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">계좌 이체</label>
                <input type="text" 
                    value={selectedFinancial.transfer.toLocaleString()} 
                    onChange={e => updateFinancialRecord(selectedDate, 'transfer', e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-3 py-2.5 text-right text-sm font-extrabold text-slate-800 outline-none transition-all" 
                    placeholder="0" />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">카드 결제</label>
                <input type="text" 
                    value={selectedFinancial.card.toLocaleString()} 
                    onChange={e => updateFinancialRecord(selectedDate, 'card', e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 rounded-xl px-3 py-2.5 text-right text-sm font-extrabold text-slate-800 outline-none transition-all" 
                    placeholder="0" />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">어음 수취</label>
                <input type="text" 
                    value={selectedFinancial.note.toLocaleString()} 
                    onChange={e => updateFinancialRecord(selectedDate, 'note', e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-xl px-3 py-2.5 text-right text-sm font-extrabold text-slate-800 outline-none transition-all" 
                    placeholder="0" />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">순현금 (현금 - 지출)</label>
                <div className="w-full bg-emerald-50/50 border border-emerald-200/60 rounded-xl px-3 py-2.5 text-right text-sm font-black text-emerald-700 flex items-center justify-end h-[42px]">
                    {(selectedFinancial.cash - (selectedFinancial.expense || 0)).toLocaleString()}원
                </div>
            </div>
            <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">지출 상세 내역</label>
                <input type="text" 
                    value={selectedFinancial.expenseMemo || ''} 
                    onChange={e => updateFinancialRecord(selectedDate, 'expenseMemo', e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none transition-all" 
                    placeholder="예: 식대, 유류비, 소모품 구매 등" />
            </div>
        </div>

        {/* Summary Block */}
        <div className="flex justify-between items-center py-3.5 px-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <span className="font-extrabold text-slate-500 text-xs tracking-wider uppercase">일일 합계 (순현금 + 이체 + 카드 + 어음)</span>
            <span className="font-black text-base text-slate-800">
                {(selectedFinancial.cash - (selectedFinancial.expense || 0) + selectedFinancial.transfer + selectedFinancial.card + selectedFinancial.note).toLocaleString()}원
            </span>
        </div>

        {/* AI Insight Box */}
        <div className="p-4 bg-slate-50 border border-slate-150/85 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold text-blue-600 tracking-wider uppercase">AI 상차 분석 어드바이스</span>
                {!aiAdvice && !isAiLoading && (
                  <button 
                    onClick={fetchAiAdvice} 
                    className="text-[10px] bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg font-black shadow-sm shadow-blue-100 transition-all hover:shadow-md"
                  >
                    분석 실행
                  </button>
                )}
            </div>
            {isAiLoading ? (
                <div className="space-y-2 py-1">
                  <div className="h-2 bg-slate-200/80 rounded w-full animate-pulse" />
                  <div className="h-2 bg-slate-200/80 rounded w-4/5 animate-pulse" />
                </div> 
            ) : aiAdvice ? (
                <p className="text-xs leading-relaxed font-bold text-slate-600">"{aiAdvice}"</p>
            ) : (
                <p className="text-[11px] text-slate-400 font-bold">상단의 분석 실행 단추를 누르면 오늘의 상차 분석 제안을 계산합니다.</p>
            )}
        </div>
      </div>
    );
  };

  const getWidgetTitle = (type: WidgetType) => {
    switch (type) {
      case 'CALENDAR': return `${monthYear} 캘린더`;
      case 'SCHEDULE_LIST': return '오늘의 일정';
      case 'SUMMARY': return '카테고리별 주문 합계';
      case 'ORDER_LIST': return `주문 목록 (${selectedDateOrders.length})`;
      case 'DAILY_CLOSING': return '일일 마감';
      default: return '';
    }
  };

  const getWidgetContent = (type: WidgetType) => {
    switch (type) {
      case 'CALENDAR': return renderCalendar();
      case 'SCHEDULE_LIST': return renderScheduleList();
      case 'SUMMARY': return renderSummary();
      case 'ORDER_LIST': return renderOrderList();
      case 'DAILY_CLOSING': return renderDailyClosing();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-900 pb-20">
      <main className="flex-1 max-w-4xl mx-auto w-full px-2.5 py-3 sm:px-6 sm:py-6 space-y-4">
        {/* Main Header */}
        <div className="flex flex-col gap-2.5">
           <div className="flex justify-between items-center gap-3">
             <div className="flex items-center gap-2.5">
               <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
               </div>
               <div>
                  <input 
                    type="date" 
                    value={selectedDate || ''} 
                    onChange={(e) => {
                      if (e.target.value) {
                        setSelectedDate(e.target.value);
                        setCurrentDate(new Date(e.target.value));
                      }
                    }}
                    className="text-lg font-black text-slate-800 bg-transparent border-none outline-none cursor-pointer p-0 m-0 block hover:text-blue-600 transition-colors"
                  />
                  <p className="text-[10px] tracking-wider font-extrabold text-slate-400 uppercase">Today's Schedule</p>
               </div>
             </div>
             <div className="flex items-center gap-1.5 flex-shrink-0">
               <button 
                 onClick={() => {
                   const next = soundService.toggleSound();
                   setIsSoundOn(next);
                 }}
                 title={isSoundOn ? "버튼 효과음 켜짐 (클릭하여 끄기)" : "버튼 효과음 꺼짐 (클릭하여 켜기)"}
                 className={`p-2 rounded-xl transition-all active:scale-95 flex items-center justify-center border shadow-xs ${
                   isSoundOn 
                     ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100" 
                     : "bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200"
                 }`}
               >
                 {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
               </button>
               <button onClick={() => setShowCalendarModal(true)} className="bg-white hover:bg-slate-50 text-blue-600 px-3.5 py-2 rounded-xl font-bold transition-all active:scale-95 text-xs flex items-center justify-center gap-1.5 border border-blue-200 shadow-xs">
                 <span>📅</span>
                 <span className="font-bold">일정·달력</span>
               </button>
             </div>
           </div>
           <div className="flex items-center gap-2">
             <button onClick={() => {
               const today = new Date();
               setCurrentDate(today);
               setSelectedDate(formatDate(today));
             }} className="flex-1 bg-white hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl font-bold transition-all active:scale-95 text-xs flex items-center justify-center gap-1.5 border border-slate-200 shadow-xs">
               <span className="font-bold">오늘로 가기</span>
             </button>
             <button onClick={() => setShowOrderForm(true)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold shadow-sm shadow-blue-100 transition-all hover:shadow-md active:scale-95 flex items-center justify-center gap-1.5 text-xs">
               <Plus className="w-4 h-4" />
               <span className="font-bold">주문 추가</span>
             </button>
           </div>
        </div>

        {/* Unified Tool Grid */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 w-full">
          {[
            { label: '거래처', action: () => setShowClientManager(true) },
            { label: '품목', action: () => setShowProductManager(true) },
            { label: '검색', action: () => setShowItemSearchManager(true) },
            { label: '데이터', action: () => setShowDataManager(true) }
          ].map((btn, idx) => (
            <button 
              key={idx}
              onClick={btn.action} 
              className="py-2.5 px-1 text-xs font-bold text-slate-700 hover:text-blue-600 bg-white hover:bg-blue-50/50 border border-slate-200/60 hover:border-blue-200 rounded-xl transition-all shadow-xs flex items-center justify-center hover:scale-[1.02] active:scale-[0.98]"
            >
               <span className="text-center truncate">{btn.label}</span>
            </button>
          ))}
        </div>

        {/* Dashboard Widgets */}
        <div className="space-y-6">
          {layoutOrder.filter(type => type !== 'CALENDAR' && type !== 'SCHEDULE_LIST' && type !== 'DAILY_CLOSING').map((type, index) => (
            <DashboardWidget 
              key={type} 
              title={getWidgetTitle(type)}
              type={type}
              onDragStart={handleWidgetDragStart}
              onDragOver={handleWidgetDragOver}
              onDragEnd={handleWidgetDragEnd}
              isDragging={draggedWidget === type}
              actionButton={
                type === 'ORDER_LIST' ? (
                  <div className="flex items-center gap-2">
                    {selectedDateOrders.length > 0 && (
                      <button 
                        onClick={() => {
                          if (collapsedOrders.size === selectedDateOrders.length) {
                            setCollapsedOrders(new Set());
                          } else {
                            setCollapsedOrders(new Set(selectedDateOrders.map(o => o.id)));
                          }
                        }}
                        className="text-[10px] font-extrabold text-slate-500 bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg shadow-xs transition-colors whitespace-nowrap"
                      >
                        {collapsedOrders.size === selectedDateOrders.length ? '전체 펼치기' : '전체 접기'}
                      </button>
                    )}
                    <button 
                      onClick={() => setShowOrderForm(true)}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors px-3 py-1.5 text-[11px]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      주문 추가
                    </button>
                  </div>
                ) : null
              }
            >
              {getWidgetContent(type)}
            </DashboardWidget>
          ))}
        </div>
      </main>

      {showProductManager && <ProductManagerModal products={products} setProducts={setProducts} onClose={() => setShowProductManager(false)} onSelectForOrder={handleSelectProductForOrder} />}
      {showClientManager && <ClientManagerModal clients={clients} setClients={setClients} onClose={() => setShowClientManager(false)} onSelectForOrder={handleSelectClientForOrder} />}
      {showDataManager && <DataManagerModal orders={orders} products={products} clients={clients} financials={financials} onImport={handleImportData} onClose={() => setShowDataManager(false)} />}
      {showOrderForm && (
        <OrderModal 
          onClose={handleCloseOrderForm} 
          onSubmit={handleSaveOrder} 
          selectedDate={editingOrder ? editingOrder.date : (orderDraft?.date || selectedDate || "")} 
          products={products} 
          clients={clients} 
          initialClientName={orderDraft?.clientName !== undefined ? orderDraft.clientName : (editingOrder ? editingOrder.clientName : '')} 
          initialItemsStr={orderDraft?.itemsStr !== undefined ? orderDraft.itemsStr : (editingOrder ? reconstructItemsStr(editingOrder.items) : '')} 
          initialMemo={orderDraft?.memo !== undefined ? orderDraft.memo : (editingOrder ? (editingOrder.memo || '') : '')}
          isEditing={!!editingOrder} 
          onOpenProductManager={handleOpenProductManagerFromOrder} 
          onOpenClientManager={handleOpenClientManagerFromOrder} 
        />
      )}
      {showItemSearchManager && (
        <ItemSearchManagerModal 
          orders={orders} 
          clients={clients} 
          products={products}
          onSelectDate={(date: string) => {
            setSelectedDate(date);
            setCurrentDate(new Date(date));
            setShowItemSearchManager(false);
          }}
          onClose={() => setShowItemSearchManager(false)} 
        />
      )}
      {summaryItemDetail && (
        <SummaryDetailModal
          itemName={summaryItemDetail.name}
          category={summaryItemDetail.category}
          orders={selectedDateOrders}
          onClose={() => setSummaryItemDetail(null)}
        />
      )}
      {showCalendarModal && renderCalendarModal()}
      {showScheduleForm && (
          <ScheduleModal
            onClose={handleCloseScheduleForm}
            onSubmit={handleSaveSchedule}
            initialTitle={editingSchedule?.title || ''}
            initialContent={editingSchedule?.content || ''}
            initialTime={editingSchedule?.time || ''}
            initialAlarm={editingSchedule?.alarm || 0}
            initialDate={editingSchedule?.date || selectedDate || formatDate(new Date())}
            isEditing={!!editingSchedule}
          />
      )}
    </div>
  );
};

const DashboardWidget: React.FC<{ 
  title: string, 
  children: React.ReactNode, 
  type: WidgetType, 
  onDragStart: (e: React.DragEvent, type: WidgetType) => void,
  onDragOver: (e: React.DragEvent, type: WidgetType) => void,
  onDragEnd: () => void,
  isDragging: boolean,
  actionButton?: React.ReactNode
}> = ({ title, children, type, onDragStart, onDragOver, onDragEnd, isDragging, actionButton }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div 
        draggable
        onDragStart={(e) => onDragStart(e, type)}
        onDragOver={(e) => onDragOver(e, type)}
        onDragEnd={onDragEnd}
        className={`flex flex-col transition-all duration-200 ${
          isDragging ? 'opacity-40 scale-[0.99]' : 'opacity-100'
        }`}
    >
      {/* Widget Header */}
      <div className="flex justify-between items-center px-1 py-1.5 cursor-grab active:cursor-grabbing select-none mb-1.5">
         <div className="flex items-center gap-2">
            <div className="text-slate-300 hover:text-blue-500 transition-colors">
              <GripVertical className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-black tracking-wider uppercase text-slate-500">
              {title}
            </h3>
         </div>
         <div className="flex items-center gap-2">
            {actionButton}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              {isCollapsed ? <Plus className="w-4 h-4" /> : <div className="w-3.5 h-0.5 bg-current rounded" />}
            </button>
         </div>
      </div>
      {!isCollapsed && (
        <div className="w-full">
          {children}
        </div>
      )}
    </div>
  );
};

const SummaryDetailModal: React.FC<{
  itemName: string,
  category: string,
  orders: Order[],
  onClose: () => void
}> = ({ itemName, category, orders, onClose }) => {
  const details = useMemo(() => {
    return orders
      .map(o => {
        const item = o.items.find(i => i.name === itemName && (i.category || '기타') === category);
        return item ? { clientName: o.clientName, quantity: item.unitQuantity, isLoaded: !!item.isLoaded } : null;
      })
      .filter((i): i is { clientName: string, quantity: number, isLoaded: boolean } => i !== null)
      .sort((a, b) => b.quantity - a.quantity);
  }, [orders, itemName, category]);

  const total = details.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md" onClick={onClose}>
      <div className="bg-white rounded-b-3xl sm:rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className={`${getProductCategoryBgColor(category)} p-4 text-white flex justify-between items-center`}>
           <div>
             <div className="text-xs font-bold opacity-80 mb-0.5">{category} · 주문 거래처</div>
             <h3 className="text-xl font-black">{itemName}</h3>
           </div>
           <button onClick={onClose} className="text-white/80 hover:text-white text-2xl">&times;</button>
        </div>
        <div className="p-0 max-h-[60vh] overflow-y-auto divide-y divide-slate-100">
           {details.length === 0 ? (
             <div className="p-6 text-center text-slate-400 font-bold">주문 내역이 없습니다.</div>
           ) : (
             details.map((d, idx) => (
               <div key={idx} className="flex justify-between items-center p-3.5 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2">
                     <span className={`w-2 h-2 rounded-full ${d.isLoaded ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                     <span className="font-bold text-slate-800 text-sm">{d.clientName}</span>
                     {d.isLoaded ? (
                       <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                         상차 완료
                       </span>
                     ) : (
                       <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                         미상차
                       </span>
                     )}
                  </div>
                  <span className="font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg text-sm text-right min-w-[2.5rem]">
                    {d.quantity}
                  </span>
               </div>
             ))
           )}
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            <span className="font-bold text-slate-500 text-xs">총 {details.length}개 거래처 합계</span>
            <span className="font-black text-xl text-blue-600">{Number(total.toFixed(1))}개</span>
        </div>
      </div>
    </div>
  );
};

const ClosingManagerModal: React.FC<{ financials: FinancialRecord[], onClose: () => void }> = ({ financials, onClose }) => {
    const today = new Date();
    const [startDate, setStartDate] = useState(() => {
        const closedDates = financials.filter(f => f.isClosed).map(f => f.date).sort();
        if (closedDates.length > 0) {
            const lastClosedDateStr = closedDates[closedDates.length - 1];
            const [y, m, d] = lastClosedDateStr.split('-').map(Number);
            const nextDay = new Date(y, m - 1, d + 1);
            return `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;
        }
        const d = new Date(today.getFullYear(), today.getMonth(), 1);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    const [endDate, setEndDate] = useState(() => {
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    });
    
    // State for selected category focus
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'cash' | 'transfer' | 'card' | 'note'>('all');

    const periodData = useMemo(() => {
        return financials.filter(f => f.date >= startDate && f.date <= endDate);
    }, [financials, startDate, endDate]);

    const totals = useMemo(() => {
        return periodData.reduce((acc, curr) => ({
            cash: acc.cash + (curr.cash || 0),
            expense: acc.expense + (curr.expense || 0),
            transfer: acc.transfer + (curr.transfer || 0),
            card: acc.card + (curr.card || 0),
            note: acc.note + (curr.note || 0),
        }), { cash: 0, expense: 0, transfer: 0, card: 0, note: 0 });
    }, [periodData]);

    const netCash = totals.cash - totals.expense;
    const maxVal = Math.max(netCash, totals.transfer, totals.card, totals.note, 1);
    
    const selectedTotal = useMemo(() => {
        if (selectedCategory === 'all') return netCash + totals.transfer + totals.card + totals.note;
        if (selectedCategory === 'cash') return netCash;
        return totals[selectedCategory];
    }, [totals, netCash, selectedCategory]);

    const categoryLabels: Record<string, string> = {
        all: '기간 총 매출',
        cash: '현금 합계',
        transfer: '계좌이체 합계',
        card: '카드 합계',
        note: '어음 합계'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md" onClick={onClose}>
            <div className="bg-white rounded-b-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh] sm:max-h-[85vh]" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-xl font-black text-slate-800">매출 분석</h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">기간별 매출 현황을 확인하세요</p>
                    </div>
                    <button onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-500 rounded-full p-2 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-5 overflow-y-auto space-y-6">
                    {/* Date Picker Range */}
                    <div className="flex items-center gap-1.5 w-full">
                        <div className="flex-1">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">시작일</label>
                            <input 
                                type="date" 
                                value={startDate} 
                                onChange={e => setStartDate(e.target.value)}
                                className="w-full bg-white border border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-2 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 tracking-tighter"
                            />
                        </div>
                        <div className="text-slate-300 pt-4 font-black">-</div>
                        <div className="flex-1">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">종료일</label>
                            <input 
                                type="date" 
                                value={endDate} 
                                onChange={e => setEndDate(e.target.value)}
                                className="w-full bg-white border border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-2 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 tracking-tighter"
                            />
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        {[
                            { id: 'all', label: '전체' },
                            { id: 'cash', label: '현금' },
                            { id: 'transfer', label: '계좌' },
                            { id: 'card', label: '카드' },
                            { id: 'note', label: '어음' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedCategory(tab.id as any)}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                                    selectedCategory === tab.id 
                                    ? 'bg-white text-blue-600 shadow-sm' 
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Main Stats Display */}
                    <div className="text-center py-4">
                         <div className="text-xs font-bold text-slate-400 mb-1">{categoryLabels[selectedCategory]}</div>
                         <div className="text-4xl font-black text-slate-800 tracking-tight">
                            {selectedTotal.toLocaleString()}<span className="text-2xl text-slate-400 ml-1">원</span>
                         </div>
                    </div>

                    {/* Graph */}
                    <div className="h-40 flex items-end justify-between gap-4 px-4 pb-2 border-b border-slate-200">
                        {[
                            { label: '현금(순)', value: netCash, color: 'bg-green-500', text: 'text-green-600' },
                            { label: '계좌', value: totals.transfer, color: 'bg-blue-500', text: 'text-blue-600' },
                            { label: '카드', value: totals.card, color: 'bg-purple-500', text: 'text-purple-600' },
                            { label: '어음', value: totals.note, color: 'bg-orange-500', text: 'text-orange-600' }
                        ].map((item) => (
                            <div key={item.label} className="flex flex-col items-center flex-1 h-full justify-end group">
                                <div className="text-xs font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{item.value.toLocaleString()}</div>
                                <div style={{ height: `${(item.value / maxVal) * 100}%` }} className={`w-full max-w-[60px] rounded-t-lg transition-all duration-500 ${item.color} opacity-80 group-hover:opacity-100 relative shadow-sm`}></div>
                                <div className={`mt-2 font-bold text-xs ${item.text}`}>{item.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Breakdown (Grid for all 6 types) */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex justify-between items-center">
                            <div className="text-[10px] font-bold text-slate-400">현금 매출</div>
                            <div className="text-sm font-black text-slate-600">{totals.cash.toLocaleString()}원</div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex justify-between items-center">
                            <div className="text-[10px] font-bold text-slate-400">지출</div>
                            <div className="text-sm font-black text-red-500">{totals.expense.toLocaleString()}원</div>
                        </div>
                        <div className="bg-green-50 rounded-xl p-3 border border-green-100 flex justify-between items-center">
                            <div className="text-[10px] font-bold text-green-600">순현금</div>
                            <div className="text-sm font-black text-green-600">{netCash.toLocaleString()}원</div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex justify-between items-center">
                            <div className="text-[10px] font-bold text-slate-400">계좌이체 합계</div>
                            <div className="text-sm font-black text-blue-600">{totals.transfer.toLocaleString()}원</div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex justify-between items-center">
                            <div className="text-[10px] font-bold text-slate-400">카드 합계</div>
                            <div className="text-sm font-black text-purple-600">{totals.card.toLocaleString()}원</div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex justify-between items-center">
                            <div className="text-[10px] font-bold text-slate-400">어음 합계</div>
                            <div className="text-sm font-black text-orange-600">{totals.note.toLocaleString()}원</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DataManagerModal: React.FC<{ orders: Order[], products: ProductDefinition[], clients: ClientDefinition[], financials: FinancialRecord[], onImport: (data: any, msg?: string) => void, onClose: () => void }> = ({ orders, products, clients, financials, onImport, onClose }) => {
  const jsonInputRef = useRef<HTMLInputElement>(null);
  
  const [googleSheetUrl, setGoogleSheetUrl] = useState(() => localStorage.getItem('google_sheet_url_v1') || '');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    localStorage.setItem('google_sheet_url_v1', googleSheetUrl);
  }, [googleSheetUrl]);

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (inQuotes) {
        if (char === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          current += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ',') {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
    }
    result.push(current.trim());
    return result;
  };

  const handleExportJSON = () => {
    const data = { version: '1.0', orders, products, clients, financials };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportOrdersCSV = () => {
    let csv = "날짜,거래처,주문내역\n";
    orders.forEach(o => {
      const itemsStr = o.items.map(i => {
        const p = products.find(prod => prod.id === i.productId);
        return `${p ? p.shortcut : i.name}${i.unitQuantity}`;
      }).join(' ');
      csv += `"${o.date}","${o.clientName}","${itemsStr}"\n`;
    });
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportClientsCSV = () => {
    let csv = "이름,단축어,전화번호,카테고리\n";
    clients.forEach(c => {
        csv += `"${c.name}","${c.shortcut || ''}","${c.phone || ''}","${c.category || ''}"\n`;
    });
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportProductsCSV = () => {
    let csv = "품목명,단축어,카테고리,금액\n";
    products.forEach(p => {
        csv += `"${p.name}","${p.shortcut}","${p.category || ''}","${p.price || 0}"\n`;
    });
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSyncToSheet = async () => {
    if (!googleSheetUrl) {
      alert('구글 앱스 스크립트 URL을 입력해주세요.');
      return;
    }
    if (!confirm('현재 앱의 모든 데이터를 구글 스프레드시트에 저장하시겠습니까?')) return;
    setIsSyncing(true);
    try {
      const payload = { clients, products, orders, financials };
      await fetch(googleSheetUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      alert('저장 요청을 보냈습니다.');
    } catch (e) { alert('전송 중 오류가 발생했습니다.'); } finally { setIsSyncing(false); }
  };

  const handleLoadFromSheet = async () => {
    if (!googleSheetUrl) { alert('구글 앱스 스크립트 URL을 입력해주세요.'); return; }
    if (!confirm('구글 스프레드시트에서 데이터를 불러오시겠습니까?')) return;
    setIsSyncing(true);
    try {
      const response = await fetch(googleSheetUrl);
      const data = await response.json();
      onImport(data, '구글 시트에서 데이터를 성공적으로 불러왔습니다.');
    } catch (e) { alert('데이터를 불러오는 중 오류가 발생했습니다.'); } finally { setIsSyncing(false); }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, type: 'JSON' | 'ORDERS' | 'CLIENTS' | 'PRODUCTS') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (type === 'JSON') {
        try { onImport(JSON.parse(content)); } catch { alert('올바른 백업 파일이 아닙니다.'); }
      } else {
        const lines = content.split(/\r?\n/).filter(line => line.trim() !== "");
        if (lines.length < 2) { alert('가져올 데이터가 없습니다.'); return; }
        const dataLines = lines.slice(1);
        if (type === 'ORDERS') {
            const newOrders: Order[] = dataLines.map(l => {
              const vals = parseCSVLine(l);
              if (vals.length < 3) return null;
              const [d, c, itemsText] = vals;
              const parts = itemsText.split(/\s+/).filter(p => p);
              const parsedItems: OrderItem[] = parts.map(part => {
                const match = part.match(/^([a-zA-Z가-힣]+)([\d]+(\.\d)?)$/);
                if (match) {
                  const sc = match[1].toUpperCase();
                  const qty = parseFloat(match[2]);
                  const prod = products.find(p => p.shortcut.toUpperCase() === sc);
                  if (prod) return { id: Math.random().toString(36).substr(2, 9), productId: prod.id, name: prod.name, category: prod.category, unitQuantity: qty, isLoaded: false };
                }
                return null;
              }).filter((v): v is OrderItem => v !== null);
              return { id: Math.random().toString(36).substr(2, 9), date: d, clientName: c, items: parsedItems, createdAt: Date.now() };
            }).filter((v): v is Order => v !== null);
            if (newOrders.length > 0) onImport({ orders: newOrders }, '주문 목록 불러오기가 완료되었습니다.');
        } else if (type === 'CLIENTS') {
            const uniqueClientsMap = new Map<string, ClientDefinition>();
            dataLines.forEach((line) => {
                const vals = parseCSVLine(line);
                const rawName = vals[0] || '';
                const cleanName = rawName.trim();
                if (!cleanName) return;
                uniqueClientsMap.set(cleanName, { id: Math.random().toString(36).substr(2, 9), name: cleanName, shortcut: (vals[1] || '').trim(), phone: (vals[2] || '').trim(), category: (vals[3] || '').trim() });
            });
            onImport({ clients: Array.from(uniqueClientsMap.values()) }, '거래처 목록 불러오기가 완료되었습니다.');
        } else if (type === 'PRODUCTS') {
             const newProducts: ProductDefinition[] = dataLines.map((l): ProductDefinition | null => {
                const vals = parseCSVLine(l);
                if (vals.length < 1) return null;
                return { id: Math.random().toString(36).substr(2, 9), name: vals[0] || '', shortcut: vals[1] || '', category: vals[2] || '', price: parseInt(vals[3]) || 0 };
             }).filter((v): v is ProductDefinition => v !== null && !!v.name && !!v.shortcut);
             onImport({ products: newProducts }, '품목 목록 불러오기가 완료되었습니다.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md" onClick={onClose}>
      <div className="bg-white rounded-b-3xl sm:rounded-3xl shadow-2xl w-full max-w-sm flex flex-col p-6 space-y-4 max-h-[90vh] sm:max-h-[85vh]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <h3 className="text-xl font-black text-slate-800">데이터 관리</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>
        
        <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-500">데이터 백업 (내보내기)</h4>
            <div className="grid grid-cols-2 gap-2">
                <button onClick={handleExportJSON} className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors">
                    <Download className="w-5 h-5" /> 전체 JSON
                </button>
                <button onClick={handleExportOrdersCSV} className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors">
                    <Download className="w-5 h-5" /> 주문 CSV
                </button>
                <button onClick={handleExportClientsCSV} className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors">
                    <Download className="w-5 h-5" /> 거래처 CSV
                </button>
                <button onClick={handleExportProductsCSV} className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors">
                    <Download className="w-5 h-5" /> 품목 CSV
                </button>
            </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-500">데이터 복원 (가져오기)</h4>
            <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-3 rounded-xl transition-colors cursor-pointer">
                    <Upload className="w-5 h-5" /> 전체 JSON
                    <input type="file" accept=".json" onChange={(e) => handleFile(e, 'JSON')} className="hidden" />
                </label>
                <label className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-3 rounded-xl transition-colors cursor-pointer">
                    <Upload className="w-5 h-5" /> 주문 CSV
                    <input type="file" accept=".csv" onChange={(e) => handleFile(e, 'ORDERS')} className="hidden" />
                </label>
                <label className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-3 rounded-xl transition-colors cursor-pointer">
                    <Upload className="w-5 h-5" /> 거래처 CSV
                    <input type="file" accept=".csv" onChange={(e) => handleFile(e, 'CLIENTS')} className="hidden" />
                </label>
                <label className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-3 rounded-xl transition-colors cursor-pointer">
                    <Upload className="w-5 h-5" /> 품목 CSV
                    <input type="file" accept=".csv" onChange={(e) => handleFile(e, 'PRODUCTS')} className="hidden" />
                </label>
            </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-500">구글 시트 연동</h4>
             <input 
                 value={googleSheetUrl} 
                 onChange={e => setGoogleSheetUrl(e.target.value)} 
                 placeholder="Apps Script Web App URL" 
                 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium mb-2" 
             />
             <div className="grid grid-cols-2 gap-2">
                 <button onClick={handleSyncToSheet} disabled={isSyncing} className="bg-green-100 text-green-700 font-bold py-3 rounded-xl hover:bg-green-200 disabled:opacity-50">
                     {isSyncing ? '전송중...' : '시트로 내보내기'}
                 </button>
                 <button onClick={handleLoadFromSheet} disabled={isSyncing} className="bg-amber-100 text-amber-700 font-bold py-3 rounded-xl hover:bg-amber-200 disabled:opacity-50">
                     {isSyncing ? '불러오는중...' : '시트에서 가져오기'}
                 </button>
             </div>
        </div>
      </div>
    </div>
  );
};

const ProductManagerModal: React.FC<{ products: ProductDefinition[], setProducts: React.Dispatch<React.SetStateAction<ProductDefinition[]>>, onClose: () => void, onSelectForOrder?: (product: ProductDefinition) => void }> = ({ products, setProducts, onClose, onSelectForOrder }) => {
  const [viewMode, setViewMode] = useState<'LIST' | 'FORM'>('LIST');
  const [filterCategory, setFilterCategory] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [shortcut, setShortcut] = useState('');
  const [category, setCategory] = useState(PRODUCT_CATEGORIES[0]);
  const [price, setPrice] = useState('');
  const [memo, setMemo] = useState('');
  
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setShortcut('');
    setCategory(PRODUCT_CATEGORIES[0]);
    setPrice('');
    setMemo('');
    setEditingId(null);
  };

  const handleSave = () => {
    if (!name || !shortcut) return;
    const newProduct = {
      name,
      shortcut,
      category,
      price: parseInt(price) || 0,
      memo
    };

    if (editingId) {
      setProducts(prev => prev.map(p => p.id === editingId ? { ...p, ...newProduct } : p));
    } else {
      setProducts(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), ...newProduct }]);
    }
    resetForm();
    setViewMode('LIST');
  };

  const handleEdit = (product: ProductDefinition) => {
    setEditingId(product.id);
    setName(product.name);
    setShortcut(product.shortcut);
    setCategory(product.category);
    setPrice(product.price ? String(product.price) : '');
    setMemo(product.memo || '');
    setViewMode('FORM');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('이 품목을 삭제하시겠습니까?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;
    const fromIndex = products.findIndex(p => p.id === draggedId);
    const toIndex = products.findIndex(p => p.id === targetId);
    if (fromIndex !== -1 && toIndex !== -1) {
      const newProducts = [...products];
      const [moved] = newProducts.splice(fromIndex, 1);
      newProducts.splice(toIndex, 0, moved);
      setProducts(newProducts);
    }
  };

  const handleDragEnd = () => setDraggedId(null);

  const filtered = products.filter(p => {
    const matchesCategory = filterCategory === '전체' || p.category === filterCategory;
    const term = searchTerm.trim().toLowerCase();
    if (!term) return matchesCategory;
    const matchesSearch = 
      p.name.toLowerCase().includes(term) || 
      (p.shortcut && p.shortcut.toLowerCase().includes(term)) ||
      getChosung(p.name).toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md" onClick={onClose}>
      <div className="bg-white rounded-b-3xl sm:rounded-3xl shadow-2xl w-full max-w-sm flex flex-col p-5 space-y-4 max-h-[90vh] sm:max-h-[85vh] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        {viewMode === 'LIST' ? (
          <>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-slate-800">제품 등록 및 검색</h3>
                <span className="text-[11px] font-bold text-slate-400">총 {products.length}개 제품 등록됨</span>
              </div>
              <div className="flex items-center gap-2">
                 <button onClick={() => { resetForm(); setViewMode('FORM'); }} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1 active:scale-95">
                    <Plus className="w-3.5 h-3.5" />
                    <span>제품 등록</span>
                 </button>
                 <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl transition-colors p-1 leading-none">&times;</button>
              </div>
            </div>

            <div className="flex gap-2">
               <select 
                 value={filterCategory} 
                 onChange={e => setFilterCategory(e.target.value)} 
                 className="w-1/3 bg-slate-50 border border-slate-200 rounded-xl px-2 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
               >
                 <option value="전체">전체</option>
                 {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
               <div className="relative flex-1">
                 <input 
                   value={searchTerm} 
                   onChange={e => setSearchTerm(e.target.value)} 
                   placeholder="제품명·초성·단축어 검색..." 
                   className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-7 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" 
                 />
                 {searchTerm && (
                   <button 
                     onClick={() => setSearchTerm('')} 
                     className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm font-bold"
                   >
                     &times;
                   </button>
                 )}
               </div>
            </div>

            <div className="overflow-y-auto flex-1 pr-1 space-y-2">
              {filtered.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">검색 결과가 없습니다.</div>
              ) : (
                  filtered.map(p => (
                    <div 
                        key={p.id} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, p.id)}
                        onDragOver={(e) => handleDragOver(e, p.id)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-blue-200 transition-colors group shadow-sm ${draggedId === p.id ? 'opacity-40 bg-slate-50' : ''}`}
                    >
                      <div className="mr-3 cursor-grab active:cursor-grabbing text-slate-300 hover:text-blue-500">
                          <GripVertical className="w-4 h-4" />
                      </div>
                      <div onClick={() => onSelectForOrder ? onSelectForOrder(p) : null} className={`flex-1 ${onSelectForOrder ? 'cursor-pointer' : ''}`}>
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${getProductCategoryBadge(p.category)}`}>{p.category}</span>
                            <span className="font-bold text-slate-700 text-sm">{p.name}</span>
                            <span className="text-[10px] text-blue-500 font-bold bg-blue-50 px-1.5 py-0.5 rounded">{p.shortcut}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex gap-2">
                             {p.price ? <span>₩{p.price.toLocaleString()}</span> : null}
                             {p.memo && <span className="text-slate-300 truncate max-w-[100px]">{p.memo}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1 items-center">
                          <button onClick={() => handleEdit(p)} className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                          {!onSelectForOrder && <button onClick={(e) => handleDelete(p.id, e)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash className="w-4 h-4" /></button>}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                 <button onClick={() => setViewMode('LIST')} className="p-1 -ml-1 hover:bg-slate-100 rounded-full transition-colors"><ChevronLeft className="w-5 h-5 text-slate-500" /></button>
                 <h3 className="text-lg font-black text-slate-800">{editingId ? '제품 정보 수정' : '신규 제품 등록'}</h3>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl transition-colors">&times;</button>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">카테고리</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500">
                     {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">상품명 (제품명)</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="예: 백크릴" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">약칭 (단축어)</label>
                  <input value={shortcut} onChange={e => setShortcut(e.target.value)} placeholder="예: 백" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">금액</label>
                  <input value={price} onChange={e => setPrice(e.target.value)} placeholder="0" type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">메모</label>
                  <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="특이사항 메모" className="w-full h-20 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
            </div>

            <button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-bold shadow-md shadow-blue-200 active:scale-95 transition-all mt-2">
                {editingId ? '수정 완료' : '제품 등록하기'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const ClientManagerModal: React.FC<{ clients: ClientDefinition[], setClients: React.Dispatch<React.SetStateAction<ClientDefinition[]>>, onClose: () => void, onSelectForOrder?: (name: string) => void }> = ({ clients, setClients, onClose, onSelectForOrder }) => {
  const [viewMode, setViewMode] = useState<'LIST' | 'FORM'>('LIST');
  
  // List Filter State
  const [filterCategory, setFilterCategory] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [shortcut, setShortcut] = useState('');
  const [category, setCategory] = useState(CLIENT_CATEGORIES[0]);
  const [memo, setMemo] = useState('');
  const [sequence, setSequence] = useState<number | ''>('');

  // Drag State
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const fromIndex = clients.findIndex(c => c.id === draggedId);
    const toIndex = clients.findIndex(c => c.id === targetId);

    if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
      const newClients = [...clients];
      const [moved] = newClients.splice(fromIndex, 1);
      newClients.splice(toIndex, 0, moved);
      
      // Update sequences based on new order
      const updatedClients = newClients.map((c, idx) => ({ ...c, sequence: idx + 1 }));
      setClients(updatedClients);
    }
  };

  const handleDragEnd = () => setDraggedId(null);

  const resetForm = () => {
    setName('');
    setPhone('');
    setShortcut('');
    setCategory(CLIENT_CATEGORIES[0]);
    setMemo('');
    setSequence('');
    setEditingId(null);
  };

  const handleSave = () => {
    if (!name) return;
    const seqNum = sequence === '' ? 999 : Number(sequence);
    const newClientData = { name, phone, shortcut, category, memo, sequence: seqNum };
    
    if (editingId) {
      setClients(prev => prev.map(c => c.id === editingId ? { ...c, ...newClientData } : c));
    } else {
      setClients(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), ...newClientData }]);
    }
    resetForm();
    setViewMode('LIST');
  };

  const handleEdit = (client: ClientDefinition) => {
    setEditingId(client.id);
    setName(client.name);
    setPhone(client.phone || '');
    setShortcut(client.shortcut || '');
    setCategory(client.category || CLIENT_CATEGORIES[0]);
    setMemo(client.memo || '');
    setSequence(client.sequence ?? '');
    setViewMode('FORM');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => { 
    e.stopPropagation();
    if(confirm('삭제하시겠습니까?')) setClients(prev => prev.filter(c => c.id !== id)); 
  };

  const filtered = clients.filter(c => {
    const matchesCategory = filterCategory === '전체' || c.category === filterCategory;
    const matchesSearch = c.name.includes(searchTerm) || (c.shortcut && c.shortcut.includes(searchTerm));
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    const seqA = a.sequence ?? 999;
    const seqB = b.sequence ?? 999;
    if (seqA !== seqB) return seqA - seqB;
    return 0;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md" onClick={onClose}>
      <div className="bg-white rounded-b-3xl sm:rounded-3xl shadow-2xl w-full max-w-sm flex flex-col px-2 py-5 sm:p-5 space-y-4 max-h-[90vh] sm:max-h-[85vh]" onClick={e => e.stopPropagation()}>
        {viewMode === 'LIST' ? (
          <>
            <div className="flex justify-between items-center px-2">
              <h3 className="text-xl font-black text-slate-800">거래처조회</h3>
              <div className="flex items-center gap-2">
                 <button onClick={() => { resetForm(); setViewMode('FORM'); }} className="bg-blue-100 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors">
                    + 신규등록
                 </button>
                 <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl transition-colors">&times;</button>
              </div>
            </div>
            
            <div className="flex gap-2 px-1">
               <select 
                 value={filterCategory} 
                 onChange={e => setFilterCategory(e.target.value)} 
                 className="w-1/3 bg-slate-50 border border-slate-200 rounded-xl px-2 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
               >
                 <option value="전체">전체 지역</option>
                 {CLIENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
               <input 
                 value={searchTerm} 
                 onChange={e => setSearchTerm(e.target.value)} 
                 placeholder="거래처 검색..." 
                 className="w-2/3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" 
               />
            </div>

            <div className="overflow-y-auto flex-1 px-1 space-y-2">
              {filtered.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">검색 결과가 없습니다.</div>
              ) : (
                  filtered.map(c => (
                    <div 
                        key={c.id} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, c.id)}
                        onDragOver={(e) => handleDragOver(e, c.id)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center justify-between px-1.5 py-3 bg-white border border-slate-100 rounded-xl hover:border-blue-200 transition-colors group shadow-sm ${draggedId === c.id ? 'opacity-40 bg-slate-50' : ''}`}
                    >
                      <div className="mr-1 cursor-grab active:cursor-grabbing text-slate-300 hover:text-blue-500">
                          <GripVertical className="w-4 h-4" />
                      </div>
                      <div onClick={() => onSelectForOrder ? onSelectForOrder(c.name) : null} className={`flex-1 overflow-hidden ${onSelectForOrder ? 'cursor-pointer' : ''}`}>
                        <div className="flex items-center gap-1.5 mb-0.5">
                            {c.sequence !== undefined && <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded flex-shrink-0">{c.sequence}</span>}
                            <span className="font-bold text-slate-700 text-sm truncate">{c.name}</span>
                            {c.shortcut && <span className="text-[10px] text-blue-500 font-bold bg-blue-50 px-1.5 py-0.5 rounded flex-shrink-0">{c.shortcut}</span>}
                        </div>
                        <div className="text-[10px] text-slate-400 flex gap-2">
                             {c.phone && <span>{c.phone}</span>}
                             {c.memo && <span className="text-slate-300 truncate max-w-[100px]">{c.memo}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1 items-center">
                          {onSelectForOrder && (
                              <button 
                                  onClick={(e) => { e.stopPropagation(); onSelectForOrder(c.name); }} 
                                  className="px-2 py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                              >
                                  주문
                              </button>
                          )}
                          {c.phone && (
                              <a href={`tel:${c.phone}`} className="p-1.5 text-slate-300 hover:text-green-500 bg-slate-50 hover:bg-green-50 rounded-lg transition-colors" onClick={(e) => e.stopPropagation()}>
                                  <Phone className="w-4 h-4" />
                              </a>
                          )}
                          <button onClick={() => handleEdit(c)} className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                          <button onClick={(e) => handleDelete(c.id, e)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                 <button onClick={() => setViewMode('LIST')} className="p-1 -ml-1 hover:bg-slate-100 rounded-full"><ChevronLeft className="w-5 h-5 text-slate-500" /></button>
                 <h3 className="text-xl font-black text-slate-800">{editingId ? '거래처 수정' : '거래처 등록'}</h3>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl transition-colors">&times;</button>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1">
                <div className="flex gap-2">
                  <div className="space-y-1 flex-1">
                    <label className="text-[10px] font-bold text-slate-400">지역 (카테고리)</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500">
                       {CLIENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1 w-24">
                    <label className="text-[10px] font-bold text-slate-400">순번</label>
                    <input type="number" value={sequence} onChange={e => setSequence(e.target.value ? Number(e.target.value) : '')} placeholder="순번" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">거래처명</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="예: 동명수산" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">약칭 (단축어)</label>
                  <input value={shortcut} onChange={e => setShortcut(e.target.value)} placeholder="예: 동명" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">전화번호</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="010-0000-0000" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">메모</label>
                  <textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="특이사항 메모" className="w-full h-20 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
            </div>

            <button onClick={handleSave} className="w-full bg-blue-600 text-white rounded-xl py-3 font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all mt-2">
                저장하기
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const OrderModal: React.FC<{
  onClose: () => void;
  onSubmit: (clientName: string, itemsStr: string, memo: string, date: string) => void;
  selectedDate: string;
  products: ProductDefinition[];
  clients: ClientDefinition[];
  initialClientName: string;
  initialItemsStr: string;
  initialMemo: string;
  isEditing: boolean;
  onOpenProductManager: (currentClientName: string, currentItemsStr: string, currentMemo: string, currentDate: string) => void;
  onOpenClientManager: (currentClientName: string, currentItemsStr: string, currentMemo: string, currentDate: string) => void;
}> = ({ onClose, onSubmit, selectedDate, products, clients, initialClientName, initialItemsStr, initialMemo, isEditing, onOpenProductManager, onOpenClientManager }) => {
  const [clientName, setClientName] = useState(initialClientName);
  const [itemsStr, setItemsStr] = useState(initialItemsStr);
  const [memo, setMemo] = useState(initialMemo);
  const [orderDate, setOrderDate] = useState(selectedDate);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const itemsTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setClientName(initialClientName); }, [initialClientName]);
  useEffect(() => { setItemsStr(initialItemsStr); }, [initialItemsStr]);
  useEffect(() => { setMemo(initialMemo); }, [initialMemo]);
  useEffect(() => { setOrderDate(selectedDate); }, [selectedDate]);

  useEffect(() => {
    if (initialClientName && !initialItemsStr && itemsTextareaRef.current) {
      setTimeout(() => {
        itemsTextareaRef.current?.focus();
      }, 50);
    }
  }, [initialClientName, initialItemsStr]);

  const filteredClients = useMemo(() => {
    if (!clientName) return [];
    return clients
      .filter(c => c.name.includes(clientName) || (c.shortcut && c.shortcut.includes(clientName)) || getChosung(c.name).includes(clientName))
      .sort((a, b) => {
        const seqA = a.sequence ?? 999;
        const seqB = b.sequence ?? 999;
        if (seqA !== seqB) return seqA - seqB;
        return 0;
      })
      .slice(0, 5);
  }, [clients, clientName]);

  const filteredProducts = useMemo(() => {
    if (!activeSearchTerm || activeSearchTerm.length < 1) return [];
    if (/^\d+$/.test(activeSearchTerm)) return []; // Stop searching if it's just numbers
    return products.filter(p => p.name.includes(activeSearchTerm) || p.shortcut.includes(activeSearchTerm) || getChosung(p.name).includes(activeSearchTerm)).slice(0, 5);
  }, [products, activeSearchTerm]);

  const handleItemsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setItemsStr(val);
    
    const caret = e.target.selectionStart;
    let start = caret;
    while (start > 0 && !/\s/.test(val[start - 1])) {
        start--;
    }
    const currentWord = val.slice(start, caret);
    setActiveSearchTerm(currentWord);
  };

  const selectProduct = (product: ProductDefinition) => {
    const textarea = itemsTextareaRef.current;
    if (!textarea) return;
    
    const val = textarea.value;
    const caret = textarea.selectionStart;
    
    let start = caret;
    while (start > 0 && !/\s/.test(val[start - 1])) {
        start--;
    }
    
    let end = caret;
    while (end < val.length && !/\s/.test(val[end])) {
        end++;
    }
    
    const prefix = val.substring(0, start);
    const suffix = val.substring(end);
    
    // Insert shortcut. Do NOT add extra space, user might type quantity directly (e.g. "Krill" -> "Krill5")
    const newText = prefix + product.shortcut + suffix;
    
    setItemsStr(newText);
    setActiveSearchTerm(''); // Close suggestions
    
    setTimeout(() => {
        textarea.focus();
        const newPos = start + product.shortcut.length;
        textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md" onClick={onClose}>
      <div className="bg-white rounded-b-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg flex flex-col p-6 space-y-4 max-h-[90vh] sm:max-h-[85vh]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <h3 className="text-xl font-black text-slate-800">{isEditing ? '주문 수정' : '새 주문'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>
        <div className="space-y-4 overflow-y-auto pr-1">
            <div className="flex gap-2">
                <div className="w-[140px] flex-shrink-0">
                    <input type="date" value={orderDate} onChange={e => setOrderDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold text-slate-700" />
                </div>
                <div className="relative flex-1">
                    <input type="text" value={clientName} onChange={e => { setClientName(e.target.value); setShowClientSuggestions(true); }} placeholder="거래처명" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold" />
                    {showClientSuggestions && clientName && filteredClients.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                            {filteredClients.map(c => <div key={c.id} onClick={() => { setClientName(c.name); setShowClientSuggestions(false); }} className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm font-bold">{c.name}</div>)}
                        </div>
                    )}
                </div>
            </div>

            <div className="relative">
                <textarea ref={itemsTextareaRef} value={itemsStr} onChange={handleItemsChange} className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium" placeholder="예: 각3 백2" />
                {filteredProducts.length > 0 && (
                     <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-40 overflow-y-auto">
                        {filteredProducts.map(p => (
                             <div key={p.id} onClick={() => selectProduct(p)} className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm font-bold flex justify-between border-b border-slate-50 last:border-0">
                                 <span>{p.name}</span><span className="text-blue-500">{p.shortcut}</span>
                             </div>
                        ))}
                     </div>
                )}
            </div>

            <textarea value={memo} onChange={e => setMemo(e.target.value)} className="w-full h-16 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm" placeholder="메모" />
        </div>
        <button onClick={() => onSubmit(clientName, itemsStr, memo, orderDate)} className="w-full bg-blue-600 text-white rounded-xl py-3.5 font-bold shadow-lg shadow-blue-200 transition-transform active:scale-95">저장</button>
      </div>
    </div>
  );
};

const ScheduleModal: React.FC<{
    onClose: () => void;
    onSubmit: (title: string, content: string, time: string, alarm: number, date?: string) => void;
    initialTitle: string;
    initialContent: string;
    initialTime: string;
    initialAlarm: number;
    initialDate?: string;
    isEditing: boolean;
}> = ({ onClose, onSubmit, initialTitle, initialContent, initialTime, initialAlarm, initialDate, isEditing }) => {
    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState(initialContent);
    const [time, setTime] = useState(initialTime);
    const [alarm, setAlarm] = useState(initialAlarm);
    const [date, setDate] = useState(initialDate || '');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!title.trim()) {
            setErrorMessage('일정 제목을 입력해주세요.');
            return;
        }
        onSubmit(title.trim(), content, time, alarm, date);
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm flex flex-col p-6 space-y-4 max-h-[90vh] sm:max-h-[85vh] border border-slate-100 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-black text-slate-800">{isEditing ? '일정 수정' : '새 일정 추가'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 text-xl font-bold">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 mb-1 block">날짜</label>
                        <input 
                            type="date" 
                            value={date} 
                            onChange={e => setDate(e.target.value)} 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-500" 
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 mb-1 block">일정 제목 <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={e => {
                                setTitle(e.target.value);
                                if (errorMessage) setErrorMessage('');
                            }} 
                            placeholder="일정 제목을 입력하세요" 
                            autoFocus
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-500" 
                        />
                        {errorMessage && (
                            <p className="text-[11px] font-bold text-red-500 mt-1 pl-1">{errorMessage}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 mb-1 block">내용 (선택)</label>
                        <textarea 
                            value={content} 
                            onChange={e => setContent(e.target.value)} 
                            placeholder="내용 추가" 
                            className="w-full h-20 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm resize-none focus:outline-none focus:border-blue-500 text-slate-700" 
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-slate-400 mb-1 block">시간 설정</label>
                            <input 
                                type="time" 
                                value={time} 
                                onChange={e => setTime(e.target.value)} 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-500" 
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-slate-400 mb-1 block">알람 설정</label>
                            <select 
                                value={alarm} 
                                onChange={e => setAlarm(parseInt(e.target.value))} 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                            >
                                <option value={0}>설정 안함</option>
                                <option value={5}>5분 전</option>
                                <option value={10}>10분 전</option>
                                <option value={30}>30분 전</option>
                                <option value={60}>1시간 전</option>
                                <option value={120}>2시간 전</option>
                                <option value={180}>3시간 전</option>
                                <option value={360}>6시간 전</option>
                            </select>
                        </div>
                    </div>
                    <button 
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-bold shadow-md shadow-blue-200 transition-all active:scale-95 text-sm mt-2"
                    >
                        {isEditing ? '일정 수정 완료' : '일정 등록'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const ItemSearchManagerModal: React.FC<{ 
  orders: Order[]; 
  clients: ClientDefinition[]; 
  products?: ProductDefinition[];
  onSelectDate?: (date: string) => void;
  onClose: () => void;
}> = ({ orders, clients, products = [], onSelectDate, onClose }) => {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // Default to first day of current month
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  });
  const [itemSearch, setItemSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "loaded" | "unloaded">("all");
  const [hasSearched, setHasSearched] = useState(true);
  const [activeSearchedTerm, setActiveSearchedTerm] = useState("");

  // Preset button handler
  const applyPreset = (preset: "today" | "7days" | "month" | "30days") => {
    soundService.playButtonClick();
    const today = new Date();
    const fmt = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };
    const end = fmt(today);
    let start = end;
    if (preset === "7days") {
      const d = new Date(today);
      d.setDate(d.getDate() - 6);
      start = fmt(d);
    } else if (preset === "month") {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      start = fmt(d);
    } else if (preset === "30days") {
      const d = new Date(today);
      d.setDate(d.getDate() - 29);
      start = fmt(d);
    }
    setStartDate(start);
    setEndDate(end);
  };

  // Collect all unique item definitions from products and past orders
  const allAvailableItems = useMemo(() => {
    const map = new Map<string, { name: string; category: string; shortcut?: string; count: number }>();
    if (products) {
      products.forEach(p => {
        map.set(p.name, { name: p.name, category: p.category, shortcut: p.shortcut, count: 0 });
      });
    }
    orders.forEach(o => {
      o.items.forEach(i => {
        const existing = map.get(i.name);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(i.name, { name: i.name, category: i.category || "기타", count: 1 });
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [products, orders]);

  // Autocomplete suggestion matches
  const filteredSuggestions = useMemo(() => {
    if (!itemSearch.trim()) return [];
    const term = itemSearch.trim().toLowerCase();
    return allAvailableItems.filter(item => 
      item.name.toLowerCase().includes(term) ||
      (item.shortcut && item.shortcut.toLowerCase().includes(term)) ||
      getChosung(item.name).includes(term) ||
      item.category.toLowerCase().includes(term)
    ).slice(0, 8);
  }, [itemSearch, allAvailableItems]);

  // Top popular items
  const popularChips = useMemo(() => {
    return allAvailableItems.slice(0, 6);
  }, [allAvailableItems]);

  const handleExecuteSearch = (customTerm?: string) => {
    soundService.playButtonClick();
    const term = customTerm !== undefined ? customTerm : itemSearch;
    setActiveSearchedTerm(term);
    setHasSearched(true);
    setShowSuggestions(false);
  };

  // Group by Date: display dates and clients that ordered the searched item
  const dateGroupedResults = useMemo(() => {
    if (!hasSearched) return [];

    const term = (activeSearchedTerm || itemSearch).trim().toLowerCase();

    // Map client phones
    const clientPhoneMap = new Map<string, string>();
    clients.forEach(c => {
      if (c.phone) clientPhoneMap.set(c.name, c.phone);
    });

    const dateMap = new Map<string, {
      orderId: string;
      clientName: string;
      clientPhone?: string;
      itemName: string;
      itemCategory: string;
      quantity: number;
      isLoaded: boolean;
      isDelivered: boolean;
      memo?: string;
    }[]>();

    orders.forEach(order => {
      if (order.date < startDate || order.date > endDate) return;

      order.items.forEach(item => {
        // Match product/item name or category or chosung
        if (term) {
          const nameMatch = item.name.toLowerCase().includes(term) || getChosung(item.name).includes(term);
          const catMatch = item.category && item.category.toLowerCase().includes(term);
          if (!nameMatch && !catMatch) return;
        }

        // Status filter
        if (statusFilter === "loaded" && !item.isLoaded) return;
        if (statusFilter === "unloaded" && item.isLoaded) return;

        const list = dateMap.get(order.date) || [];
        list.push({
          orderId: order.id,
          clientName: order.clientName,
          clientPhone: clientPhoneMap.get(order.clientName),
          itemName: item.name,
          itemCategory: item.category || "기타",
          quantity: item.unitQuantity,
          isLoaded: !!item.isLoaded,
          isDelivered: !!order.isDelivered,
          memo: order.memo
        });
        dateMap.set(order.date, list);
      });
    });

    // Sort dates descending
    const sortedDates = Array.from(dateMap.keys()).sort((a, b) => b.localeCompare(a));

    return sortedDates.map(date => {
      const records = dateMap.get(date)!;
      // Sort records by client name
      records.sort((a, b) => a.clientName.localeCompare(b.clientName));

      const totalQuantity = records.reduce((sum, r) => sum + r.quantity, 0);
      const loadedQuantity = records.filter(r => r.isLoaded).reduce((sum, r) => sum + r.quantity, 0);
      const unloadedQuantity = totalQuantity - loadedQuantity;
      const uniqueClients = new Set(records.map(r => r.clientName));

      const [y, m, d] = date.split("-").map(Number);
      const dateObj = new Date(y, m - 1, d);
      const days = ["일", "월", "화", "수", "목", "금", "토"];
      const dayOfWeek = days[dateObj.getDay()];
      const mmdd = `${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const holidayName = HOLIDAYS[date] || HOLIDAYS[mmdd];

      return {
        date,
        dayOfWeek,
        holidayName,
        totalQuantity: Number(totalQuantity.toFixed(1)),
        loadedQuantity: Number(loadedQuantity.toFixed(1)),
        unloadedQuantity: Number(unloadedQuantity.toFixed(1)),
        clientCount: uniqueClients.size,
        records
      };
    });
  }, [orders, clients, startDate, endDate, activeSearchedTerm, itemSearch, statusFilter, hasSearched]);

  // Overall statistics
  const summaryStats = useMemo(() => {
    let totalQty = 0;
    let loadedQty = 0;
    let unloadedQty = 0;
    const allClients = new Set<string>();
    let totalRecordCount = 0;

    dateGroupedResults.forEach(group => {
      totalQty += group.totalQuantity;
      loadedQty += group.loadedQuantity;
      unloadedQty += group.unloadedQuantity;
      group.records.forEach(r => {
        allClients.add(r.clientName);
        totalRecordCount++;
      });
    });

    return {
      totalQty: Number(totalQty.toFixed(1)),
      loadedQty: Number(loadedQty.toFixed(1)),
      unloadedQty: Number(unloadedQty.toFixed(1)),
      dateCount: dateGroupedResults.length,
      clientCount: allClients.size,
      totalRecordCount
    };
  }, [dateGroupedResults]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-md" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              <span>기간별 품목 검색</span>
            </h3>
            <p className="text-[11px] font-bold text-slate-400 mt-0.5">
              선택한 기간 동안 품목을 주문한 거래처를 날짜별로 표시합니다.
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors text-xl font-bold"
          >
            &times;
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Period selector */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">조회 기간</span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => applyPreset("today")} className="px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors">오늘</button>
                <button type="button" onClick={() => applyPreset("7days")} className="px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors">최근 7일</button>
                <button type="button" onClick={() => applyPreset("month")} className="px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors">이번 달</button>
                <button type="button" onClick={() => applyPreset("30days")} className="px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors">최근 30일</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400">시작일</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)} 
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400">종료일</label>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={e => setEndDate(e.target.value)} 
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20" 
                />
              </div>
            </div>
          </div>

          {/* Item search input */}
          <div className="space-y-1.5 relative">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">검색할 품목 (비워두면 전체 품목)</label>
              {itemSearch && (
                <button 
                  type="button" 
                  onClick={() => { setItemSearch(""); handleExecuteSearch(""); }} 
                  className="text-[10px] font-bold text-slate-400 hover:text-slate-600 underline"
                >
                  초기화
                </button>
              )}
            </div>
            <div className="relative">
              <input 
                type="text" 
                value={itemSearch} 
                onChange={e => { 
                  setItemSearch(e.target.value); 
                  setShowSuggestions(true); 
                }} 
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleExecuteSearch();
                  }
                }}
                placeholder="검색할 품목명 또는 초성 입력 (예: 원형, 아크릴, ㅇㅎ)..."
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-50">
                {filteredSuggestions.map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => { 
                      setItemSearch(item.name); 
                      setShowSuggestions(false); 
                      handleExecuteSearch(item.name);
                    }} 
                    className="px-4 py-2.5 hover:bg-blue-50/80 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase ${getProductCategoryColor(item.category)}`}>
                        {item.category}
                      </span>
                      <span className="font-bold text-slate-800">{item.name}</span>
                      {item.shortcut && (
                        <span className="text-[10px] font-mono text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">
                          {item.shortcut}
                        </span>
                      )}
                    </div>
                    {item.count > 0 && (
                      <span className="text-[10px] text-slate-400 font-bold">주문 {item.count}회</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Popular item chips */}
            {popularChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400">자주 찾는 품목:</span>
                {popularChips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setItemSearch(chip.name);
                      handleExecuteSearch(chip.name);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                      itemSearch === chip.name 
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs" 
                        : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                    }`}
                  >
                    {chip.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Action Button */}
          <button 
            type="button"
            onClick={() => handleExecuteSearch()} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-extrabold shadow-sm hover:shadow active:scale-[0.99] transition-all text-xs flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>선택한 기간 품목 검색</span>
          </button>

          {hasSearched && (
            <div className="space-y-3.5 pt-2 border-t border-slate-100">
              {/* Summary Stats Banner */}
              <div className="bg-slate-900 text-white rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-2.5">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400">검색 대상:</span>
                    <span className="text-xs font-black text-blue-400 bg-blue-950 px-2 py-0.5 rounded-md border border-blue-800">
                      {activeSearchedTerm || itemSearch ? activeSearchedTerm || itemSearch : "전체 품목"}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {startDate} ~ {endDate}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center pt-0.5">
                  <div className="bg-slate-800/80 p-2 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-400">총 주문수량</p>
                    <p className="text-base font-black text-amber-400">{summaryStats.totalQty}개</p>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-400">주문 일수</p>
                    <p className="text-base font-black text-blue-300">{summaryStats.dateCount}일</p>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-400">주문 거래처</p>
                    <p className="text-base font-black text-emerald-400">{summaryStats.clientCount}곳</p>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-400">상차/미상차</p>
                    <p className="text-xs font-black text-slate-200 mt-1">
                      <span className="text-emerald-400">{summaryStats.loadedQty}</span> / <span className="text-slate-400">{summaryStats.unloadedQty}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {[
                  { id: "all", label: "전체" },
                  { id: "loaded", label: "상차 완료" },
                  { id: "unloaded", label: "미상차" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      soundService.playButtonClick();
                      setStatusFilter(tab.id as any);
                    }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      statusFilter === tab.id 
                        ? "bg-white text-blue-600 shadow-xs font-black" 
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Date Grouped Results (날짜별 주문 거래처 표시) */}
              {dateGroupedResults.length === 0 ? (
                <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-600 font-bold text-sm">해당 조건의 주문 내역이 없습니다.</p>
                  <p className="text-slate-400 text-xs mt-1">품목 검색어 또는 조회 기간을 변경해 보세요.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center px-1 text-xs font-bold text-slate-500">
                    <span>날짜별 주문 내역 ({dateGroupedResults.length}일간)</span>
                    <span className="text-[11px] text-slate-400">최신 날짜순</span>
                  </div>

                  {dateGroupedResults.map(group => {
                    const isSun = group.dayOfWeek === "일";
                    const isSat = group.dayOfWeek === "토";
                    return (
                      <div key={group.date} className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
                        {/* Date Header */}
                        <div className="bg-slate-50/90 px-3.5 py-2.5 border-b border-slate-200/70 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-black ${isSun ? "text-red-600" : isSat ? "text-blue-600" : "text-slate-800"}`}>
                              📅 {group.date} ({group.dayOfWeek})
                            </span>
                            {group.holidayName && (
                              <span className="text-[9px] font-extrabold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                                {group.holidayName}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500">
                              합계 <span className="font-black text-blue-600">{group.totalQuantity}개</span> ({group.clientCount}곳)
                            </span>
                            {onSelectDate && (
                              <button 
                                onClick={() => {
                                  soundService.playButtonClick();
                                  onSelectDate(group.date);
                                }}
                                className="text-[10px] font-extrabold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors border border-blue-200/60"
                              >
                                이 날짜로 이동 →
                              </button>
                            )}
                          </div>
                        </div>

                        {/* List of Clients ordering on this date */}
                        <div className="divide-y divide-slate-100 p-1">
                          {group.records.map((rec, rIdx) => (
                            <div key={rIdx} className="p-2.5 sm:p-3 hover:bg-slate-50/70 transition-colors rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-black text-slate-800 text-sm">
                                    {rec.clientName}
                                  </span>
                                  {rec.clientPhone && (
                                    <a href={`tel:${rec.clientPhone}`} className="text-slate-400 hover:text-blue-500 transition-colors" title={`전화: ${rec.clientPhone}`}>
                                      <Phone className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                  {rec.isLoaded ? (
                                    <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                      <Check className="w-3 h-3 text-emerald-600" /> 상차 완료
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-extrabold bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded-md">
                                      미상차
                                    </span>
                                  )}
                                  {rec.isDelivered && (
                                    <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                                      납품완료
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap">
                                  <span className={`text-[10px] font-black uppercase ${getProductCategoryColor(rec.itemCategory)}`}>
                                    [{rec.itemCategory}]
                                  </span>
                                  <span className="font-bold text-slate-700">{rec.itemName}</span>
                                  {rec.memo && (
                                    <span className="text-[11px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50">
                                      비고: {rec.memo}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center">
                                <span className="text-sm font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100/60">
                                  {rec.quantity}개
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default App;
