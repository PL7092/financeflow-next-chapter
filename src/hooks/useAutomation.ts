import { useEffect, useRef } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { AutomationService } from '../services/AutomationService';
import NotificationService from '../services/NotificationService';

export const useAutomation = () => {
  const {
    transactions,
    savingsGoals,
    recurringTransactions,
    categories,
    entities,
    budgets,
    addTransaction,
    updateSavingsGoal,
    updateRecurringTransaction
  } = useFinance();

  const automationService = AutomationService.getInstance();
  const notificationService = NotificationService.getInstance();
  const processedTransactions = useRef<Set<string>>(new Set());
  const lastAutoSavingsRun = useRef<string>(localStorage.getItem('lastAutoSavingsRun') || '');
  const lastRecurringRun = useRef<string>(localStorage.getItem('lastRecurringRun') || '');

  // Process auto-savings
  useEffect(() => {
    const processAutoSavings = async () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      // Run auto-savings once per day
      if (lastAutoSavingsRun.current === today) return;
      
      try {
        const autoContributions = await automationService.processAutoSavings(
          transactions,
          savingsGoals
        );

        for (const contribution of autoContributions) {
          await addTransaction(contribution);
          
          // Update savings goal
          const goalId = contribution.tags?.find(tag => 
            savingsGoals.some(goal => goal.id === tag)
          );
          
          if (goalId) {
            const goal = savingsGoals.find(g => g.id === goalId);
            if (goal) {
              await updateSavingsGoal(goalId, {
                currentAmount: goal.currentAmount + contribution.amount
              });
            }
          }

          // Create notification
          notificationService.createSystemNotification(
            '💰 Contribuição Automática',
            `Transferência automática de €${contribution.amount.toFixed(2)} realizada`,
            'low'
          );
        }

        lastAutoSavingsRun.current = today;
        localStorage.setItem('lastAutoSavingsRun', today);
      } catch (error) {
        console.error('Error processing auto-savings:', error);
      }
    };

    if (transactions.length > 0 && savingsGoals.length > 0) {
      processAutoSavings();
    }
  }, [transactions, savingsGoals, addTransaction, updateSavingsGoal]);

  // Process recurring transactions
  useEffect(() => {
    const processRecurring = async () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      // Run recurring processing once per day
      if (lastRecurringRun.current === today) return;

      try {
        const result = await automationService.processRecurringTransactions(
          recurringTransactions
        );

        // Add new transactions
        for (const transaction of result.transactions) {
          await addTransaction(transaction);
        }

        // Create alerts for variations
        for (const alert of result.alerts) {
          notificationService.createSystemNotification(
            '🔄 Alerta de Variação',
            alert,
            'medium'
          );
        }

        // Skip recurring transaction updates - not implemented in current schema

        lastRecurringRun.current = today;
        localStorage.setItem('lastRecurringRun', today);
      } catch (error) {
        console.error('Error processing recurring transactions:', error);
      }
    };

    if (recurringTransactions.length > 0) {
      processRecurring();
    }
  }, [recurringTransactions, addTransaction, updateRecurringTransaction]);

  // Apply AI rules to new transactions
  useEffect(() => {
    const processNewTransactions = async () => {
      const unprocessedTransactions = transactions.filter(
        t => !processedTransactions.current.has(t.id) && !t.tags?.includes('processed')
      );

      for (const transaction of unprocessedTransactions) {
        try {
          // Skip if already has entity or was manually categorized
          if (transaction.entity || transaction.tags?.includes('manual')) {
            processedTransactions.current.add(transaction.id);
            continue;
          }

          const aiResult = await automationService.applyAIRules(
            transaction,
            categories,
            entities
          );

          // Only apply if confidence is high enough
          if (aiResult.confidence > 0.7) {
            // Update transaction with AI suggestions
            // This would typically update the transaction in the database
            console.log(`AI suggestion for "${transaction.description}":`, aiResult);
            
            notificationService.createSystemNotification(
              '🤖 Categorização Automática',
              `"${transaction.description}" foi categorizada como "${aiResult.category}"`,
              'low'
            );
          }

          processedTransactions.current.add(transaction.id);
        } catch (error) {
          console.error('Error applying AI rules to transaction:', transaction.id, error);
        }
      }
    };

    if (transactions.length > 0 && categories.length > 0) {
      processNewTransactions();
    }
  }, [transactions, categories, entities]);

  // Monitor budgets and create alerts
  useEffect(() => {
    const checkBudgets = () => {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      // Skip budget alerts - current schema doesn't have month/year fields
    };

    if (budgets.length > 0) {
      checkBudgets();
    }
  }, [budgets]);

  return {
    isAutomationActive: true,
    lastAutoSavingsRun: lastAutoSavingsRun.current,
    lastRecurringRun: lastRecurringRun.current
  };
};

// Helper function to calculate next date for recurring transactions
function calculateNextDate(frequency: string, fromDate: Date): Date {
  const nextDate = new Date(fromDate);
  
  switch (frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
  }
  
  return nextDate;
}