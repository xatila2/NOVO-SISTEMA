import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function calculateWorkingDays(month: number, year: number, holidays: string[] = []): number {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  let workingDays = 0;
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    const dateString = d.toISOString().split('T')[0];
    
    // For a clothing store, only Sunday (0) is NOT a working day. Saturday (6) is an active working day.
    if (dayOfWeek !== 0 && !holidays.includes(dateString)) {
      workingDays++;
    }
  }
  return workingDays;
}

// Calculate remaining working days from "today" in the month
export function calculateRemainingWorkingDays(today: Date, month: number, year: number, holidays: string[] = []): number {
  if (today.getMonth() !== month || today.getFullYear() !== year) {
    // If today is not in the target month, return all working days if today is before the month, 0 if after
    if (today < new Date(year, month, 1)) return calculateWorkingDays(month, year, holidays);
    return 0;
  }

  const endDate = new Date(year, month + 1, 0);
  let remaining = 0;
  
  for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    const dateString = d.toISOString().split('T')[0];
    
    // For a clothing store, only Sunday (0) is NOT a working day. Saturday (6) is an active working day.
    if (dayOfWeek !== 0 && !holidays.includes(dateString)) {
      remaining++;
    }
  }
  
  // ensure we don't return 0 if there's still money to be made
  return Math.max(1, remaining);
}
