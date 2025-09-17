import React, { useState, useMemo } from 'react';
import { 
  Brain, MessageCircle, TrendingUp, AlertTriangle, Lightbulb, Send, Loader2, 
  Target, Zap, BarChart3, PieChart, DollarSign, Calendar, Repeat, 
  Car, Home, PiggyBank, CreditCard
} from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { useToast } from '@/hooks/use-toast';

interface AIAdvice {
  id: string;
  type: 'suggestion' | 'warning' | 'insight' | 'opportunity';
  title: string;
  message: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  actionable?: boolean;
  potentialSaving?: number;
  confidence: number;
}

interface FinancialPattern {
  id: string;
  type: 'spending' | 'income' | 'saving' | 'investment';
  pattern: string;
  frequency: number;
  avgAmount: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
}

interface SmartRecommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'budget' | 'savings' | 'investment' | 'debt' | 'optimization';
  potentialSaving: number;
  timeframe: string;
  steps: string[];
}

export const AIAdvisor: React.FC = () => {
  const { 
    transactions, budgets, accounts, investments, savingsGoals, 
    recurringTransactions, assets, categories 
  } = useFinance();
  const { toast } = useToast();
  
  const [userMessage, setUserMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ 
    type: 'user' | 'ai', 
    message: string, 
    timestamp: string 
  }>>([]);

  // Advanced Pattern Recognition
  const detectFinancialPatterns = (): FinancialPattern[] => {
    const patterns: FinancialPattern[] = [];
    
    // Analyze spending patterns by category
    const categorySpending = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const key = t.category;
        if (!acc[key]) acc[key] = [];
        acc[key].push({ amount: t.amount, date: t.date });
        return acc;
      }, {} as Record<string, Array<{ amount: number, date: string }>>);

    Object.entries(categorySpending).forEach(([category, transactions]) => {
      if (transactions.length < 3) return;

      const amounts = transactions.map(t => t.amount);
      const avgAmount = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
      const variance = amounts.reduce((sum, a) => sum + Math.pow(a - avgAmount, 2), 0) / amounts.length;
      const stdDev = Math.sqrt(variance);
      const consistency = 1 - (stdDev / avgAmount); // 0-1 score

      // Detect trend
      const recent = transactions.slice(-5).map(t => t.amount);
      const older = transactions.slice(0, -5).map(t => t.amount);
      const recentAvg = recent.reduce((sum, a) => sum + a, 0) / recent.length;
      const olderAvg = older.length > 0 ? older.reduce((sum, a) => sum + a, 0) / older.length : recentAvg;
      
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      const change = (recentAvg - olderAvg) / olderAvg;
      if (change > 0.1) trend = 'increasing';
      else if (change < -0.1) trend = 'decreasing';

      patterns.push({
        id: `spending-${category}`,
        type: 'spending',
        pattern: `Gastos regulares em ${category}`,
        frequency: transactions.length,
        avgAmount,
        trend,
        confidence: Math.min(consistency * 100, 95)
      });
    });

    // Detect recurring income patterns
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const incomeByDescription = incomeTransactions.reduce((acc, t) => {
      const key = t.description.toLowerCase();
      if (!acc[key]) acc[key] = [];
      acc[key].push(t);
      return acc;
    }, {} as Record<string, typeof incomeTransactions>);

    Object.entries(incomeByDescription).forEach(([description, transactions]) => {
      if (transactions.length >= 2) {
        const avgAmount = transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length;
        patterns.push({
          id: `income-${description}`,
          type: 'income',
          pattern: `Receita recorrente: ${description}`,
          frequency: transactions.length,
          avgAmount,
          trend: 'stable',
          confidence: Math.min(transactions.length * 20, 90)
        });
      }
    });

    return patterns.filter(p => p.confidence > 60);
  };

  // Enhanced AI Insights Generation
  const generateAdvancedInsights = (): AIAdvice[] => {
    const insights: AIAdvice[] = [];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const patterns = detectFinancialPatterns();

    // 1. Budget Analysis with AI
    budgets.forEach(budget => {
      const spent = transactions
        .filter(t => 
          t.type === 'expense' && 
          t.category === budget.category &&
          new Date(t.date).getMonth() === currentMonth &&
          new Date(t.date).getFullYear() === currentYear
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const percentage = (spent / budget.limit) * 100;
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const dayOfMonth = currentDate.getDate();
      const expectedSpent = (budget.limit / daysInMonth) * dayOfMonth;
      const spendingRate = spent / expectedSpent;

      if (percentage > 90) {
        insights.push({
          id: `budget-warning-${budget.id}`,
          type: 'warning',
          title: `Orçamento de ${budget.category} quase esgotado`,
          message: `Gastou ${percentage.toFixed(1)}% do orçamento mensal. Considere reduzir gastos nesta categoria.`,
          category: 'budget',
          priority: 'high',
          timestamp: new Date().toISOString(),
          actionable: true,
          confidence: 95
        });
      } else if (spendingRate > 1.3 && percentage < 50) {
        insights.push({
          id: `budget-pace-${budget.id}`,
          type: 'warning',
          title: `Ritmo de gastos elevado em ${budget.category}`,
          message: `Está a gastar ${(spendingRate * 100).toFixed(0)}% mais rápido que o esperado. Projeta-se €${(spent * (daysInMonth / dayOfMonth)).toFixed(2)} para o mês.`,
          category: 'budget',
          priority: 'medium',
          timestamp: new Date().toISOString(),
          actionable: true,
          confidence: 85
        });
      }
    });

    // 2. Savings Goal Intelligence
    savingsGoals.forEach(goal => {
      const daysToGoal = Math.ceil((new Date(goal.targetDate).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      const remaining = goal.targetAmount - goal.currentAmount;
      const dailyNeeded = remaining / Math.max(daysToGoal, 1);

      if (daysToGoal > 0 && remaining > 0) {
        // Check if goal is achievable
        const monthlyIncome = transactions
          .filter(t => t.type === 'income' && new Date(t.date).getMonth() === currentMonth)
          .reduce((sum, t) => sum + t.amount, 0);
        
        const monthlyExpenses = transactions
          .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === currentMonth)
          .reduce((sum, t) => sum + t.amount, 0);

        const monthlySurplus = monthlyIncome - monthlyExpenses;
        const monthsToGoal = daysToGoal / 30;
        const monthlyNeeded = remaining / monthsToGoal;

        if (monthlyNeeded > monthlySurplus * 0.8) {
          insights.push({
            id: `savings-difficult-${goal.id}`,
            type: 'warning',
            title: `Meta "${goal.name}" pode ser difícil de alcançar`,
            message: `Precisa de €${dailyNeeded.toFixed(2)}/dia. Considere ajustar a data ou valor da meta.`,
            category: 'savings',
            priority: 'medium',
            timestamp: new Date().toISOString(),
            actionable: true,
            confidence: 80
          });
        } else if (dailyNeeded < monthlySurplus / 30 * 0.3) {
          insights.push({
            id: `savings-easy-${goal.id}`,
            type: 'opportunity',
            title: `Meta "${goal.name}" pode ser alcançada mais cedo`,
            message: `Com o seu excedente atual, pode alcançar esta meta ${Math.floor((monthsToGoal * 0.7) * 30)} dias mais cedo.`,
            category: 'savings',
            priority: 'low',
            timestamp: new Date().toISOString(),
            actionable: true,
            confidence: 75
          });
        }
      }
    });

    // 3. Asset Optimization
    assets.forEach(asset => {
      const totalCosts = asset.maintenanceCosts?.reduce((sum, cost) => sum + cost.amount, 0) || 0;
      const purchasePrice = asset.purchasePrice || asset.value;
      const costRatio = totalCosts / purchasePrice;
      
      if (costRatio > 0.3 && totalCosts > 1000) {
        insights.push({
          id: `asset-costly-${asset.id}`,
          type: 'warning',
          title: `Ativo "${asset.name}" com custos elevados`,
          message: `Os custos de manutenção representam ${(costRatio * 100).toFixed(1)}% do valor. Considere avaliar alternativas.`,
          category: 'assets',
          priority: 'medium',
          timestamp: new Date().toISOString(),
          actionable: true,
          confidence: 85
        });
      }
    });

    // 4. Pattern-Based Recommendations
    patterns.forEach(pattern => {
      if (pattern.type === 'spending' && pattern.trend === 'increasing' && pattern.confidence > 80) {
        const potentialSaving = pattern.avgAmount * 0.15; // 15% reduction potential
        insights.push({
          id: `pattern-${pattern.id}`,
          type: 'suggestion',
          title: `Padrão de gasto crescente detectado`,
          message: `${pattern.pattern} tem aumentado. Considere estratégias de redução.`,
          category: 'optimization',
          priority: 'medium',
          timestamp: new Date().toISOString(),
          actionable: true,
          potentialSaving,
          confidence: pattern.confidence
        });
      }
    });

    // 5. Recurring Transactions Analysis
    recurringTransactions
      .filter(rt => rt.isActive && rt.variationHistory && rt.variationHistory.length > 2)
      .forEach(rt => {
        const recentVariations = rt.variationHistory!.slice(-3);
        const avgVariance = recentVariations.reduce((sum, v) => sum + Math.abs(v.variance), 0) / recentVariations.length;
        
        if (avgVariance > (rt.expectedAmount || rt.amount) * 0.1) {
          insights.push({
            id: `recurring-variance-${rt.id}`,
            type: 'insight',
            title: `Variação detectada em "${rt.description}"`,
            message: `Esta transação tem variado €${avgVariance.toFixed(2)} em média nos últimos períodos.`,
            category: 'recurring',
            priority: 'low',
            timestamp: new Date().toISOString(),
            actionable: false,
            confidence: 70
          });
        }
      });

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  // Smart Recommendations Generation
  const generateSmartRecommendations = (): SmartRecommendation[] => {
    const recommendations: SmartRecommendation[] = [];
    
    // Calculate financial health metrics
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) : 0;
    
    // Emergency Fund Recommendation
    const monthlyExpenses = totalExpenses / Math.max(transactions.length / 30, 1);
    const totalAccountBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const emergencyMonths = totalAccountBalance / monthlyExpenses;
    
    if (emergencyMonths < 3) {
      recommendations.push({
        id: 'emergency-fund',
        title: 'Criar Fundo de Emergência',
        description: `Tem apenas ${emergencyMonths.toFixed(1)} meses de despesas em reserva. Recomenda-se 3-6 meses.`,
        impact: 'high',
        difficulty: 'medium',
        category: 'savings',
        potentialSaving: 0,
        timeframe: '6-12 meses',
        steps: [
          'Defina uma meta de 3 meses de despesas',
          'Configure transferência automática mensal',
          'Mantenha numa conta poupança separada',
          'Aumente gradualmente para 6 meses'
        ]
      });
    }

    // Debt Optimization
    const debtAccounts = accounts.filter(acc => acc.balance < 0);
    if (debtAccounts.length > 0) {
      const totalDebt = debtAccounts.reduce((sum, acc) => sum + Math.abs(acc.balance), 0);
      recommendations.push({
        id: 'debt-optimization',
        title: 'Estratégia de Pagamento de Dívidas',
        description: `Tem €${totalDebt.toFixed(2)} em dívidas. Uma estratégia estruturada pode poupar juros.`,
        impact: 'high',
        difficulty: 'easy',
        category: 'debt',
        potentialSaving: totalDebt * 0.1, // Estimate 10% savings in interest
        timeframe: '1-2 anos',
        steps: [
          'Liste todas as dívidas por taxa de juro',
          'Pague o mínimo em todas, extra na maior taxa',
          'Considere consolidação se aplicável',
          'Evite contrair novas dívidas'
        ]
      });
    }

    // Investment Opportunities
    if (savingsRate > 0.2 && totalAccountBalance > monthlyExpenses * 6) {
      recommendations.push({
        id: 'investment-start',
        title: 'Iniciar Carteira de Investimentos',
        description: `Com uma boa taxa de poupança (${(savingsRate * 100).toFixed(1)}%), considere investir o excesso.`,
        impact: 'medium',
        difficulty: 'medium',
        category: 'investment',
        potentialSaving: totalAccountBalance * 0.07, // 7% annual return estimate
        timeframe: 'Longo prazo',
        steps: [
          'Estude perfil de risco',
          'Defina objetivos de investimento',
          'Comece com ETFs diversificados',
          'Invista regularmente (DCA)'
        ]
      });
    }

    // Budget Optimization
    const categoryExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const highestCategory = Object.entries(categoryExpenses)
      .sort(([,a], [,b]) => b - a)[0];

    if (highestCategory && highestCategory[1] > totalExpenses * 0.3) {
      recommendations.push({
        id: 'budget-category-optimization',
        title: `Otimizar Gastos em ${highestCategory[0]}`,
        description: `${highestCategory[0]} representa ${((highestCategory[1] / totalExpenses) * 100).toFixed(1)}% dos seus gastos.`,
        impact: 'medium',
        difficulty: 'easy',
        category: 'budget',
        potentialSaving: highestCategory[1] * 0.15,
        timeframe: '1-3 meses',
        steps: [
          'Analise gastos detalhadamente nesta categoria',
          'Identifique despesas desnecessárias',
          'Defina um orçamento mais restritivo',
          'Monitorize semanalmente'
        ]
      });
    }

    return recommendations.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    });
  };

  // Mock AI Chat Function
  const handleAIChat = async () => {
    if (!userMessage.trim()) return;

    setIsLoading(true);
    
    // Add user message
    const newUserMessage = {
      type: 'user' as const,
      message: userMessage,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => [...prev, newUserMessage]);

    // Simulate AI processing
    setTimeout(() => {
      let aiResponse = '';
      
      // Simple keyword-based responses
      if (userMessage.toLowerCase().includes('orçamento')) {
        aiResponse = 'Com base na sua análise de orçamento, recomendo focar em categorias onde há maior variação de gastos. Posso ajudar a criar alertas automáticos.';
      } else if (userMessage.toLowerCase().includes('poupança') || userMessage.toLowerCase().includes('poupar')) {
        aiResponse = 'Para otimizar as suas poupanças, sugiro automatizar transferências mensais e considerar metas específicas com datas definidas.';
      } else if (userMessage.toLowerCase().includes('investimento')) {
        aiResponse = 'Antes de investir, certifique-se de ter um fundo de emergência. Para iniciantes, recomendo ETFs diversificados com contribuições mensais.';
      } else {
        aiResponse = 'Entendo a sua questão. Com base nos seus dados financeiros, posso oferecer análises personalizadas. Que aspeto específico gostaria de explorar?';
      }

      const aiMessage = {
        type: 'ai' as const,
        message: aiResponse,
        timestamp: new Date().toISOString()
      };

      setChatHistory(prev => [...prev, aiMessage]);
      setUserMessage('');
      setIsLoading(false);
    }, 1500);
  };

  const insights = useMemo(() => generateAdvancedInsights(), [
    transactions, budgets, savingsGoals, assets, recurringTransactions
  ]);
  
  const patterns = useMemo(() => detectFinancialPatterns(), [transactions]);
  const recommendations = useMemo(() => generateSmartRecommendations(), [
    transactions, accounts, budgets, savingsGoals
  ]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'suggestion': return Lightbulb;
      case 'opportunity': return Target;
      case 'insight': return Brain;
      default: return Brain;
    }
  };

  const getInsightColor = (type: string, priority: string) => {
    if (type === 'warning') return 'text-red-600 bg-red-50 border-red-200';
    if (type === 'opportunity') return 'text-green-600 bg-green-50 border-green-200';
    if (priority === 'high') return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            Assistente IA Financeiro
          </h1>
          <p className="text-muted-foreground">
            Análise inteligente dos seus dados financeiros com recomendações personalizadas
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Alertas</p>
                <p className="text-2xl font-bold">{insights.filter(i => i.type === 'warning').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Lightbulb className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sugestões</p>
                <p className="text-2xl font-bold">{insights.filter(i => i.type === 'suggestion').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Oportunidades</p>
                <p className="text-2xl font-bold">{insights.filter(i => i.type === 'opportunity').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Padrões</p>
                <p className="text-2xl font-bold">{patterns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">Insights IA</TabsTrigger>
          <TabsTrigger value="patterns">Padrões</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
          <TabsTrigger value="chat">Chat IA</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          {insights.length === 0 ? (
            <Card className="bg-gradient-card shadow-card">
              <CardContent className="py-12 text-center">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum insight disponível</h3>
                <p className="text-muted-foreground">
                  Continue a usar a aplicação para gerar insights personalizados
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {insights.map((insight) => {
                const Icon = getInsightIcon(insight.type);
                return (
                  <Card key={insight.id} className={`border ${getInsightColor(insight.type, insight.priority)}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{insight.title}</h3>
                            <div className="flex gap-2">
                              <Badge variant={insight.priority === 'high' ? 'destructive' : 'secondary'}>
                                {insight.priority === 'high' ? 'Alta' : insight.priority === 'medium' ? 'Média' : 'Baixa'}
                              </Badge>
                              <Badge variant="outline">
                                {insight.confidence.toFixed(0)}% confiança
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm mb-3">{insight.message}</p>
                          
                          {insight.potentialSaving && (
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="text-green-600 font-medium">
                                Potencial poupança: €{insight.potentialSaving.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          {patterns.length === 0 ? (
            <Card className="bg-gradient-card shadow-card">
              <CardContent className="py-12 text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Ainda não há padrões detectados</h3>
                <p className="text-muted-foreground">
                  Adicione mais transações para detectar padrões inteligentes
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {patterns.map((pattern) => (
                <Card key={pattern.id} className="bg-gradient-card shadow-card">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{pattern.pattern}</h3>
                        <Badge variant={pattern.trend === 'increasing' ? 'destructive' : 
                                      pattern.trend === 'decreasing' ? 'default' : 'secondary'}>
                          {pattern.trend === 'increasing' ? 'Aumentando' :
                           pattern.trend === 'decreasing' ? 'Diminuindo' : 'Estável'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Frequência</p>
                          <p className="font-medium">{pattern.frequency}x</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Valor Médio</p>
                          <p className="font-medium">€{pattern.avgAmount.toFixed(2)}</p>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-muted-foreground">Confiança</span>
                          <span className="text-sm font-medium">{pattern.confidence.toFixed(0)}%</span>
                        </div>
                        <Progress value={pattern.confidence} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {recommendations.length === 0 ? (
            <Card className="bg-gradient-card shadow-card">
              <CardContent className="py-12 text-center">
                <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Sem recomendações disponíveis</h3>
                <p className="text-muted-foreground">
                  Continue a usar a aplicação para receber recomendações personalizadas
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <Card key={rec.id} className="bg-gradient-card shadow-card">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">{rec.title}</h3>
                        <div className="flex gap-2">
                          <Badge variant={rec.impact === 'high' ? 'destructive' : 
                                        rec.impact === 'medium' ? 'default' : 'secondary'}>
                            Impacto {rec.impact === 'high' ? 'Alto' : rec.impact === 'medium' ? 'Médio' : 'Baixo'}
                          </Badge>
                          <Badge variant="outline">
                            {rec.difficulty === 'easy' ? 'Fácil' : rec.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground">{rec.description}</p>
                      
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="text-sm">
                          <p className="text-muted-foreground">Categoria</p>
                          <p className="font-medium capitalize">{rec.category}</p>
                        </div>
                        <div className="text-sm">
                          <p className="text-muted-foreground">Prazo</p>
                          <p className="font-medium">{rec.timeframe}</p>
                        </div>
                        {rec.potentialSaving > 0 && (
                          <div className="text-sm">
                            <p className="text-muted-foreground">Poupança Potencial</p>
                            <p className="font-medium text-green-600">€{rec.potentialSaving.toFixed(2)}</p>
                          </div>
                        )}
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="font-medium mb-2">Passos para implementar:</h4>
                        <div className="space-y-2">
                          {rec.steps.map((step, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                                {index + 1}
                              </div>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Chat com Assistente IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Chat History */}
              <div className="h-64 overflow-y-auto border rounded-lg p-4 space-y-4">
                {chatHistory.length === 0 ? (
                  <div className="text-center text-muted-foreground">
                    <Brain className="h-8 w-8 mx-auto mb-2" />
                    <p>Faça uma pergunta sobre as suas finanças!</p>
                  </div>
                ) : (
                  chatHistory.map((msg, index) => (
                    <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.type === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    </div>
                  ))
                )}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted px-4 py-2 rounded-lg flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">A analisar...</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Input */}
              <div className="flex gap-2">
                <Textarea
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Pergunte sobre orçamentos, poupanças, investimentos..."
                  className="flex-1"
                  rows={2}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAIChat();
                    }
                  }}
                />
                <Button 
                  onClick={handleAIChat} 
                  disabled={isLoading || !userMessage.trim()}
                  size="default"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              <Alert>
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  Este é um simulador de IA. Em produção, integraria com APIs de IA reais como OpenAI ou Anthropic.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};