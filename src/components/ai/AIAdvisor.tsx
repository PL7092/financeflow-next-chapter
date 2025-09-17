import React, { useState } from 'react';
import { Brain, MessageCircle, TrendingUp, AlertTriangle, Lightbulb, Send, Loader2, Target } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';

interface AIAdvice {
  id: string;
  type: 'suggestion' | 'warning' | 'insight';
  title: string;
  message: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
}

export const AIAdvisor: React.FC = () => {
  const { transactions, budgets, accounts, investments, savingsGoals } = useFinance();
  const [userMessage, setUserMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ type: 'user' | 'ai', message: string, timestamp: string }>>([]);

  // Generate AI insights based on financial data
  const generateInsights = (): AIAdvice[] => {
    const insights: AIAdvice[] = [];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Budget Analysis
    const currentBudgets = budgets.filter(b => b.month === currentMonth && b.year === currentYear);
    currentBudgets.forEach(budget => {
      const spent = transactions
        .filter(t => 
          t.type === 'expense' && 
          t.category === budget.category &&
          new Date(t.date).getMonth() === currentMonth &&
          new Date(t.date).getFullYear() === currentYear
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const percentage = (spent / budget.limit) * 100;

      if (percentage > 90) {
        insights.push({
          id: `budget-${budget.id}`,
          type: 'warning',
          title: 'Orçamento Quase Excedido',
          message: `Você já gastou ${percentage.toFixed(1)}% do orçamento de ${budget.category}. Considere reduzir gastos nesta categoria.`,
          category: 'Orçamento',
          priority: 'high',
          timestamp: new Date().toISOString()
        });
      } else if (percentage > 70) {
        insights.push({
          id: `budget-warn-${budget.id}`,
          type: 'suggestion',
          title: 'Atenção ao Orçamento',
          message: `Você gastou ${percentage.toFixed(1)}% do orçamento de ${budget.category}. Monitore os próximos gastos.`,
          category: 'Orçamento',
          priority: 'medium',
          timestamp: new Date().toISOString()
        });
      }
    });

    // Spending Pattern Analysis
    const recentTransactions = transactions
      .filter(t => {
        const transDate = new Date(t.date);
        const thirtyDaysAgo = new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000));
        return transDate >= thirtyDaysAgo && t.type === 'expense';
      });

    const categoryTotals = recentTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)[0];

    if (topCategory && topCategory[1] > 500) {
      insights.push({
        id: 'spending-pattern',
        type: 'insight',
        title: 'Padrão de Gastos Identificado',
        message: `Sua maior despesa dos últimos 30 dias foi em ${topCategory[0]} (€${topCategory[1].toFixed(2)}). Considere se há oportunidades de otimização.`,
        category: 'Gastos',
        priority: 'medium',
        timestamp: new Date().toISOString()
      });
    }

    // Investment Performance
    const totalInvestmentReturn = investments.reduce((sum, inv) => sum + (inv.return || 0), 0);
    if (investments.length > 0 && totalInvestmentReturn < 0) {
      insights.push({
        id: 'investment-performance',
        type: 'warning',
        title: 'Performance dos Investimentos',
        message: `Seus investimentos estão com retorno negativo de €${Math.abs(totalInvestmentReturn).toFixed(2)}. Considere revisar sua estratégia.`,
        category: 'Investimentos',
        priority: 'high',
        timestamp: new Date().toISOString()
      });
    }

    // Savings Goals Progress
    savingsGoals.forEach(goal => {
      const progress = (goal.currentAmount / goal.targetAmount) * 100;
      const daysRemaining = Math.ceil((new Date(goal.targetDate).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysRemaining > 0 && daysRemaining < 30 && progress < 80) {
        insights.push({
          id: `savings-${goal.id}`,
          type: 'warning',
          title: 'Meta de Poupança em Risco',
          message: `A meta "${goal.name}" tem apenas ${daysRemaining} dias restantes e você está com ${progress.toFixed(1)}% de progresso.`,
          category: 'Poupanças',
          priority: 'high',
          timestamp: new Date().toISOString()
        });
      }
    });

    // Account Balance Warnings
    accounts.forEach(account => {
      if (account.balance < 100 && account.type !== 'credit') {
        insights.push({
          id: `balance-${account.id}`,
          type: 'warning',
          title: 'Saldo Baixo',
          message: `A conta ${account.name} tem saldo baixo (€${account.balance.toFixed(2)}). Considere transferir fundos.`,
          category: 'Contas',
          priority: 'medium',
          timestamp: new Date().toISOString()
        });
      }
    });

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const insights = generateInsights();

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;

    setIsLoading(true);
    const userMsg = userMessage;
    setUserMessage('');

    // Add user message to chat
    setChatHistory(prev => [...prev, {
      type: 'user',
      message: userMsg,
      timestamp: new Date().toISOString()
    }]);

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMsg);
      setChatHistory(prev => [...prev, {
        type: 'ai',
        message: aiResponse,
        timestamp: new Date().toISOString()
      }]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('orçamento') || lowerMessage.includes('budget')) {
      return 'Com base nos seus dados, recomendo definir orçamentos mensais para cada categoria de gastos. Você pode começar analisando os gastos dos últimos 3 meses para estabelecer limites realistas.';
    }

    if (lowerMessage.includes('investimento') || lowerMessage.includes('invest')) {
      const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
      return `Você tem €${totalInvested.toFixed(2)} investidos atualmente. Para otimizar seus investimentos, considere diversificar entre diferentes tipos de ativos e revisar a performance regularmente.`;
    }

    if (lowerMessage.includes('poupança') || lowerMessage.includes('poupar')) {
      const monthlyExpenses = transactions
        .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth())
        .reduce((sum, t) => sum + t.amount, 0);
      
      return `Com base nos seus gastos mensais atuais de €${monthlyExpenses.toFixed(2)}, recomendo poupar pelo menos 20% da sua receita mensal. Considere automatizar suas poupanças.`;
    }

    if (lowerMessage.includes('dívida') || lowerMessage.includes('debt')) {
      return 'Para gestão de dívidas, priorize primeiro as dívidas com juros mais altos. Considere consolidar dívidas se possível e evite criar novas dívidas desnecessárias.';
    }

    return 'Obrigado pela sua pergunta! Para dar conselhos mais específicos, preciso analisar mais dados. Pode partilhar mais detalhes sobre sua situação financeira ou objetivos específicos?';
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'suggestion': return Lightbulb;
      case 'insight': return TrendingUp;
      default: return Brain;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50 dark:bg-red-950';
      case 'medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950';
      case 'low': return 'border-blue-500 bg-blue-50 dark:bg-blue-950';
      default: return 'border-gray-500 bg-gray-50 dark:bg-gray-950';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            Conselheiro IA
          </h1>
          <p className="text-muted-foreground">Análises inteligentes e conselhos personalizados</p>
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Insights Panel */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Insights e Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium mb-2">Tudo parece estar bem!</h3>
                  <p className="text-sm">Não há alertas ou sugestões urgentes no momento.</p>
                </div>
              ) : (
                insights.slice(0, 6).map((insight) => {
                  const Icon = getInsightIcon(insight.type);
                  return (
                    <Alert key={insight.id} className={getPriorityColor(insight.priority)}>
                      <Icon className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm mb-1">{insight.title}</div>
                            <div className="text-sm">{insight.message}</div>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {insight.category}
                          </Badge>
                        </div>
                      </AlertDescription>
                    </Alert>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Chat com IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Chat History */}
              <div className="h-64 overflow-y-auto space-y-3 p-3 bg-background/50 rounded-lg">
                {chatHistory.length === 0 ? (
                  <div className="text-center text-muted-foreground">
                    <p>Olá! Sou o seu conselheiro financeiro IA.</p>
                    <p className="text-sm mt-2">Pergunte-me sobre orçamentos, investimentos, poupanças ou qualquer dúvida financeira!</p>
                  </div>
                ) : (
                  chatHistory.map((chat, index) => (
                    <div key={index} className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        chat.type === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <p className="text-sm">{chat.message}</p>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-muted-foreground p-3 rounded-lg flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">A pensar...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <Textarea
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Faça uma pergunta sobre suas finanças..."
                  className="resize-none"
                  rows={2}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!userMessage.trim() || isLoading}
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle>Ações Recomendadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Target className="h-6 w-6 text-primary" />
              <span className="font-medium">Revisar Orçamentos</span>
              <span className="text-xs text-muted-foreground">Ajustar limites mensais</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span className="font-medium">Analisar Investimentos</span>
              <span className="text-xs text-muted-foreground">Revisar performance</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <AlertTriangle className="h-6 w-6 text-primary" />
              <span className="font-medium">Verificar Alertas</span>
              <span className="text-xs text-muted-foreground">Resolver pendências</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <span className="font-medium">Plano Financeiro</span>
              <span className="text-xs text-muted-foreground">Criar estratégia</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};