import React, { useState } from 'react';
import { Plus, Edit, Trash2, PiggyBank, Target, TrendingUp, Calendar } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { formatDatePT } from '../../utils/dateUtils';
import type { SavingsGoal } from '../../contexts/FinanceContext';

const SavingsForm: React.FC<{
  goal?: SavingsGoal | null;
  onClose: () => void;
  onSave: (goal: any) => void;
}> = ({ goal, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: goal?.name || '',
    targetAmount: goal?.targetAmount?.toString() || '',
    currentAmount: goal?.currentAmount?.toString() || '0',
    targetDate: goal?.targetDate || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.targetAmount || isNaN(parseFloat(formData.targetAmount))) newErrors.targetAmount = 'Valor objetivo deve ser um número válido';
    if (!formData.currentAmount || isNaN(parseFloat(formData.currentAmount))) newErrors.currentAmount = 'Valor atual deve ser um número válido';
    if (!formData.targetDate) newErrors.targetDate = 'Data objetivo é obrigatória';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount),
      targetDate: formData.targetDate,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-gradient-card">
        <CardHeader>
          <CardTitle>{goal ? 'Editar Meta de Poupança' : 'Nova Meta de Poupança'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Meta</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={errors.name ? 'border-red-500' : ''}
                placeholder="Ex: Viagem de férias, Carro novo..."
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAmount">Valor Objetivo (€)</Label>
              <Input
                id="targetAmount"
                type="number"
                step="0.01"
                value={formData.targetAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                className={errors.targetAmount ? 'border-red-500' : ''}
              />
              {errors.targetAmount && <p className="text-sm text-red-500">{errors.targetAmount}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentAmount">Valor Atual (€)</Label>
              <Input
                id="currentAmount"
                type="number"
                step="0.01"
                value={formData.currentAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, currentAmount: e.target.value }))}
                className={errors.currentAmount ? 'border-red-500' : ''}
              />
              {errors.currentAmount && <p className="text-sm text-red-500">{errors.currentAmount}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDate">Data Objetivo</Label>
              <Input
                id="targetDate"
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                className={errors.targetDate ? 'border-red-500' : ''}
              />
              {errors.targetDate && <p className="text-sm text-red-500">{errors.targetDate}</p>}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                {goal ? 'Actualizar' : 'Guardar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export const SavingsManager: React.FC = () => {
  const { savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem a certeza que deseja eliminar esta meta de poupança?')) {
      await deleteSavingsGoal(id);
    }
  };

  const handleFormSave = async (goalData: any) => {
    try {
      if (editingGoal) {
        await updateSavingsGoal(editingGoal.id, goalData);
      } else {
        await addSavingsGoal(goalData);
      }
      setShowForm(false);
      setEditingGoal(null);
    } catch (error) {
      console.error('Erro ao guardar meta de poupança:', error);
    }
  };

  const calculateProgress = (goal: SavingsGoal) => {
    return (goal.currentAmount / goal.targetAmount) * 100;
  };

  const getDaysRemaining = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (progress: number, daysRemaining: number) => {
    if (progress >= 100) return 'text-green-600';
    if (daysRemaining < 30 && progress < 80) return 'text-red-600';
    if (progress > 50) return 'text-blue-600';
    return 'text-yellow-600';
  };

  const totalTarget = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const completedGoals = savingsGoals.filter(goal => goal.currentAmount >= goal.targetAmount).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Metas de Poupança</h1>
          <p className="text-muted-foreground">Defina e acompanhe os seus objectivos de poupança</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Meta
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Objetivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalTarget.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Poupado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">€{totalSaved.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Progresso Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(1) : 0}%
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Metas Concluídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {completedGoals} / {savingsGoals.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Goals */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {savingsGoals.length === 0 ? (
          <Card className="col-span-full bg-gradient-card shadow-card">
            <CardContent className="py-12 text-center">
              <PiggyBank className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma meta de poupança</h3>
              <p className="text-muted-foreground mb-4">
                Defina objetivos de poupança para alcançar os seus sonhos
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Primeira Meta
              </Button>
            </CardContent>
          </Card>
        ) : (
          savingsGoals.map((goal) => {
            const progress = calculateProgress(goal);
            const daysRemaining = getDaysRemaining(goal.targetDate);
            const isCompleted = progress >= 100;
            const remaining = goal.targetAmount - goal.currentAmount;

            return (
              <Card key={goal.id} className="bg-gradient-card shadow-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PiggyBank className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">{goal.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      {isCompleted && (
                        <Badge variant="default" className="gap-1">
                          <Target className="h-3 w-3" />
                          Concluída
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(goal)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(goal.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progresso:</span>
                      <span className={getStatusColor(progress, daysRemaining)}>
                        {Math.min(progress, 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-2" />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Atual:</span>
                      <span className="font-medium">€{goal.currentAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Objetivo:</span>
                      <span className="font-medium">€{goal.targetAmount.toFixed(2)}</span>
                    </div>
                    {!isCompleted && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Falta:</span>
                        <span className="font-medium text-red-600">€{remaining.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Data objetivo:</span>
                      <span>{formatDatePT(goal.targetDate)}</span>
                    </div>
                    {daysRemaining > 0 && !isCompleted && (
                      <div className="text-sm mt-1">
                        <span className="text-muted-foreground">
                          {daysRemaining} dias restantes
                        </span>
                        {daysRemaining > 0 && remaining > 0 && (
                          <span className="text-muted-foreground">
                            {' '}• €{(remaining / daysRemaining).toFixed(2)} por dia
                          </span>
                        )}
                      </div>
                    )}
                    {daysRemaining < 0 && !isCompleted && (
                      <div className="text-sm mt-1 text-red-600">
                        Meta expirada há {Math.abs(daysRemaining)} dias
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <SavingsForm
          goal={editingGoal}
          onClose={() => {
            setShowForm(false);
            setEditingGoal(null);
          }}
          onSave={handleFormSave}
        />
      )}
    </div>
  );
};