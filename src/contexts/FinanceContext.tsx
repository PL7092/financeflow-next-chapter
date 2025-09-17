import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string;
  category: string;
  entity?: string;
  account: string;
  date: string;
  tags?: string[];
  recurringId?: string;
  created_at: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  month: number;
  year: number;
  created_at: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  currency: string;
  created_at: string;
}

export interface Investment {
  id: string;
  name: string;
  type: string;
  amount: number;
  currentValue: number;
  return: number;
  returnPercentage: number;
  created_at: string;
}

export interface RecurringTransaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  account: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDate: string;
  isActive: boolean;
  created_at: string;
  // Enhanced features
  expectedAmount?: number;
  tolerancePercentage?: number;
  alertOnVariation?: boolean;
  aiRecommendations?: {
    suggestedAmount?: number;
    reason?: string;
    confidence?: number;
  };
  lastProcessed?: string;
  variationHistory?: Array<{
    date: string;
    expected: number;
    actual: number;
    variance: number;
  }>;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  value: number;
  purchaseDate: string;
  created_at: string;
  // Enhanced features
  purchasePrice?: number;
  maintenanceCosts?: Array<{
    id: string;
    date: string;
    description: string;
    amount: number;
    type: 'maintenance' | 'insurance' | 'tax' | 'other';
  }>;
  associatedTransactions?: string[]; // Transaction IDs
  documents?: Array<{
    id: string;
    name: string;
    type: 'invoice' | 'warranty' | 'insurance' | 'manual' | 'other';
    url?: string;
    uploadDate: string;
  }>;
  depreciation?: {
    method: 'linear' | 'accelerated' | 'none';
    rate?: number;
    usefulLife?: number;
  };
  notes?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  created_at: string;
  // Enhanced features
  category?: string;
  priority: 'low' | 'medium' | 'high';
  autoContributions?: {
    enabled: boolean;
    amount?: number;
    frequency?: 'weekly' | 'monthly';
    accountId?: string;
    conditions?: Array<{
      type: 'transaction_match' | 'surplus_detection' | 'scheduled';
      pattern?: string; // For transaction matching
      percentage?: number; // For surplus detection
    }>;
  };
  milestones?: Array<{
    id: string;
    amount: number;
    description: string;
    achieved: boolean;
    achievedDate?: string;
  }>;
  associatedTransactions?: string[]; // Transaction IDs that contributed
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  // Enhanced features
  parentId?: string; // For subcategories
  icon?: string;
  keywords?: string[]; // For AI categorization
  rules?: Array<{
    id: string;
    condition: string; // e.g., "description contains 'netflix'"
    confidence: number;
    active: boolean;
  }>;
  budgetDefault?: number;
  isActive: boolean;
}

export interface Entity {
  id: string;
  name: string;
  type: string;
  // Enhanced features
  aliases?: string[]; // Alternative names for matching
  defaultCategory?: string;
  website?: string;
  notes?: string;
  transactionPatterns?: Array<{
    pattern: string;
    confidence: number;
  }>;
  isActive: boolean;
}

interface FinanceContextType {
  // Data
  transactions: Transaction[];
  budgets: Budget[];
  accounts: Account[];
  investments: Investment[];
  recurringTransactions: RecurringTransaction[];
  assets: Asset[];
  savingsGoals: SavingsGoal[];
  categories: Category[];
  entities: Entity[];
  
  // Loading states
  isLoading: boolean;
  
  // Actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'created_at'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  addBudget: (budget: Omit<Budget, 'id' | 'created_at'>) => Promise<void>;
  updateBudget: (id: string, budget: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  
  addAccount: (account: Omit<Account, 'id' | 'created_at'>) => Promise<void>;
  updateAccount: (id: string, account: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  
  addInvestment: (investment: Omit<Investment, 'id' | 'created_at'>) => Promise<void>;
  updateInvestment: (id: string, investment: Partial<Investment>) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
  
  addRecurringTransaction: (transaction: Omit<RecurringTransaction, 'id' | 'created_at'>) => Promise<void>;
  updateRecurringTransaction: (id: string, transaction: Partial<RecurringTransaction>) => Promise<void>;
  deleteRecurringTransaction: (id: string) => Promise<void>;
  
  addAsset: (asset: Omit<Asset, 'id' | 'created_at'>) => Promise<void>;
  updateAsset: (id: string, asset: Partial<Asset>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'created_at'>) => Promise<void>;
  updateSavingsGoal: (id: string, goal: Partial<SavingsGoal>) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;
  
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  addEntity: (entity: Omit<Entity, 'id'>) => Promise<void>;
  deleteEntity: (id: string) => Promise<void>;
  
  refreshData: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

// Mock data for development (will be replaced with MariaDB calls)
const mockData = {
  categories: [
    { id: '1', name: 'Alimentação', type: 'expense' as const, color: '#FF6B6B', isActive: true },
    { id: '2', name: 'Transporte', type: 'expense' as const, color: '#4ECDC4', isActive: true },
    { id: '3', name: 'Entretenimento', type: 'expense' as const, color: '#45B7D1', isActive: true },
    { id: '4', name: 'Salário', type: 'income' as const, color: '#96CEB4', isActive: true },
    { id: '5', name: 'Freelance', type: 'income' as const, color: '#FFEAA7', isActive: true },
  ],
  accounts: [
    { id: '1', name: 'Conta Principal', type: 'checking' as const, balance: 15247.85, currency: 'EUR', created_at: new Date().toISOString() },
    { id: '2', name: 'Poupanças', type: 'savings' as const, balance: 5000.00, currency: 'EUR', created_at: new Date().toISOString() },
    { id: '3', name: 'Cartão de Crédito', type: 'credit' as const, balance: -1500.00, currency: 'EUR', created_at: new Date().toISOString() },
  ],
  entities: [
    { id: '1', name: 'Continente', type: 'Supermercado', isActive: true },
    { id: '2', name: 'Galp', type: 'Combustível', isActive: true },
    { id: '3', name: 'Netflix', type: 'Streaming', isActive: true },
  ]
};

interface FinanceProviderProps {
  children: ReactNode;
}

export const FinanceProvider: React.FC<FinanceProviderProps> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [accounts, setAccounts] = useState<Account[]>(mockData.accounts);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [categories, setCategories] = useState<Category[]>(mockData.categories);
  const [entities, setEntities] = useState<Entity[]>(mockData.entities);
  const [isLoading, setIsLoading] = useState(false);

  // API Helper function for MariaDB calls
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('auth_token');
    return fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  };

  // Transaction methods
  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at'>) => {
    try {
      // For Docker/MariaDB: await apiCall('/transactions', { method: 'POST', body: JSON.stringify(transaction) });
      
      // Mock implementation
      const newTransaction: Transaction = {
        ...transaction,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      };
      setTransactions(prev => [newTransaction, ...prev]);
      
      // Update budget spent amount if expense
      if (transaction.type === 'expense') {
        setBudgets(prev => prev.map(budget => 
          budget.category === transaction.category
            ? { ...budget, spent: budget.spent + transaction.amount }
            : budget
        ));
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const updateTransaction = async (id: string, transaction: Partial<Transaction>) => {
    try {
      // For Docker/MariaDB: await apiCall(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(transaction) });
      
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...transaction } : t));
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      // For Docker/MariaDB: await apiCall(`/transactions/${id}`, { method: 'DELETE' });
      
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  };

  // Budget methods
  const addBudget = async (budget: Omit<Budget, 'id' | 'created_at'>) => {
    try {
      const newBudget: Budget = {
        ...budget,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      };
      setBudgets(prev => [...prev, newBudget]);
    } catch (error) {
      console.error('Error adding budget:', error);
      throw error;
    }
  };

  const updateBudget = async (id: string, budget: Partial<Budget>) => {
    try {
      setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...budget } : b));
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      setBudgets(prev => prev.filter(b => b.id !== id));
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  };

  // Account methods
  const addAccount = async (account: Omit<Account, 'id' | 'created_at'>) => {
    try {
      const newAccount: Account = {
        ...account,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      };
      setAccounts(prev => [...prev, newAccount]);
    } catch (error) {
      console.error('Error adding account:', error);
      throw error;
    }
  };

  const updateAccount = async (id: string, account: Partial<Account>) => {
    try {
      setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...account } : a));
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      setAccounts(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  };

  // Investment methods
  const addInvestment = async (investment: Omit<Investment, 'id' | 'created_at'>) => {
    try {
      const newInvestment: Investment = {
        ...investment,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      };
      setInvestments(prev => [...prev, newInvestment]);
    } catch (error) {
      console.error('Error adding investment:', error);
      throw error;
    }
  };

  const updateInvestment = async (id: string, investment: Partial<Investment>) => {
    try {
      setInvestments(prev => prev.map(i => i.id === id ? { ...i, ...investment } : i));
    } catch (error) {
      console.error('Error updating investment:', error);
      throw error;
    }
  };

  const deleteInvestment = async (id: string) => {
    try {
      setInvestments(prev => prev.filter(i => i.id !== id));
    } catch (error) {
      console.error('Error deleting investment:', error);
      throw error;
    }
  };

  // Recurring transaction methods
  const addRecurringTransaction = async (transaction: Omit<RecurringTransaction, 'id' | 'created_at'>) => {
    try {
      const newTransaction: RecurringTransaction = {
        ...transaction,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      };
      setRecurringTransactions(prev => [...prev, newTransaction]);
    } catch (error) {
      console.error('Error adding recurring transaction:', error);
      throw error;
    }
  };

  const updateRecurringTransaction = async (id: string, transaction: Partial<RecurringTransaction>) => {
    try {
      setRecurringTransactions(prev => prev.map(r => r.id === id ? { ...r, ...transaction } : r));
    } catch (error) {
      console.error('Error updating recurring transaction:', error);
      throw error;
    }
  };

  const deleteRecurringTransaction = async (id: string) => {
    try {
      setRecurringTransactions(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting recurring transaction:', error);
      throw error;
    }
  };

  // Asset methods
  const addAsset = async (asset: Omit<Asset, 'id' | 'created_at'>) => {
    try {
      const newAsset: Asset = {
        ...asset,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      };
      setAssets(prev => [...prev, newAsset]);
    } catch (error) {
      console.error('Error adding asset:', error);
      throw error;
    }
  };

  const updateAsset = async (id: string, asset: Partial<Asset>) => {
    try {
      setAssets(prev => prev.map(a => a.id === id ? { ...a, ...asset } : a));
    } catch (error) {
      console.error('Error updating asset:', error);
      throw error;
    }
  };

  const deleteAsset = async (id: string) => {
    try {
      setAssets(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting asset:', error);
      throw error;
    }
  };

  // Savings goal methods
  const addSavingsGoal = async (goal: Omit<SavingsGoal, 'id' | 'created_at'>) => {
    try {
      const newGoal: SavingsGoal = {
        ...goal,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      };
      setSavingsGoals(prev => [...prev, newGoal]);
    } catch (error) {
      console.error('Error adding savings goal:', error);
      throw error;
    }
  };

  const updateSavingsGoal = async (id: string, goal: Partial<SavingsGoal>) => {
    try {
      setSavingsGoals(prev => prev.map(g => g.id === id ? { ...g, ...goal } : g));
    } catch (error) {
      console.error('Error updating savings goal:', error);
      throw error;
    }
  };

  const deleteSavingsGoal = async (id: string) => {
    try {
      setSavingsGoals(prev => prev.filter(g => g.id !== id));
    } catch (error) {
      console.error('Error deleting savings goal:', error);
      throw error;
    }
  };

  // Category methods
  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      const newCategory: Category = {
        ...category,
        id: Date.now().toString(),
      };
      setCategories(prev => [...prev, newCategory]);
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  // Entity methods
  const addEntity = async (entity: Omit<Entity, 'id'>) => {
    try {
      const newEntity: Entity = {
        ...entity,
        id: Date.now().toString(),
      };
      setEntities(prev => [...prev, newEntity]);
    } catch (error) {
      console.error('Error adding entity:', error);
      throw error;
    }
  };

  const deleteEntity = async (id: string) => {
    try {
      setEntities(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting entity:', error);
      throw error;
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      // For Docker/MariaDB: fetch all data from backend
      // const [transactionsRes, budgetsRes, accountsRes, ...] = await Promise.all([
      //   apiCall('/transactions'),
      //   apiCall('/budgets'),
      //   apiCall('/accounts'),
      //   // ... other endpoints
      // ]);
      
      // Mock implementation - in production, load from MariaDB
      console.log('Data refreshed from MariaDB');
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const value = {
    // Data
    transactions,
    budgets,
    accounts,
    investments,
    recurringTransactions,
    assets,
    savingsGoals,
    categories,
    entities,
    isLoading,
    
    // Actions
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
    addAccount,
    updateAccount,
    deleteAccount,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    addRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    addAsset,
    updateAsset,
    deleteAsset,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addCategory,
    deleteCategory,
    addEntity,
    deleteEntity,
    refreshData,
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};