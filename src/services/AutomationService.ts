import { Transaction, SavingsGoal, RecurringTransaction, Category, Entity } from '../contexts/FinanceContext';

export class AutomationService {
  private static instance: AutomationService;
  
  static getInstance(): AutomationService {
    if (!AutomationService.instance) {
      AutomationService.instance = new AutomationService();
    }
    return AutomationService.instance;
  }

  // Auto-savings processing
  async processAutoSavings(
    transactions: Transaction[], 
    savingsGoals: SavingsGoal[]
  ): Promise<Transaction[]> {
    const autoContributions: Transaction[] = [];
    
    for (const goal of savingsGoals) {
      if (!goal.autoContributions?.enabled) continue;
      
      const conditions = goal.autoContributions.conditions || [];
      
      for (const condition of conditions) {
        switch (condition.type) {
          case 'transaction_match':
            if (condition.pattern) {
              const matchingTransactions = transactions.filter(t => 
                t.description.toLowerCase().includes(condition.pattern!.toLowerCase()) ||
                t.category.toLowerCase().includes(condition.pattern!.toLowerCase())
              );
              
              for (const transaction of matchingTransactions) {
                const contributionAmount = (condition.percentage || 10) / 100 * transaction.amount;
                if (contributionAmount > 0) {
                  autoContributions.push({
                    id: `auto_${Date.now()}_${Math.random()}`,
                    type: 'transfer',
                    amount: contributionAmount,
                    description: `Auto-contribuição para ${goal.name} (${condition.pattern})`,
                    category: 'Poupança',
                    account: goal.autoContributions.accountId || 'Poupanças',
                    date: new Date().toISOString().split('T')[0],
                    tags: ['auto-savings', goal.id],
                    created_at: new Date().toISOString()
                  });
                }
              }
            }
            break;
            
          case 'surplus_detection':
            const monthlyIncome = transactions
              .filter(t => t.type === 'income' && this.isCurrentMonth(t.date))
              .reduce((sum, t) => sum + t.amount, 0);
            const monthlyExpenses = transactions
              .filter(t => t.type === 'expense' && this.isCurrentMonth(t.date))
              .reduce((sum, t) => sum + t.amount, 0);
            const surplus = monthlyIncome - monthlyExpenses;
            
            if (surplus > 0) {
              const contributionAmount = (condition.percentage || 20) / 100 * surplus;
              autoContributions.push({
                id: `auto_surplus_${Date.now()}`,
                type: 'transfer',
                amount: contributionAmount,
                description: `Auto-contribuição para ${goal.name} (excedente detectado)`,
                category: 'Poupança',
                account: goal.autoContributions.accountId || 'Poupanças',
                date: new Date().toISOString().split('T')[0],
                tags: ['auto-savings', 'surplus', goal.id],
                created_at: new Date().toISOString()
              });
            }
            break;
            
          case 'scheduled':
            if (goal.autoContributions.amount && goal.autoContributions.frequency) {
              const shouldContribute = this.shouldMakeScheduledContribution(
                goal.autoContributions.frequency,
                transactions.filter(t => t.tags?.includes(goal.id))
              );
              
              if (shouldContribute) {
                autoContributions.push({
                  id: `auto_scheduled_${Date.now()}`,
                  type: 'transfer',
                  amount: goal.autoContributions.amount,
                  description: `Contribuição automática para ${goal.name}`,
                  category: 'Poupança',
                  account: goal.autoContributions.accountId || 'Poupanças',
                  date: new Date().toISOString().split('T')[0],
                  tags: ['auto-savings', 'scheduled', goal.id],
                  created_at: new Date().toISOString()
                });
              }
            }
            break;
        }
      }
    }
    
    return autoContributions;
  }

  // Recurring transaction processing
  async processRecurringTransactions(
    recurringTransactions: RecurringTransaction[]
  ): Promise<{ transactions: Transaction[], alerts: string[] }> {
    const newTransactions: Transaction[] = [];
    const alerts: string[] = [];
    
    for (const recurring of recurringTransactions) {
      if (!recurring.isActive) continue;
      
      const shouldProcess = this.shouldProcessRecurring(recurring);
      if (!shouldProcess) continue;
      
      // Check for variations if enabled
      if (recurring.alertOnVariation && recurring.expectedAmount) {
        const variation = Math.abs(recurring.amount - recurring.expectedAmount) / recurring.expectedAmount;
        if (variation > (recurring.tolerancePercentage || 10) / 100) {
          alerts.push(
            `Variação detectada em "${recurring.description}": ` +
            `esperado €${recurring.expectedAmount.toFixed(2)}, ` +
            `processado €${recurring.amount.toFixed(2)} ` +
            `(${(variation * 100).toFixed(1)}% de diferença)`
          );
        }
      }
      
      // Create the recurring transaction
      newTransactions.push({
        id: `recurring_${Date.now()}_${recurring.id}`,
        type: recurring.type,
        amount: recurring.amount,
        description: recurring.description,
        category: recurring.category,
        account: recurring.account,
        date: new Date().toISOString().split('T')[0],
        tags: ['recurring', recurring.id],
        recurringId: recurring.id,
        created_at: new Date().toISOString()
      });
      
      // Update recurring transaction's next date
      // This would be handled by the calling component
    }
    
    return { transactions: newTransactions, alerts };
  }

