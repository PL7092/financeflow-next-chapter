import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, MessageCircle, Send } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { toast } from '@/hooks/use-toast';

interface FinancialPattern {
  type: 'spending_trend' | 'budget_alert' | 'savings_opportunity' | 'irregular_transaction' | 'recurring_change';
  title: string;
  description: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

export function AIAdvisor() {
  const { transactions, budgets, accounts, assets, recurringTransactions } = useFinance();
  const [userMessage, setUserMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', message: string}>>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Simplified pattern analysis
  const patterns = useMemo<FinancialPattern[]>(() => {
    const results: FinancialPattern[] = [];

    // Budget analysis
    budgets.forEach(budget => {
      const spent = transactions
        .filter(t => 
          t.type === 'expense' &&
          t.categoryId === budget.categoryId &&
          new Date(t.date) >= new Date(budget.startDate) &&
          new Date(t.date) <= new Date(budget.endDate)
        )
        .reduce((sum, t) => sum + t.amount, 0);

      if (spent > budget.amount * 0.8) {
        results.push({
          type: 'budget_alert',
          title: 'Orçamento Próximo do Limite',
          description: `Você gastou €${spent.toFixed(2)} de €${budget.amount.toFixed(2)} em ${budget.category_name || budget.name}`,
          confidence: 0.9,
          priority: 'high',
          actionable: true,
        });
      }

      if (spent > budget.amount) {
        results.push({
          type: 'budget_alert',
          title: 'Orçamento Excedido',
          description: `Você excedeu o orçamento de ${budget.category_name || budget.name} em €${(spent - budget.amount).toFixed(2)}`,
          confidence: 1.0,
          priority: 'high',
          actionable: true,
        });
      }
    });

    // Spending trend analysis
    const recentTransactions = transactions
      .filter(t => t.type === 'expense')
      .slice(0, 30);

    if (recentTransactions.length > 0) {
      const totalSpent = recentTransactions.reduce((sum, t) => sum + t.amount, 0);
      const avgDaily = totalSpent / 30;
      
      results.push({
        type: 'spending_trend',
        title: 'Análise de Gastos',
        description: `Média diária de gastos: €${avgDaily.toFixed(2)}`,
        confidence: 0.7,
        priority: 'medium',
        actionable: false,
      });
    }

    // Savings opportunity
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    if (totalBalance > 1000) {
      results.push({
        type: 'savings_opportunity',
        title: 'Oportunidade de Poupança',
        description: `Com saldo de €${totalBalance.toFixed(2)}, considere investir parte em poupanças`,
        confidence: 0.6,
        priority: 'medium',
        actionable: true,
      });
    }

    return results;
  }, [transactions, budgets, accounts]);

  const handleAIChat = async () => {
    if (!userMessage.trim()) return;

    setIsAnalyzing(true);
    const newHistory = [...chatHistory, { role: 'user' as const, message: userMessage }];
    setChatHistory(newHistory);

    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const aiResponse = generateAIResponse(userMessage, { transactions, budgets, accounts });
      
      setChatHistory(prev => [...prev, { role: 'assistant', message: aiResponse }]);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar sua mensagem",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setUserMessage('');
    }
  };

  const generateAIResponse = (message: string, data: any): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('gasto') || lowerMessage.includes('despesa')) {
      const totalExpenses = data.transactions
        .filter((t: any) => t.type === 'expense')
        .reduce((sum: number, t: any) => sum + t.amount, 0);
      return `Analisei seus gastos e você gastou €${totalExpenses.toFixed(2)} no total. Suas principais categorias de despesa são as que mais impactam seu orçamento.`;
    }
    
    if (lowerMessage.includes('orçamento')) {
      return `Você tem ${data.budgets.length} orçamentos configurados. Recomendo revisar regularmente para manter controle dos gastos.`;
    }
    
    if (lowerMessage.includes('poupança') || lowerMessage.includes('economizar')) {
      const totalBalance = data.accounts.reduce((sum: number, acc: any) => sum + acc.balance, 0);
      return `Com saldo total de €${totalBalance.toFixed(2)}, sugiro definir metas de poupança e considerar investimentos de baixo risco.`;
    }
    
    return 'Entendo sua pergunta sobre finanças. Com base nos seus dados, recomendo manter um controle regular de gastos e revisar seus orçamentos mensalmente.';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (type: string) => {
    switch (type) {
      case 'budget_alert': return <AlertTriangle className="h-4 w-4" />;
      case 'savings_opportunity': return <TrendingUp className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Assistente Financeiro IA</h1>
          <p className="text-muted-foreground">Análises inteligentes e recomendações personalizadas</p>
        </div>
      </div>

      {/* AI Analysis Results */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Análises Automáticas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {patterns.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Adicione mais dados para receber análises personalizadas
                </p>
              </div>
            ) : (
              patterns.map((pattern, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getPriorityColor(pattern.priority)}`}
                >
                  <div className="flex items-start gap-3">
                    {getPriorityIcon(pattern.type)}
                    <div className="flex-1">
                      <h4 className="font-medium">{pattern.title}</h4>
                      <p className="text-sm mt-1">{pattern.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {Math.round(pattern.confidence * 100)}% confiança
                        </Badge>
                        <Badge variant={pattern.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                          {pattern.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* AI Chat */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Chat Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-64 overflow-y-auto space-y-3 p-3 bg-muted/30 rounded-lg">
              {chatHistory.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>Faça uma pergunta sobre suas finanças</p>
                </div>
              ) : (
                chatHistory.map((chat, index) => (
                  <div
                    key={index}
                    className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        chat.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background border'
                      }`}
                    >
                      <p className="text-sm">{chat.message}</p>
                    </div>
                  </div>
                ))
              )}
              {isAnalyzing && (
                <div className="flex justify-start">
                  <div className="bg-background border p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-primary border-t-transparent" />
                      <span className="text-sm text-muted-foreground">Analisando...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Pergunte sobre seus gastos, orçamentos..."
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAIChat()}
                disabled={isAnalyzing}
              />
              <Button onClick={handleAIChat} disabled={isAnalyzing || !userMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}