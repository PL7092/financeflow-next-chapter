import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: 'income' | 'expense' | 'transfer';
  categoryId?: string;
  accountId: string;
  date: string;
  tags?: string[];
  notes?: string;
  receiptUrl?: string;
  location?: string;
  entity?: string;
  isReconciled?: boolean;
  // From database views
  category_name?: string;
  category_color?: string;
  account_name?: string;
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  categoryId?: string;
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  alertThreshold?: number;
  isActive: boolean;
  // From database views
  category_name?: string;
  category_color?: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash' | 'other';
  balance: number;
  currency: string;
  bankName?: string;
  accountNumber?: string;
  isActive: boolean;
  created_at: string;
}

export interface Investment {
  id: string;
  name: string;
  symbol?: string;
  type: 'stock' | 'bond' | 'mutual_fund' | 'etf' | 'crypto' | 'real_estate' | 'other';
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  marketValue: number;
  gainLoss: number;
  gainLossPercentage: number;
  purchaseDate?: string;
  accountId?: string;
  // Computed values
  currentValue?: number;
  totalCost?: number;
}

export interface RecurringTransaction {
  id: string;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  categoryId?: string;
  accountId: string;
  startDate: string;
  endDate?: string;
  nextOccurrence: string;
  lastProcessed?: string;
  occurrenceCount: number;
  isActive: boolean;
}

export interface Asset {
  id: string;
  name: string;
  type: 'property' | 'vehicle' | 'collectible' | 'other';
  purchasePrice?: number;
  currentValue?: number;
  purchaseDate?: string;
  description?: string;
  depreciationRate?: number;
  created_at: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  accountId?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  type?: 'income' | 'expense';
  color: string;
  icon?: string;
  isActive: boolean;
  isSystem?: boolean;
}

export interface Entity {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
}

export interface AIRule {
  id: string;
  name: string;
  description: string;
  conditions: any[];
  actions: any[];
  isActive: boolean;
  created_at: string;
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
  aiRules: AIRule[];
  isLoading: boolean;

  // Transaction methods
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<Transaction>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  // Budget methods
  addBudget: (budget: Omit<Budget, 'id'>) => Promise<Budget>;
  updateBudget: (id: string, budget: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  
  // Account methods
  addAccount: (account: Omit<Account, 'id' | 'created_at'>) => Promise<Account>;
  updateAccount: (id: string, account: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  
  // Investment methods
  addInvestment: (investment: Omit<Investment, 'id'>) => Promise<void>;
  updateInvestment: (id: string, investment: Partial<Investment>) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
  
  // Recurring transaction methods
  addRecurringTransaction: (transaction: Omit<RecurringTransaction, 'id'>) => Promise<void>;
  updateRecurringTransaction: (id: string, transaction: Partial<RecurringTransaction>) => Promise<void>;
  deleteRecurringTransaction: (id: string) => Promise<void>;
  
  // Asset methods
  addAsset: (asset: Omit<Asset, 'id' | 'created_at'>) => Promise<void>;
  updateAsset: (id: string, asset: Partial<Asset>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  
  // Savings goal methods
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'created_at'>) => Promise<void>;
  updateSavingsGoal: (id: string, goal: Partial<SavingsGoal>) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;
  
  // Category methods
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  addEntity: (entity: Omit<Entity, 'id'>) => Promise<void>;
  updateEntity: (id: string, entity: Partial<Entity>) => Promise<void>;
  deleteEntity: (id: string) => Promise<void>;
  
  addAIRule: (rule: Omit<AIRule, 'id' | 'created_at'>) => Promise<void>;
  updateAIRule: (id: string, rule: Partial<AIRule>) => Promise<void>;
  deleteAIRule: (id: string) => Promise<void>;
  
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

interface FinanceProviderProps {
  children: ReactNode;
}

export const FinanceProvider: React.FC<FinanceProviderProps> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [aiRules, setAIRules] = useState<AIRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // API Helper function for MariaDB calls
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }
    
    return response.json();
  };

