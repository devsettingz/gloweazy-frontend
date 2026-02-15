/**
 * WalletContext
 * Manages wallet state including balance, transactions, and escrow
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from 'react-native-toast-message';
import api from '../utils/api';
import { useAuth } from './AuthContext';

/** Transaction type including escrow */
export type TransactionType = 'credit' | 'debit' | 'escrow';

/** Transaction status */
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'released';

/** Wallet transaction */
export interface WalletTransaction {
  id: string;
  type: TransactionType | 'credit' | 'debit' | 'escrow' | 'payout';
  amount: number;
  currency?: string;
  description?: string;
  createdAt: string;
  status: TransactionStatus | 'pending' | 'completed' | 'failed' | 'released';
  bookingId?: string;
  reference?: string;
  method?: string;
}

/** Wallet state interface */
interface WalletState {
  /** Current available balance */
  balance: number;
  /** Transaction history */
  transactions: WalletTransaction[];
  /** Amount held in escrow (frozen during disputes) */
  escrowAmount: number;
  /** Loading state for async operations */
  loading: boolean;
  /** Error message if any */
  error: string | null;
}

/** Wallet context interface */
interface WalletContextType extends WalletState {
  /** Fetch current balance from server */
  fetchBalance: () => Promise<void>;
  /** Fetch transaction history */
  fetchTransactions: () => Promise<void>;
  /** Refresh all wallet data */
  refresh: () => Promise<void>;
  /** Create a payout/withdrawal */
  createPayout: (amount: number) => Promise<boolean>;
  /** Hold funds in escrow for a booking */
  holdEscrow: (bookingId: string, amount: number) => Promise<boolean>;
  /** Release escrow funds to stylist or back to client */
  releaseEscrow: (bookingId: string, toStylist: boolean) => Promise<boolean>;
  /** Clear any error */
  clearError: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [escrowAmount, setEscrowAmount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  /**
   * Fetch current wallet balance
   * GET /wallet/balance
   */
  const fetchBalance = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const res = await api.get('/wallet/balance');
      const data = res.data;

      setBalance(data.balance ?? 0);
      setEscrowAmount(data.escrowAmount ?? 0);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching balance:', err);
      const message = err?.response?.data?.message || 'Failed to fetch balance';
      setError(message);
      // Don't show toast here - let caller decide
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * Fetch transaction history
   * GET /wallet/transactions
   */
  const fetchTransactions = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const res = await api.get('/wallet/transactions');
      const data = res.data;

      setTransactions(data.transactions ?? []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      const message = err?.response?.data?.message || 'Failed to fetch transactions';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * Refresh all wallet data
   */
  const refresh = useCallback(async () => {
    await Promise.all([fetchBalance(), fetchTransactions()]);
  }, [fetchBalance, fetchTransactions]);

  /**
   * Create a payout/withdrawal
   * POST /wallet/payout
   */
  const createPayout = useCallback(async (amount: number): Promise<boolean> => {
    if (!user?.id) {
      Toast.show({
        type: 'error',
        text1: 'Not authenticated',
        text2: 'Please log in to continue',
      });
      return false;
    }

    if (amount <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Invalid amount',
        text2: 'Amount must be greater than 0',
      });
      return false;
    }

    if (amount > balance) {
      Toast.show({
        type: 'error',
        text1: 'Insufficient balance',
        text2: `Available: $${balance.toFixed(2)}`,
      });
      return false;
    }

    try {
      setLoading(true);
      const res = await api.post('/wallet/payout', {
        userId: user.id,
        amount,
      });

      // Update balance after successful payout
      setBalance((prev) => prev - amount);

      // Add transaction to history
      const newTransaction: WalletTransaction = {
        id: res.data.transactionId || `payout_${Date.now()}`,
        type: 'debit',
        amount,
        description: `Payout to bank account`,
        createdAt: new Date().toISOString(),
        status: 'pending',
      };
      setTransactions((prev) => [newTransaction, ...prev]);

      Toast.show({
        type: 'success',
        text1: 'Payout initiated',
        text2: `$${amount.toFixed(2)} will be transferred soon`,
      });

      setError(null);
      return true;
    } catch (err: any) {
      console.error('Payout error:', err);
      const message = err?.response?.data?.message || 'Failed to create payout';
      setError(message);
      Toast.show({
        type: 'error',
        text1: 'Payout failed',
        text2: message,
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, balance]);

  /**
   * Hold funds in escrow for a booking
   * POST /wallet/escrow/hold
   */
  const holdEscrow = useCallback(async (
    bookingId: string,
    amount: number
  ): Promise<boolean> => {
    if (!user?.id) {
      Toast.show({
        type: 'error',
        text1: 'Not authenticated',
        text2: 'Please log in to continue',
      });
      return false;
    }

    try {
      setLoading(true);
      const res = await api.post('/wallet/escrow/hold', {
        userId: user.id,
        bookingId,
        amount,
      });

      // Update local state
      setBalance((prev) => prev - amount);
      setEscrowAmount((prev) => prev + amount);

      // Add transaction to history
      const newTransaction: WalletTransaction = {
        id: res.data.transactionId || `escrow_${bookingId}`,
        type: 'escrow',
        amount,
        description: `Escrow hold for booking #${bookingId.slice(-6)}`,
        createdAt: new Date().toISOString(),
        status: 'pending',
        bookingId,
      };
      setTransactions((prev) => [newTransaction, ...prev]);

      Toast.show({
        type: 'success',
        text1: 'Payment secured',
        text2: `$${amount.toFixed(2)} held in escrow`,
      });

      setError(null);
      return true;
    } catch (err: any) {
      console.error('Escrow hold error:', err);
      const message = err?.response?.data?.message || 'Failed to hold escrow';
      setError(message);
      Toast.show({
        type: 'error',
        text1: 'Escrow failed',
        text2: message,
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * Release escrow funds
   * POST /wallet/escrow/release
   * @param toStylist - true: release to stylist, false: refund to client
   */
  const releaseEscrow = useCallback(async (
    bookingId: string,
    toStylist: boolean
  ): Promise<boolean> => {
    if (!user?.id) {
      Toast.show({
        type: 'error',
        text1: 'Not authenticated',
        text2: 'Please log in to continue',
      });
      return false;
    }

    try {
      setLoading(true);
      const res = await api.post('/wallet/escrow/release', {
        userId: user.id,
        bookingId,
        toStylist,
      });

      const amount = res.data.amount || 0;

      // Update local state
      setEscrowAmount((prev) => Math.max(0, prev - amount));

      if (!toStylist) {
        // Refund to client - add back to balance
        setBalance((prev) => prev + amount);
      }

      // Update transaction status
      setTransactions((prev) =>
        prev.map((t) =>
          t.bookingId === bookingId && t.type === 'escrow'
            ? { ...t, status: 'released' }
            : t
        )
      );

      // Add release transaction
      const newTransaction: WalletTransaction = {
        id: res.data.transactionId || `release_${bookingId}`,
        type: toStylist ? 'debit' : 'credit',
        amount,
        description: toStylist
          ? `Released to stylist for booking #${bookingId.slice(-6)}`
          : `Refund for booking #${bookingId.slice(-6)}`,
        createdAt: new Date().toISOString(),
        status: 'completed',
        bookingId,
      };
      setTransactions((prev) => [newTransaction, ...prev]);

      Toast.show({
        type: 'success',
        text1: toStylist ? 'Payment released' : 'Refund processed',
        text2: `$${amount.toFixed(2)} ${toStylist ? 'transferred to stylist' : 'refunded to your wallet'}`,
      });

      setError(null);
      return true;
    } catch (err: any) {
      console.error('Escrow release error:', err);
      const message = err?.response?.data?.message || 'Failed to release escrow';
      setError(message);
      Toast.show({
        type: 'error',
        text1: 'Release failed',
        text2: message,
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const value: WalletContextType = {
    balance,
    transactions,
    escrowAmount,
    loading,
    error,
    fetchBalance,
    fetchTransactions,
    refresh,
    createPayout,
    holdEscrow,
    releaseEscrow,
    clearError,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

/** Hook to access wallet context */
export function useWallet(): WalletContextType {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return ctx;
}
