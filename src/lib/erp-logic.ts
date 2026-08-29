
import { differenceInDays, isBefore, parseISO } from 'date-fns';

export type ERPStatus = 
  | 'NEW' 
  | 'CONFIRMED' 
  | 'PROCESSING' 
  | 'SHIPPED' 
  | 'DELIVERED' 
  | 'CANCELLED' 
  | 'LOW STOCK' 
  | 'IN STOCK'
  | 'DELAYED';

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'NEW': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'CONFIRMED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'PROCESSING': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'SHIPPED': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    case 'DELIVERED': return 'bg-green-100 text-green-700 border-green-200';
    case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
    case 'LOW STOCK': return 'bg-rose-100 text-rose-700 border-rose-200';
    case 'DELAYED': return 'bg-red-100 text-red-800 border-red-300 animate-pulse';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export const generateId = (prefix: string, count: number) => {
  return `${prefix}${1000 + count + 1}`;
};

export const isDeliveryDelayed = (expectedDate: string, status: string) => {
  if (status === 'DELIVERED' || status === 'CANCELLED') return false;
  const expected = parseISO(expectedDate);
  const today = new Date();
  return isBefore(expected, today);
};

export const calculateDaysDelayed = (expectedDate: string) => {
  const expected = parseISO(expectedDate);
  const today = new Date();
  const diff = differenceInDays(today, expected);
  return diff > 0 ? diff : 0;
};
