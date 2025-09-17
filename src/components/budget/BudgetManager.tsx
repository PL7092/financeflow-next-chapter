import React, { useState, useMemo } from 'react';
import { Plus, Target, AlertTriangle, CheckCircle, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { BudgetForm } from './BudgetForm';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { formatMonthPT } from '../../utils/dateUtils';

export const BudgetManager: React.FC = () => {
  const { budgets, deleteBudget, addBudget, updateBudget, transactions } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Calculate spent amounts based on actual transactions
  const budgetsWithSpent = useMemo(() => {
    return budgets
      .filter(budget => budget.month === selectedMonth && budget.year === selectedYear)
      .map(budget => {
        const spent = transactions
          .filter(t => 
            t.type === 'expense' &&
            t.category === budget.category &&
            new Date(t.date).getMonth() === selectedMonth &&
            new Date(t.date).getFullYear() === selectedYear
          )
          .reduce((sum, t) => sum + t.amount, 0);
        
        return { ...budget, spent };
      });
  }, [budgets, transactions, selectedMonth, selectedYear]);

  const handleEdit = (budget: any) => {
    setEditingBudget(budget);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem a certeza que deseja eliminar este orçamento?')) {
      await deleteBudget(id);
    }
  };

  const handleFormSave = async (budgetData: any) => {
    try {
      if (editingBudget) {
        await updateBudget(editingBudget.id, budgetData);
      } else {
        await addBudget(budgetData);
      }
      handleFormClose();
    } catch (error) {
      console.error('Erro ao guardar orçamento:', error);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingBudget(null);
  };

  const getBudgetStatus = (budget: any) => {
    const percentage = (budget.spent / budget.limit) * 100;
    if (percentage >= 100) return { status: 'exceeded', color: 'red', icon: AlertTriangle, text: 'Excedido' };
    if (percentage >= 80) return { status: 'warning', color: 'yellow', icon: AlertTriangle, text: 'Atenção' };
    return { status: 'good', color: 'green', icon: CheckCircle, text: 'No limite' };
  };

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // Summary calculations
  const summary = useMemo(() => {
    const totalBudget = budgetsWithSpent.reduce((sum, b) => sum + b.limit, 0);
    const totalSpent = budgetsWithSpent.reduce((sum, b) => sum + b.spent, 0);
    const remaining = totalBudget - totalSpent;
    
    return { totalBudget, totalSpent, remaining };
  }, [budgetsWithSpent]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orçamentos</h1>
          <p className="text-muted-foreground">Controle os seus gastos mensais por categoria</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Orçamento
        </Button>
      </div>

      {/* Period Selection */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mês</label>
              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => setSelectedMonth(parseInt(value))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ano</label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Orçamento Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{summary.totalBudget.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gasto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">€{summary.totalSpent.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Restante</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              €{summary.remaining.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budgets */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {budgetsWithSpent.length === 0 ? (
          <Card className="col-span-full bg-gradient-card shadow-card">
            <CardContent className="py-12 text-center">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum orçamento definido</h3>
              <p className="text-muted-foreground mb-4">
                Crie o seu primeiro orçamento para {formatMonthPT(selectedMonth)} de {selectedYear}
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Orçamento
              </Button>
            </CardContent>
          </Card>
        ) : (
          budgetsWithSpent.map((budget) => {
            const percentage = (budget.spent / budget.limit) * 100;
            const status = getBudgetStatus(budget);
            const remaining = budget.limit - budget.spent;
            const Icon = status.icon;

            return (
              <Card key={budget.id} className="bg-gradient-card shadow-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{budget.category}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(budget)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(budget.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={status.status === 'exceeded' ? 'destructive' : 'secondary'}
                      className="gap-1"
                    >
                      <Icon className="h-3 w-3" />
                      {status.text}
                    </Badge>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        €{budget.spent.toFixed(2)} / €{budget.limit.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <Progress 
                    value={Math.min(percentage, 100)} 
                    className="h-2"
                  />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Utilizado:</span>
                      <span>{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Restante:</span>
                      <span className={remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
                        €{remaining.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {percentage >= 100 && (
                    <div className="p-2 bg-red-50 dark:bg-red-950 rounded-lg text-sm text-red-700 dark:text-red-300">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Orçamento excedido em €{(budget.spent - budget.limit).toFixed(2)}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <BudgetForm
          budget={editingBudget}
          onClose={handleFormClose}
          onSave={handleFormSave}
          defaultMonth={selectedMonth}
          defaultYear={selectedYear}
        />
      )}
    </div>
  );
};