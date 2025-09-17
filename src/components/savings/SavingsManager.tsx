import React, { useState } from 'react';
import { Plus, Edit, Trash2, PiggyBank, Target, TrendingUp, Calendar, AlertCircle, Save, X, Zap } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { useToast } from '@/hooks/use-toast';
import { formatDatePT } from '../../utils/dateUtils';
import type { SavingsGoal } from '../../contexts/FinanceContext';

const SavingsForm: React.FC<{
  goal?: SavingsGoal | null;
  onClose: () => void;
  onSave: (goal: any) => void;
}> = ({ goal, onClose, onSave }) => {
  const { accounts, categories } = useFinance();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: goal?.name || '',
    targetAmount: goal?.targetAmount?.toString() || '',
    currentAmount: goal?.currentAmount?.toString() || '0',
    targetDate: goal?.targetDate || new Date().toISOString().split('T')[0],
    category: goal?.category || '',
    priority: goal?.priority || 'medium',
    // Auto contributions
    autoContributions: {
      enabled: goal?.autoContributions?.enabled || false,
      amount: goal?.autoContributions?.amount?.toString() || '',
      frequency: goal?.autoContributions?.frequency || 'monthly',
      accountId: goal?.autoContributions?.accountId || '',
      conditions: goal?.autoContributions?.conditions || []
    },
    notes: goal?.notes || ''
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newCondition, setNewCondition] = useState<{
    type: 'transaction_match' | 'surplus_detection' | 'scheduled';
    pattern: string;
    percentage: number;
  }>({
    type: 'transaction_match',
    pattern: '',
    percentage: 10
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const goalData = {
      ...formData,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount),
      autoContributions: {
        ...formData.autoContributions,
        amount: formData.autoContributions.amount ? parseFloat(formData.autoContributions.amount) : undefined,
      }
    };

    onSave(goalData);
  };

  const addCondition = () => {
    if (newCondition.pattern || newCondition.type !== 'transaction_match') {
      setFormData(prev => ({
        ...prev,
        autoContributions: {
          ...prev.autoContributions,
          conditions: [...prev.autoContributions.conditions, { ...newCondition }]
        }
      }));
      setNewCondition({ type: 'transaction_match', pattern: '', percentage: 10 });
      toast({
        title: "Condição adicionada",
        description: "Nova condição para reforço automático configurada.",
      });
    }
  };

  const removeCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      autoContributions: {
        ...prev.autoContributions,
        conditions: prev.autoContributions.conditions.filter((_, i) => i !== index)
      }
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5" />
            {goal ? 'Editar Meta' : 'Nova Meta de Poupança'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Informações Básicas
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Meta</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Férias de Verão, Carro Novo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria (opcional)</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhuma</SelectItem>
                    {categories.filter(c => c.isActive).map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAmount">Valor Objetivo (€)</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  step="0.01"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetDate">Data Objetivo</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentAmount">Valor Atual (€)</Label>
                <Input
                  id="currentAmount"
                  type="number"
                  step="0.01"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentAmount: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as 'low' | 'medium' | 'high' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        Baixa
                      </span>
                    </SelectItem>
                    <SelectItem value="medium">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        Média
                      </span>
                    </SelectItem>
                    <SelectItem value="high">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        Alta
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Descrição adicional da meta, motivações, etc..."
                rows={3}
              />
            </div>
          </div>

          {/* Auto Contributions */}
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Reforços Automáticos
                </h3>
                <p className="text-sm text-muted-foreground">
                  Configure contribuições automáticas baseadas em condições inteligentes
                </p>
              </div>
              <Switch
                checked={formData.autoContributions.enabled}
                onCheckedChange={(enabled) => 
                  setFormData(prev => ({
                    ...prev,
                    autoContributions: { ...prev.autoContributions, enabled }
                  }))
                }
              />
            </div>

            {formData.autoContributions.enabled && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Os reforços automáticos usam IA para identificar padrões nas suas transações
                    e contribuir automaticamente para esta meta quando as condições são atendidas.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="autoAmount">Valor por Contribuição (€)</Label>
                    <Input
                      id="autoAmount"
                      type="number"
                      step="0.01"
                      value={formData.autoContributions.amount}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        autoContributions: { ...prev.autoContributions, amount: e.target.value }
                      }))}
                      placeholder="50.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequência</Label>
                    <Select 
                      value={formData.autoContributions.frequency} 
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        autoContributions: { ...prev.autoContributions, frequency: value as 'weekly' | 'monthly' }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountId">Conta de Origem</Label>
                    <Select 
                      value={formData.autoContributions.accountId} 
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        autoContributions: { ...prev.autoContributions, accountId: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a conta" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{account.name}</span>
                              <Badge variant="outline" className="ml-2">
                                €{account.balance.toFixed(2)}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Conditions */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Condições para Reforço Automático</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                      {showAdvanced ? 'Ocultar' : 'Mostrar'} Condições
                    </Button>
                  </div>

                  {showAdvanced && (
                    <div className="space-y-4 p-4 border rounded bg-background">
                      <div className="grid gap-3 md:grid-cols-5">
                        <Select 
                          value={newCondition.type} 
                          onValueChange={(value) => setNewCondition(prev => ({ 
                            ...prev, 
                            type: value as 'transaction_match' | 'surplus_detection' | 'scheduled' 
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="transaction_match">Transação Específica</SelectItem>
                            <SelectItem value="surplus_detection">Deteção de Excesso</SelectItem>
                            <SelectItem value="scheduled">Agendado</SelectItem>
                          </SelectContent>
                        </Select>

                        {newCondition.type === 'transaction_match' && (
                          <Input
                            value={newCondition.pattern}
                            onChange={(e) => setNewCondition(prev => ({ ...prev, pattern: e.target.value }))}
                            placeholder="Ex: Netflix, Salário"
                            className="md:col-span-2"
                          />
                        )}

                        {newCondition.type === 'surplus_detection' && (
                          <div className="md:col-span-2 flex items-center gap-2">
                            <Input
                              type="number"
                              value={newCondition.percentage}
                              onChange={(e) => setNewCondition(prev => ({ ...prev, percentage: parseInt(e.target.value) }))}
                              className="w-20"
                            />
                            <span className="text-sm text-muted-foreground">% do excesso mensal</span>
                          </div>
                        )}

                        {newCondition.type === 'scheduled' && (
                          <div className="md:col-span-2 text-sm text-muted-foreground flex items-center">
                            Contribuição regular baseada na frequência
                          </div>
                        )}

                        <Button type="button" size="sm" onClick={addCondition}>
                          <Plus className="h-4 w-4 mr-1" />
                          Adicionar
                        </Button>
                      </div>

                      {formData.autoContributions.conditions.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Condições Configuradas:</Label>
                          {formData.autoContributions.conditions.map((condition, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <div className="flex items-center gap-2">
                                {condition.type === 'transaction_match' && (
                                  <Badge variant="secondary">Transação</Badge>
                                )}
                                {condition.type === 'surplus_detection' && (
                                  <Badge variant="secondary">Excesso</Badge>
                                )}
                                {condition.type === 'scheduled' && (
                                  <Badge variant="secondary">Agendado</Badge>
                                )}
                                <span className="text-sm">
                                  {condition.type === 'transaction_match' 
                                    ? `Transações contendo: "${condition.pattern}"` 
                                    : condition.type === 'surplus_detection' 
                                      ? `${condition.percentage}% do excesso mensal`
                                      : 'Contribuição regular agendada'
                                  }
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCondition(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {goal ? 'Atualizar Meta' : 'Criar Meta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const SavingsManager: React.FC = () => {
  const { savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, transactions } = useFinance();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem a certeza que deseja eliminar esta meta de poupança?')) {
      try {
        await deleteSavingsGoal(id);
        toast({
          title: "Meta eliminada",
          description: "Meta de poupança eliminada com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível eliminar a meta.",
          variant: "destructive",
        });
      }
    }
  };

  const handleFormSave = async (goalData: any) => {
    try {
      if (editingGoal) {
        await updateSavingsGoal(editingGoal.id, goalData);
        toast({
          title: "Meta atualizada",
          description: "Meta de poupança atualizada com sucesso.",
        });
      } else {
        await addSavingsGoal(goalData);
        toast({
          title: "Meta criada",
          description: "Nova meta de poupança criada com sucesso.",
        });
      }
      setShowForm(false);
      setEditingGoal(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível guardar a meta.",
        variant: "destructive",
      });
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Calculate AI suggestions for auto contributions
  const calculateAutoContributions = (goal: SavingsGoal) => {
    if (!goal.autoContributions?.enabled) return [];
    
    const suggestions = [];
    const recentTransactions = transactions.slice(0, 50); // Last 50 transactions
    
    goal.autoContributions.conditions?.forEach(condition => {
      if (condition.type === 'transaction_match' && condition.pattern) {
        const matchingTransactions = recentTransactions.filter(t => 
          t.description.toLowerCase().includes(condition.pattern.toLowerCase())
        );
        if (matchingTransactions.length > 0) {
          suggestions.push({
            type: 'match',
            count: matchingTransactions.length,
            pattern: condition.pattern
          });
        }
      }
    });
    
    return suggestions;
  };

  const totalTarget = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const completedGoals = savingsGoals.filter(goal => goal.currentAmount >= goal.targetAmount).length;
  const aiEnabledGoals = savingsGoals.filter(goal => goal.autoContributions?.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Metas de Poupança</h1>
          <p className="text-muted-foreground">
            Defina objetivos inteligentes com reforços automáticos baseados em IA
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Meta
        </Button>
      </div>

      {/* Enhanced Summary */}
      <div className="grid gap-4 md:grid-cols-5">
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
        
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">IA Ativa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 flex items-center gap-2">
              {aiEnabledGoals}
              <Zap className="h-4 w-4" />
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
                Crie metas inteligentes com reforços automáticos baseados em IA
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
            const autoSuggestions = calculateAutoContributions(goal);

            return (
              <Card key={goal.id} className="bg-gradient-card shadow-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PiggyBank className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">{goal.name}</CardTitle>
                    </div>
                    <div className="flex gap-1 items-center">
                      {goal.priority && (
                        <Badge variant="outline" className={getPriorityColor(goal.priority)}>
                          {goal.priority === 'high' ? 'Alta' : goal.priority === 'medium' ? 'Média' : 'Baixa'}
                        </Badge>
                      )}
                      {goal.autoContributions?.enabled && (
                        <Badge variant="secondary" className="gap-1">
                          <Zap className="h-3 w-3" />
                          IA
                        </Badge>
                      )}
                      {isCompleted && (
                        <Badge variant="default" className="gap-1">
                          <Target className="h-3 w-3" />
                          Concluída
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(goal)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(goal.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

                  {goal.category && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Categoria:</span>
                      <Badge variant="outline">{goal.category}</Badge>
                    </div>
                  )}

                  {/* Auto Contribution Status */}
                  {goal.autoContributions?.enabled && (
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 text-sm">
                        <Zap className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-600">Reforços Automáticos Ativos</span>
                      </div>
                      {autoSuggestions.length > 0 && (
                        <div className="mt-1 text-xs text-blue-600">
                          {autoSuggestions.length} condições detectadas recentemente
                        </div>
                      )}
                    </div>
                  )}

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