import React, { useState, useMemo } from 'react';
import { BarChart3, Download, Calendar, PieChart, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { formatDatePT, getDateRange, getCurrentMonthRange } from '../../utils/dateUtils';

export const ReportsManager: React.FC = () => {
  const { transactions, budgets, accounts, investments, savingsGoals } = useFinance();
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');

  const getDateRangeForPeriod = (period: string) => {
    const now = new Date();
    switch (period) {
      case 'thisMonth':
        return getCurrentMonthRange();
      case 'last3Months':
        return getDateRange(3);
      case 'last6Months':
        return getDateRange(6);
      case 'thisYear':
        return {
          start: new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0],
          end: now.toISOString().split('T')[0]
        };
      default:
        return getCurrentMonthRange();
    }
  };

  const { start: dateStart, end: dateEnd } = getDateRangeForPeriod(selectedPeriod);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => 
      t.date >= dateStart && t.date <= dateEnd
    );
  }, [transactions, dateStart, dateEnd]);

  // Financial Summary
  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;
    const savings = income > 0 ? (balance / income) * 100 : 0;

    return { income, expenses, balance, savings };
  }, [filteredTransactions]);

  // Category Analysis
  const categoryBreakdown = useMemo(() => {
    const breakdown = filteredTransactions.reduce((acc, t) => {
      if (t.type === 'transfer') return acc;
      
      if (!acc[t.category]) {
        acc[t.category] = { income: 0, expense: 0, total: 0 };
      }
      
      if (t.type === 'income') {
        acc[t.category].income += t.amount;
      } else {
        acc[t.category].expense += t.amount;
      }
      
      acc[t.category].total += t.amount;
      
      return acc;
    }, {} as Record<string, { income: number; expense: number; total: number }>);

    return Object.entries(breakdown)
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [filteredTransactions]);

  // Account Balances
  const accountBalances = useMemo(() => {
    return accounts.map(account => {
      const accountTransactions = filteredTransactions.filter(t => 
        t.account === account.name
      );
      
      const movement = accountTransactions.reduce((sum, t) => {
        if (t.type === 'income') return sum + t.amount;
        if (t.type === 'expense') return sum - t.amount;
        return sum;
      }, 0);

      return {
        ...account,
        movement,
        transactionCount: accountTransactions.length
      };
    });
  }, [accounts, filteredTransactions]);

  // Investment Performance
  const investmentSummary = useMemo(() => {
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalReturn = totalCurrentValue - totalInvested;
    const totalReturnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

    return { totalInvested, totalCurrentValue, totalReturn, totalReturnPercentage };
  }, [investments]);

  // Savings Goals Progress
  const savingsProgress = useMemo(() => {
    return savingsGoals.map(goal => {
      const progress = (goal.currentAmount / goal.targetAmount) * 100;
      const remaining = goal.targetAmount - goal.currentAmount;
      const daysRemaining = Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      return {
        ...goal,
        progress,
        remaining,
        daysRemaining,
        dailyTarget: daysRemaining > 0 ? remaining / daysRemaining : 0
      };
    }).sort((a, b) => b.progress - a.progress);
  }, [savingsGoals]);

  // AI Predictive Analysis
  const predictiveAnalysis = useMemo(() => {
    const recentTransactions = filteredTransactions.slice(0, 50);
    const avgMonthlyIncome = summary.income;
    const avgMonthlyExpenses = summary.expenses;
    
    // Predict next month's budget needs
    const categoryPredictions = categoryBreakdown.map(cat => {
      const trend = cat.expense > 0 ? 'increasing' : 'stable';
      const predictedAmount = cat.expense * 1.05; // Simple 5% increase prediction
      return {
        category: cat.category,
        predicted: predictedAmount,
        trend,
        confidence: 0.75
      };
    });

    // Financial health score
    const healthScore = Math.max(0, Math.min(100, 
      (summary.savings * 2) + // Savings rate weight
      (investmentSummary.totalReturnPercentage > 0 ? 20 : 0) + // Investment performance
      (summary.balance > 0 ? 30 : 0) + // Positive balance
      (categoryBreakdown.length > 3 ? 10 : 0) // Diversified spending
    ));

    return {
      categoryPredictions,
      healthScore,
      recommendations: [
        healthScore < 50 ? 'Considere reduzir despesas em categorias não essenciais' : null,
        summary.savings < 10 ? 'Tente poupar pelo menos 10% da sua receita mensal' : null,
        investmentSummary.totalReturnPercentage < 0 ? 'Revise a sua estratégia de investimento' : null,
      ].filter(Boolean)
    };
  }, [filteredTransactions, summary, categoryBreakdown, investmentSummary]);

  const exportAdvancedReport = () => {
    const reportData = {
      period: selectedPeriod,
      dateRange: `${formatDatePT(dateStart)} - ${formatDatePT(dateEnd)}`,
      summary,
      categoryBreakdown,
      accountBalances,
      investmentSummary,
      savingsProgress,
      predictiveAnalysis,
      transactionCount: filteredTransactions.length,
      generatedAt: new Date().toISOString()
    };

    // Enhanced CSV with AI predictions
    const csvContent = [
      // Summary
      ['RESUMO FINANCEIRO AVANÇADO'],
      ['Período', reportData.dateRange],
      ['Gerado em', new Date().toLocaleString('pt-PT')],
      [''],
      ['MÉTRICAS ATUAIS'],
      ['Receitas', `€${summary.income.toFixed(2)}`],
      ['Despesas', `€${summary.expenses.toFixed(2)}`],
      ['Saldo', `€${summary.balance.toFixed(2)}`],
      ['Taxa de Poupança', `${summary.savings.toFixed(1)}%`],
      ['Score de Saúde Financeira', `${predictiveAnalysis.healthScore.toFixed(0)}/100`],
      [''],
      
      // AI Predictions
      ['PREVISÕES INTELIGENTES'],
      ['Categoria', 'Gasto Atual', 'Previsão Próximo Mês', 'Tendência', 'Confiança'],
      ...predictiveAnalysis.categoryPredictions.map(pred => [
        pred.category,
        `€${categoryBreakdown.find(c => c.category === pred.category)?.expense.toFixed(2) || '0.00'}`,
        `€${pred.predicted.toFixed(2)}`,
        pred.trend === 'increasing' ? 'Crescente' : 'Estável',
        `${(pred.confidence * 100).toFixed(0)}%`
      ]),
      [''],
      
      // Recommendations
      ['RECOMENDAÇÕES INTELIGENTES'],
      ...predictiveAnalysis.recommendations.map(rec => [rec]),
      [''],
      
      // Category Breakdown
      ['ANÁLISE POR CATEGORIA'],
      ['Categoria', 'Receitas', 'Despesas', 'Total'],
      ...categoryBreakdown.map(cat => [
        cat.category,
        `€${cat.income.toFixed(2)}`,
        `€${cat.expense.toFixed(2)}`,
        `€${cat.total.toFixed(2)}`
      ]),
      [''],
      
      // Account Balances
      ['PERFORMANCE DAS CONTAS'],
      ['Conta', 'Saldo Atual', 'Movimentação', 'Transações'],
      ...accountBalances.map(acc => [
        acc.name,
        `€${acc.balance.toFixed(2)}`,
        `€${acc.movement.toFixed(2)}`,
        acc.transactionCount.toString()
      ]),
      [''],
      
      // Investment Analysis
      ['ANÁLISE DE INVESTIMENTOS'],
      ['Total Investido', `€${investmentSummary.totalInvested.toFixed(2)}`],
      ['Valor Atual', `€${investmentSummary.totalCurrentValue.toFixed(2)}`],
      ['Retorno', `€${investmentSummary.totalReturn.toFixed(2)}`],
      ['Retorno %', `${investmentSummary.totalReturnPercentage.toFixed(2)}%`]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_avancado_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSONReport = () => {
    const reportData = {
      period: selectedPeriod,
      dateRange: `${formatDatePT(dateStart)} - ${formatDatePT(dateEnd)}`,
      summary,
      categoryBreakdown,
      accountBalances,
      investmentSummary,
      savingsProgress,
      predictiveAnalysis,
      transactionCount: filteredTransactions.length,
      transactions: filteredTransactions,
      generatedAt: new Date().toISOString()
    };

    const jsonContent = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `dados_completos_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'thisMonth': return 'Este Mês';
      case 'last3Months': return 'Últimos 3 Meses';
      case 'last6Months': return 'Últimos 6 Meses';
      case 'thisYear': return 'Este Ano';
      default: return 'Este Mês';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">Análise detalhada das suas finanças</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisMonth">Este Mês</SelectItem>
              <SelectItem value="last3Months">Últimos 3 Meses</SelectItem>
              <SelectItem value="last6Months">Últimos 6 Meses</SelectItem>
              <SelectItem value="thisYear">Este Ano</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button onClick={exportAdvancedReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <Button onClick={exportJSONReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar JSON
            </Button>
          </div>
        </div>
      </div>

      {/* Period Info */}
      <Card className="bg-gradient-card shadow-card">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Período: {getPeriodLabel(selectedPeriod)}</span>
            </div>
            <Badge variant="outline">
              {formatDatePT(dateStart)} - {formatDatePT(dateEnd)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">€{summary.income.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredTransactions.filter(t => t.type === 'income').length} transações
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">€{summary.expenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredTransactions.filter(t => t.type === 'expense').length} transações
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              €{summary.balance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.balance >= 0 ? 'Superavit' : 'Déficit'}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Taxa Poupança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.savings >= 20 ? 'text-green-600' : summary.savings >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
              {summary.savings.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.savings >= 20 ? 'Excelente' : summary.savings >= 10 ? 'Bom' : 'Melhorar'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Análise por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryBreakdown.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma transação no período selecionado
              </p>
            ) : (
              categoryBreakdown.map((category, index) => {
                const maxTotal = Math.max(...categoryBreakdown.map(c => c.total));
                const percentage = (category.total / maxTotal) * 100;
                
                return (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{category.category}</span>
                      <div className="text-right text-sm">
                        <div className="font-medium">€{category.total.toFixed(2)}</div>
                        {category.income > 0 && (
                          <div className="text-green-600">+€{category.income.toFixed(2)}</div>
                        )}
                        {category.expense > 0 && (
                          <div className="text-red-600">-€{category.expense.toFixed(2)}</div>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Performance and Investment Summary */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account Performance */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle>Performance das Contas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accountBalances.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <div className="font-medium">{account.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {account.transactionCount} transação{account.transactionCount !== 1 ? 'ões' : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">€{account.balance.toFixed(2)}</div>
                    <div className={`text-sm ${account.movement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {account.movement >= 0 ? '+' : ''}€{account.movement.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Investment Summary */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle>Resumo de Investimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Investido</p>
                  <p className="text-xl font-bold">€{investmentSummary.totalInvested.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor Atual</p>
                  <p className="text-xl font-bold">€{investmentSummary.totalCurrentValue.toFixed(2)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Retorno</p>
                  <p className={`text-xl font-bold ${investmentSummary.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    €{investmentSummary.totalReturn.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Retorno %</p>
                  <p className={`text-xl font-bold flex items-center gap-1 ${investmentSummary.totalReturnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {investmentSummary.totalReturnPercentage >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {Math.abs(investmentSummary.totalReturnPercentage).toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Goals Progress */}
      {savingsProgress.length > 0 && (
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle>Progresso das Metas de Poupança</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {savingsProgress.map((goal) => (
                <div key={goal.id} className="p-4 rounded-lg bg-background/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{goal.name}</h4>
                    <Badge variant={goal.progress >= 100 ? 'default' : 'secondary'}>
                      {Math.min(goal.progress, 100).toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">€{goal.currentAmount.toFixed(2)}</span>
                      <span className="text-muted-foreground">€{goal.targetAmount.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          goal.progress >= 100 ? 'bg-green-500' : 'bg-gradient-primary'
                        }`}
                        style={{ width: `${Math.min(goal.progress, 100)}%` }}
                      />
                    </div>
                    {goal.daysRemaining > 0 && goal.progress < 100 && (
                      <div className="text-xs text-muted-foreground">
                        €{goal.dailyTarget.toFixed(2)}/dia para atingir a meta
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};