  // Load data functions
  const loadTransactions = async () => {
    try {
      const response = await apiCall('/transactions');
      if (response.success) {
        setTransactions(response.data);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadAccounts = async () => {
    try {
      const response = await apiCall('/accounts');
      if (response.success) {
        setAccounts(response.data);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiCall('/categories');
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadBudgets = async () => {
    try {
      const response = await apiCall('/budgets');
      if (response.success) {
        setBudgets(response.data);
      }
    } catch (error) {
      console.error('Error loading budgets:', error);
    }
  };

  // Load all data from MariaDB on component mount
  useEffect(() => {
    refreshData();
  }, []);

  // Add Transaction - Now uses MariaDB
  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      setIsLoading(true);
      const response = await apiCall('/transactions', {
        method: 'POST',
        body: JSON.stringify(transaction),
      });
      
      if (response.success) {
        setTransactions(prev => [response.data, ...prev]);
        // Refresh accounts to update balances
        await loadAccounts();
        return response.data;
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update Transaction - Now uses MariaDB
  const updateTransaction = async (id: string, transaction: Partial<Transaction>) => {
    try {
      setIsLoading(true);
      const response = await apiCall(`/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(transaction),
      });
      
      if (response.success) {
        setTransactions(prev => prev.map(t => t.id === id ? response.data : t));
        // Refresh accounts to update balances
        await loadAccounts();
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Transaction - Now uses MariaDB
  const deleteTransaction = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await apiCall(`/transactions/${id}`, {
        method: 'DELETE',
      });
      
      if (response.success) {
        setTransactions(prev => prev.filter(t => t.id !== id));
        // Refresh accounts to update balances
        await loadAccounts();
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Add Account - Now uses MariaDB
  const addAccount = async (account: Omit<Account, 'id' | 'created_at'>) => {
    try {
      setIsLoading(true);
      const response = await apiCall('/accounts', {
        method: 'POST',
        body: JSON.stringify(account),
      });
      
      if (response.success) {
        setAccounts(prev => [...prev, response.data]);
        return response.data;
      }
    } catch (error) {
      console.error('Error adding account:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update Account - Now uses MariaDB
  const updateAccount = async (id: string, account: Partial<Account>) => {
    try {
      setIsLoading(true);
      const response = await apiCall(`/accounts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(account),
      });
      
      if (response.success) {
        setAccounts(prev => prev.map(a => a.id === id ? response.data : a));
      }
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Account - Now uses MariaDB
  const deleteAccount = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await apiCall(`/accounts/${id}`, {
        method: 'DELETE',
      });
      
      if (response.success) {
        setAccounts(prev => prev.filter(a => a.id !== id));
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Add Category - Now uses MariaDB
  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      setIsLoading(true);
      const response = await apiCall('/categories', {
        method: 'POST',
        body: JSON.stringify(category),
      });
      
      if (response.success) {
        setCategories(prev => [...prev, response.data]);
        return response.data;
      }
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update Category - Now uses MariaDB
  const updateCategory = async (id: string, category: Partial<Category>) => {
    try {
      setIsLoading(true);
      const response = await apiCall(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(category),
      });
      
      if (response.success) {
        setCategories(prev => prev.map(c => c.id === id ? response.data : c));
      }
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Category - Now uses MariaDB
  const deleteCategory = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await apiCall(`/categories/${id}`, {
        method: 'DELETE',
      });
      
      if (response.success) {
        setCategories(prev => prev.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Add Budget - Now uses MariaDB
  const addBudget = async (budget: Omit<Budget, 'id'>) => {
    try {
      setIsLoading(true);
      const response = await apiCall('/budgets', {
        method: 'POST',
        body: JSON.stringify(budget),
      });
      
      if (response.success) {
        setBudgets(prev => [...prev, response.data]);
        return response.data;
      }
    } catch (error) {
      console.error('Error adding budget:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update Budget - Now uses MariaDB
  const updateBudget = async (id: string, budget: Partial<Budget>) => {
    try {
      setIsLoading(true);
      const response = await apiCall(`/budgets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(budget),
      });
      
      if (response.success) {
        setBudgets(prev => prev.map(b => b.id === id ? response.data : b));
      }
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Budget - Now uses MariaDB
  const deleteBudget = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await apiCall(`/budgets/${id}`, {
        method: 'DELETE',
      });
      
      if (response.success) {
        setBudgets(prev => prev.filter(b => b.id !== id));
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Investment methods (keeping mock for now - TODO: implement MariaDB endpoints)
  const addInvestment = async (investment: Omit<Investment, 'id'>) => {
    try {
      const newInvestment: Investment = {
        ...investment,
        id: Date.now().toString(),
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

  // Recurring transaction methods (keeping mock for now)
  const addRecurringTransaction = async (transaction: Omit<RecurringTransaction, 'id'>) => {
    try {
      const newTransaction: RecurringTransaction = {
        ...transaction,
        id: Date.now().toString(),
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

  // Asset methods (keeping mock for now)
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

  // Savings goal methods (keeping mock for now)
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

  // Entity methods (keeping mock for now)
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

  const updateEntity = async (id: string, entity: Partial<Entity>) => {
    try {
      setEntities(prev => prev.map(e => e.id === id ? { ...e, ...entity } : e));
    } catch (error) {
      console.error('Error updating entity:', error);
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

  // AI Rules methods (keeping mock for now)
  const addAIRule = async (rule: Omit<AIRule, 'id' | 'created_at'>) => {
    try {
      const newRule: AIRule = {
        ...rule,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      };
      setAIRules(prev => [...prev, newRule]);
    } catch (error) {
      console.error('Error adding AI rule:', error);
      throw error;
    }
  };

  const updateAIRule = async (id: string, rule: Partial<AIRule>) => {
    try {
      setAIRules(prev => prev.map(r => r.id === id ? { ...r, ...rule } : r));
    } catch (error) {
      console.error('Error updating AI rule:', error);
      throw error;
    }
  };

  const deleteAIRule = async (id: string) => {
    try {
      setAIRules(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting AI rule:', error);
      throw error;
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      // Load all data from MariaDB
      await Promise.all([
        loadTransactions(),
        loadBudgets(),
        loadAccounts(),
        loadCategories(),
        // TODO: Add other data loading functions when implemented
      ]);
      console.log('Data refreshed from MariaDB');
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
    aiRules,
    isLoading,

    // Methods
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
    updateCategory,
    deleteCategory,
    addEntity,
    updateEntity,
    deleteEntity,
    addAIRule,
    updateAIRule,
    deleteAIRule,
    refreshData,
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};
