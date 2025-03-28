
import React from 'react';
import { formatSol } from '@/lib/utils';

interface BalanceDisplayProps {
  balance: number;
}

export const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ balance }) => {
  return (
    <div className="inline-flex items-center gap-2 py-1.5 px-3 rounded-full border text-sm font-medium bg-green-500/10 text-green-500 border-green-500/20">
      <span>Balance: {formatSol(balance)}</span>
    </div>
  );
};