  // AI rule application for categorization
  async applyAIRules(
    transaction: Omit<Transaction, 'category'>,
    categories: Category[],
    entities: Entity[]
  ): Promise<{ category: string, entity?: string, confidence: number }> {
    const description = transaction.description.toLowerCase();
    
    // Entity matching
    let bestEntity = '';
    let bestEntityScore = 0;
    
    for (const entity of entities) {
      if (!entity.isActive) continue;
      
      // Check main name
      if (description.includes(entity.name.toLowerCase())) {
        bestEntity = entity.name;
        bestEntityScore = 0.9;
      }
      
      // Check aliases
      if (entity.aliases) {
        for (const alias of entity.aliases) {
          if (description.includes(alias.toLowerCase())) {
            bestEntity = entity.name;
            bestEntityScore = Math.max(bestEntityScore, 0.8);
          }
        }
      }
      
      // Check transaction patterns
      if (entity.transactionPatterns) {
        for (const pattern of entity.transactionPatterns) {
          const regex = new RegExp(pattern.pattern, 'i');
          if (regex.test(description)) {
            if (pattern.confidence > bestEntityScore) {
              bestEntity = entity.name;
              bestEntityScore = pattern.confidence;
            }
          }
        }
      }
    }
    
    // Category matching
    let bestCategory = 'Outros';
    let bestCategoryScore = 0;
    
    for (const category of categories) {
      if (!category.isActive || category.type !== transaction.type) continue;
      
      // Check keywords using keywords array
      if (category.keywords && category.keywords.length > 0) {
        for (const keyword of category.keywords) {
          if (description.includes(keyword.toLowerCase()) || 
              (transaction.entity && transaction.entity.toLowerCase().includes(keyword.toLowerCase()))) {
            bestCategory = category.name;
            bestCategoryScore = Math.max(bestCategoryScore, 0.7);
          }
        }
      }
      
      // Entity-based category suggestion
      if (bestEntity) {
        const entityData = entities.find(e => e.name === bestEntity);
        if (entityData?.defaultCategory === category.name) {
          bestCategory = category.name;
          bestCategoryScore = Math.max(bestCategoryScore, 0.8);
        }
      }
    }
    
    const confidence = Math.max(bestEntityScore, bestCategoryScore);
    
    return {
      category: bestCategory,
      entity: bestEntity || undefined,
      confidence
    };
  }

  // Helper methods
  private isCurrentMonth(date: string): boolean {
    const transactionDate = new Date(date);
    const now = new Date();
    return transactionDate.getMonth() === now.getMonth() && 
           transactionDate.getFullYear() === now.getFullYear();
  }

  private shouldMakeScheduledContribution(
    frequency: 'weekly' | 'monthly',
    previousContributions: Transaction[]
  ): boolean {
    const now = new Date();
    const lastContribution = previousContributions
      .filter(t => t.tags?.includes('scheduled'))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    if (!lastContribution) return true;
    
    const lastDate = new Date(lastContribution.date);
    const daysDiff = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
    
    switch (frequency) {
      case 'weekly':
        return daysDiff >= 7;
      case 'monthly':
        return daysDiff >= 30;
      default:
        return false;
    }
  }

  private shouldProcessRecurring(recurring: RecurringTransaction): boolean {
    const now = new Date();
    const nextDate = new Date(recurring.nextDate);
    return now >= nextDate;
  }

  private evaluateRule(condition: string, transaction: Omit<Transaction, 'category'>): boolean {
    // Simple rule evaluation - in production this would be more sophisticated
    const description = transaction.description.toLowerCase();
    
    // Parse conditions like "description contains 'netflix'"
    if (condition.includes('description contains')) {
      const match = condition.match(/description contains ['"](.*?)['"]]/);
      if (match) {
        return description.includes(match[1].toLowerCase());
      }
    }
    
    // Parse conditions like "amount > 100"
    if (condition.includes('amount >')) {
      const match = condition.match(/amount > (\d+)/);
      if (match) {
        return transaction.amount > parseFloat(match[1]);
      }
    }
    
    if (condition.includes('amount <')) {
      const match = condition.match(/amount < (\d+)/);
      if (match) {
        return transaction.amount < parseFloat(match[1]);
      }
    }
    
    return false;
  }
}