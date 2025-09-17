import React, { useState } from 'react';
import { Plus, Edit, Trash2, Calendar, Play, Pause, Clock, Repeat, AlertTriangle, Brain, TrendingUp, Bell } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { useToast } from '@/hooks/use-toast';
import { formatDatePT } from '../../utils/dateUtils';
import type { RecurringTransaction } from '../../contexts/FinanceContext';

const RecurringForm: React.FC<{
  recurring?: RecurringTransaction | null;
  onClose: () => void;
  onSave: (recurring: any) => void;
}> = ({ recurring, onClose, onSave }) => {
  const { categories, accounts } = useFinance();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    type: recurring?.type || 'expense' as 'income' | 'expense',
    amount: recurring?.amount?.toString() || '',
    description: recurring?.description || '',
    category: recurring?.category || '',
    account: recurring?.account || '',
    frequency: recurring?.frequency || 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    nextDate: recurring?.nextDate || new Date().toISOString().split('T')[0],
    isActive: recurring?.isActive ?? true,
    // Enhanced fields
    expectedAmount: recurring?.expectedAmount?.toString() || '',
    tolerancePercentage: recurring?.tolerancePercentage?.toString() || '10',
    alertOnVariation: recurring?.alertOnVariation ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description || !formData.category || !formData.account) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const recurringData = {
      type: formData.type,
      amount: parseFloat(formData.amount),
      description: formData.description,
      category: formData.category,
      account: formData.account,
      frequency: formData.frequency,
      nextDate: formData.nextDate,
      isActive: formData.isActive,
      // Enhanced fields
      expectedAmount: formData.expectedAmount ? parseFloat(formData.expectedAmount) : parseFloat(formData.amount),
      tolerancePercentage: parseFloat(formData.tolerancePercentage),
      alertOnVariation: formData.alertOnVariation,
    };

    onSave(recurringData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5" />
            {recurring ? 'Editar Transação Recorrente' : 'Nova Transação Recorrente'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações Básicas</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'income' | 'expense' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Receita</SelectItem>
                    <SelectItem value="expense">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Frequência</Label>
                <Select 
                  value={formData.frequency} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ex: Salário, Renda da Casa, Netflix"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Valor (€)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextDate">Próxima Data</Label>
                <Input
                  id="nextDate"
                  type="date"
                  value={formData.nextDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, nextDate: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c.type === formData.type && c.isActive).map((category) => (
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
                <Label htmlFor="account">Conta</Label>
                <Select 
                  value={formData.account} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, account: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.name}>
                        <div className="flex items-center justify-between w-full">
                          <span>{account.name}</span>
                          <Badge variant="outline">€{account.balance.toFixed(2)}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Advanced Features */}
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Monitorização Inteligente
            </h3>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Configure alertas para variações no valor esperado e obtenha recomendações baseadas em IA.
              </AlertDescription>
            </Alert>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="expectedAmount">Valor Esperado (€)</Label>
                <Input
                  id="expectedAmount"
                  type="number"
                  step="0.01"
                  value={formData.expectedAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, expectedAmount: e.target.value }))}
                  placeholder={formData.amount || "500.00"}
                />
                <p className="text-xs text-muted-foreground">
                  Valor usado para detectar variações anômalas
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tolerancePercentage">Tolerância (%)</Label>
                <Select 
                  value={formData.tolerancePercentage} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, tolerancePercentage: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5% - Muito Restritivo</SelectItem>
                    <SelectItem value="10">10% - Restritivo</SelectItem>
                    <SelectItem value="15">15% - Moderado</SelectItem>
                    <SelectItem value="20">20% - Flexível</SelectItem>
                    <SelectItem value="30">30% - Muito Flexível</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Switch
                    checked={formData.alertOnVariation}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, alertOnVariation: checked }))}
                  />
                  Alertas de Variação
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receber notificações quando o valor variar além da tolerância
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Transação Ativa</Label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              {recurring ? 'Atualizar' : 'Criar'} Transação
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const RecurringManager: React.FC = () => {
  const { recurringTransactions, addRecurringTransaction, updateRecurringTransaction, deleteRecurringTransaction, transactions } = useFinance();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null);

  const handleEdit = (recurring: RecurringTransaction) => {
    setEditingRecurring(recurring);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem a certeza que deseja eliminar esta transação recorrente?')) {
      try {
        await deleteRecurringTransaction(id);
        toast({
          title: "Transação eliminada",
          description: "Transação recorrente eliminada com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível eliminar a transação.",
          variant: "destructive",
        });
      }
    }
  };

  const handleToggleActive = async (recurring: RecurringTransaction) => {
    try {
      await updateRecurringTransaction(recurring.id, { isActive: !recurring.isActive });
      toast({
        title: recurring.isActive ? "Transação pausada" : "Transação ativada",
        description: `A transação foi ${recurring.isActive ? 'pausada' : 'ativada'} com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar o estado da transação.",
        variant: "destructive",
      });
    }
  };

  const handleFormSave = async (recurringData: any) => {
    try {
      if (editingRecurring) {
        await updateRecurringTransaction(editingRecurring.id, recurringData);
        toast({
          title: "Transação atualizada",
          description: "Transação recorrente atualizada com sucesso.",
        });
      } else {
        await addRecurringTransaction(recurringData);
        toast({
          title: "Transação criada",
          description: "Nova transação recorrente criada com sucesso.",
        });
      }
      setShowForm(false);
      setEditingRecurring(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível guardar a transação.",
        variant: "destructive",
      });
    }
  };

  // AI Recommendations Logic
  const getAiRecommendations = (recurring: RecurringTransaction) => {
    const relatedTransactions = transactions.filter(t => 
      t.description.toLowerCase().includes(recurring.description.toLowerCase()) ||
      t.category === recurring.category
    );

    const recommendations = [];

    // Amount variation analysis
    if (relatedTransactions.length >= 3) {
      const amounts = relatedTransactions.map(t => t.amount);
      const avgAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
      const variance = avgAmount !== recurring.amount;
      
      if (variance && Math.abs(avgAmount - recurring.amount) / recurring.amount > 0.1) {
        recommendations.push({
          type: 'amount_adjustment',
          message: `Considere ajustar o valor para €${avgAmount.toFixed(2)} baseado no histórico`,
          confidence: 0.8
        });
      }
    }

    // Frequency optimization
    const monthlyOccurrences = relatedTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      return transactionDate >= lastMonth;
    }).length;

    if (monthlyOccurrences > 1 && recurring.frequency !== 'monthly') {
      recommendations.push({
        type: 'frequency_optimization',
        message: 'Detectamos múltiplas ocorrências mensais. Considere alterar para frequência mensal.',
        confidence: 0.7
      });
    }

    return recommendations;
  };

  // Variation Detection
  const detectVariations = (recurring: RecurringTransaction) => {
    if (!recurring.expectedAmount || !recurring.tolerancePercentage) return null;
    
    const tolerance = (recurring.tolerancePercentage / 100) * recurring.expectedAmount;
    const variation = Math.abs(recurring.amount - recurring.expectedAmount);
    
    if (variation > tolerance) {
      return {
        hasVariation: true,
        percentage: (variation / recurring.expectedAmount) * 100,
        difference: recurring.amount - recurring.expectedAmount
      };
    }
    
    return { hasVariation: false, percentage: 0, difference: 0 };
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Diário';
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensal';
      case 'yearly': return 'Anual';
      default: return frequency;
    }
  };

  const activeRecurring = recurringTransactions.filter(r => r.isActive);
  const inactiveRecurring = recurringTransactions.filter(r => !r.isActive);
  
  const monthlyIncome = activeRecurring
    .filter(r => r.type === 'income')
    .reduce((sum, r) => {
      const multiplier = r.frequency === 'monthly' ? 1 : 
                       r.frequency === 'weekly' ? 4.33 :
                       r.frequency === 'daily' ? 30 :
                       r.frequency === 'yearly' ? 1/12 : 1;
      return sum + (r.amount * multiplier);
    }, 0);

  const monthlyExpenses = activeRecurring
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => {
      const multiplier = r.frequency === 'monthly' ? 1 : 
                       r.frequency === 'weekly' ? 4.33 :
                       r.frequency === 'daily' ? 30 :
                       r.frequency === 'yearly' ? 1/12 : 1;
      return sum + (r.amount * multiplier);
    }, 0);

  const variationsDetected = recurringTransactions.filter(r => {
    const variation = detectVariations(r);
    return variation?.hasVariation;
  }).length;

  const aiRecommendationsCount = recurringTransactions.reduce((count, r) => {
    return count + getAiRecommendations(r).length;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transações Recorrentes</h1>
          <p className="text-muted-foreground">
            Gerir pagamentos regulares com alertas inteligentes e recomendações IA
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      {/* Enhanced Summary */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transações Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRecurring.length}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receitas/Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">€{monthlyIncome.toFixed(0)}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Despesas/Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">€{monthlyExpenses.toFixed(0)}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Variações Detectadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 flex items-center gap-2">
              {variationsDetected}
              {variationsDetected > 0 && <AlertTriangle className="h-4 w-4" />}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recomendações IA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 flex items-center gap-2">
              {aiRecommendationsCount}
              <Brain className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recurring Transactions */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Ativas ({activeRecurring.length})</TabsTrigger>
          <TabsTrigger value="inactive">Inativas ({inactiveRecurring.length})</TabsTrigger>
          <TabsTrigger value="insights">Insights IA</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeRecurring.length === 0 ? (
            <Card className="bg-gradient-card shadow-card">
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma transação recorrente ativa</h3>
                <p className="text-muted-foreground mb-4">
                  Configure pagamentos regulares para melhor controlo financeiro
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Primeira Transação
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeRecurring.map((recurring) => {
                const variation = detectVariations(recurring);
                const recommendations = getAiRecommendations(recurring);
                
                return (
                  <Card key={recurring.id} className="bg-gradient-card shadow-card">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${recurring.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {recurring.type === 'income' ? <TrendingUp className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                          </div>
                          <div>
                            <CardTitle className="text-base">{recurring.description}</CardTitle>
                            <p className="text-sm text-muted-foreground">{getFrequencyLabel(recurring.frequency)}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 items-center">
                          {variation?.hasVariation && recurring.alertOnVariation && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Variação
                            </Badge>
                          )}
                          {recommendations.length > 0 && (
                            <Badge variant="secondary" className="gap-1">
                              <Brain className="h-3 w-3" />
                              IA
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold">
                            €{recurring.amount.toFixed(2)}
                          </span>
                          <Badge variant={recurring.type === 'income' ? 'default' : 'secondary'}>
                            {recurring.category}
                          </Badge>
                        </div>
                        
                        {variation?.hasVariation && (
                          <div className="p-2 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded">
                            <div className="flex items-center gap-2 text-sm">
                              <AlertTriangle className="h-4 w-4 text-orange-600" />
                              <span className="font-medium text-orange-600">
                                Variação de {variation.percentage.toFixed(1)}%
                              </span>
                            </div>
                            <p className="text-xs text-orange-600 mt-1">
                              {variation.difference > 0 ? '+' : ''}€{variation.difference.toFixed(2)} do valor esperado
                            </p>
                          </div>
                        )}

                        {recommendations.length > 0 && (
                          <div className="p-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded">
                            <div className="flex items-center gap-2 text-sm mb-1">
                              <Brain className="h-4 w-4 text-blue-600" />
                              <span className="font-medium text-blue-600">Recomendações IA</span>
                            </div>
                            {recommendations.slice(0, 1).map((rec, idx) => (
                              <p key={idx} className="text-xs text-blue-600">
                                {rec.message}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Próxima:</span>
                        <span>{formatDatePT(recurring.nextDate)}</span>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(recurring)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleToggleActive(recurring)}>
                          <Pause className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(recurring.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          {inactiveRecurring.length === 0 ? (
            <Card className="bg-gradient-card shadow-card">
              <CardContent className="py-8 text-center">
                <h3 className="text-lg font-medium mb-2">Nenhuma transação inativa</h3>
                <p className="text-muted-foreground">
                  Todas as transações recorrentes estão ativas
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {inactiveRecurring.map((recurring) => (
                <Card key={recurring.id} className="bg-gradient-card shadow-card opacity-60">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">{recurring.description}</h3>
                          <p className="text-sm text-muted-foreground">
                            €{recurring.amount.toFixed(2)} • {getFrequencyLabel(recurring.frequency)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(recurring)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleToggleActive(recurring)}>
                          <Play className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(recurring.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Alertas de Variação
                </CardTitle>
              </CardHeader>
              <CardContent>
                {variationsDetected === 0 ? (
                  <p className="text-muted-foreground">Nenhuma variação anômala detectada.</p>
                ) : (
                  <div className="space-y-3">
                    {recurringTransactions.filter(r => {
                      const variation = detectVariations(r);
                      return variation?.hasVariation;
                    }).map((recurring) => {
                      const variation = detectVariations(recurring);
                      return (
                        <div key={recurring.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{recurring.description}</span>
                            <Badge variant="destructive">
                              {variation?.percentage.toFixed(1)}%
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Variação de €{variation?.difference.toFixed(2)} do valor esperado
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  Recomendações IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                {aiRecommendationsCount === 0 ? (
                  <p className="text-muted-foreground">Nenhuma recomendação disponível no momento.</p>
                ) : (
                  <div className="space-y-3">
                    {recurringTransactions.flatMap((recurring) => {
                      const recommendations = getAiRecommendations(recurring);
                      return recommendations.map((rec, idx) => (
                        <div key={`${recurring.id}-${idx}`} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{recurring.description}</span>
                            <Progress value={rec.confidence * 100} className="w-16 h-2" />
                          </div>
                          <p className="text-sm text-muted-foreground">{rec.message}</p>
                        </div>
                      ));
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Form Modal */}
      {showForm && (
        <RecurringForm
          recurring={editingRecurring}
          onClose={() => {
            setShowForm(false);
            setEditingRecurring(null);
          }}
          onSave={handleFormSave}
        />
      )}
    </div>
  );
};