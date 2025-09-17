import React, { useState } from 'react';
import { Plus, Edit, Trash2, Calendar, Play, Pause, Clock, Repeat } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { formatDatePT } from '../../utils/dateUtils';
import type { RecurringTransaction } from '../../contexts/FinanceContext';

const RecurringForm: React.FC<{
  recurring?: RecurringTransaction | null;
  onClose: () => void;
  onSave: (recurring: any) => void;
}> = ({ recurring, onClose, onSave }) => {
  const { categories, accounts } = useFinance();
  const [formData, setFormData] = useState({
    type: recurring?.type || 'expense' as 'income' | 'expense',
    amount: recurring?.amount?.toString() || '',
    description: recurring?.description || '',
    category: recurring?.category || '',
    account: recurring?.account || '',
    frequency: recurring?.frequency || 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    nextDate: recurring?.nextDate || new Date().toISOString().split('T')[0],
    isActive: recurring?.isActive ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!formData.amount || isNaN(parseFloat(formData.amount))) newErrors.amount = 'Valor deve ser um número válido';
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!formData.category) newErrors.category = 'Categoria é obrigatória';
    if (!formData.account) newErrors.account = 'Conta é obrigatória';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      type: formData.type,
      amount: parseFloat(formData.amount),
      description: formData.description,
      category: formData.category,
      account: formData.account,
      frequency: formData.frequency,
      nextDate: formData.nextDate,
      isActive: formData.isActive,
    });
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-gradient-card">
        <CardHeader>
          <CardTitle>{recurring ? 'Editar Recorrência' : 'Nova Transação Recorrente'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
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
              <Label htmlFor="amount">Valor (€)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className={errors.amount ? 'border-red-500' : ''}
              />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
            </div>

            <div className="space-y-2">
              <Label>Conta</Label>
              <Select value={formData.account} onValueChange={(value) => setFormData(prev => ({ ...prev, account: value }))}>
                <SelectTrigger className={errors.account ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione uma conta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.name}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.account && <p className="text-sm text-red-500">{errors.account}</p>}
            </div>

            <div className="space-y-2">
              <Label>Frequência</Label>
              <Select value={formData.frequency} onValueChange={(value: any) => setFormData(prev => ({ ...prev, frequency: value }))}>
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

            <div className="space-y-2">
              <Label htmlFor="nextDate">Próxima Execução</Label>
              <Input
                id="nextDate"
                type="date"
                value={formData.nextDate}
                onChange={(e) => setFormData(prev => ({ ...prev, nextDate: e.target.value }))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Ativa</Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                {recurring ? 'Actualizar' : 'Guardar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export const RecurringManager: React.FC = () => {
  const { recurringTransactions, addRecurringTransaction, updateRecurringTransaction, deleteRecurringTransaction } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null);

  const handleEdit = (recurring: RecurringTransaction) => {
    setEditingRecurring(recurring);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem a certeza que deseja eliminar esta transação recorrente?')) {
      await deleteRecurringTransaction(id);
    }
  };

  const handleToggleActive = async (recurring: RecurringTransaction) => {
    await updateRecurringTransaction(recurring.id, { isActive: !recurring.isActive });
  };

  const handleFormSave = async (recurringData: any) => {
    try {
      if (editingRecurring) {
        await updateRecurringTransaction(editingRecurring.id, recurringData);
      } else {
        await addRecurringTransaction(recurringData);
      }
      setShowForm(false);
      setEditingRecurring(null);
    } catch (error) {
      console.error('Erro ao guardar transação recorrente:', error);
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transações Recorrentes</h1>
          <p className="text-muted-foreground">Automatize receitas e despesas regulares</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Recorrência
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRecurring.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receitas Mensais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              €{activeRecurring
                .filter(r => r.type === 'income' && r.frequency === 'monthly')
                .reduce((sum, r) => sum + r.amount, 0)
                .toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Despesas Mensais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              €{activeRecurring
                .filter(r => r.type === 'expense' && r.frequency === 'monthly')
                .reduce((sum, r) => sum + r.amount, 0)
                .toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Recurring Transactions */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5" />
            Transações Ativas ({activeRecurring.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeRecurring.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma transação recorrente</h3>
              <p className="mb-4">Crie transações automáticas para receitas e despesas regulares</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Primeira Recorrência
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeRecurring.map((recurring) => (
                <Card key={recurring.id} className="bg-background/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={recurring.type === 'income' ? 'default' : 'secondary'}>
                        {recurring.type === 'income' ? 'Receita' : 'Despesa'}
                      </Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleToggleActive(recurring)}>
                          <Pause className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(recurring)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(recurring.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h3 className="font-medium">{recurring.description}</h3>
                      <p className="text-sm text-muted-foreground">{recurring.category}</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className={`text-lg font-bold ${
                        recurring.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        €{recurring.amount.toFixed(2)}
                      </div>
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        {getFrequencyLabel(recurring.frequency)}
                      </Badge>
                    </div>

                    <div className="text-sm">
                      <p className="text-muted-foreground">Conta: {recurring.account}</p>
                      <p className="text-muted-foreground">Próxima: {formatDatePT(recurring.nextDate)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inactive Recurring Transactions */}
      {inactiveRecurring.length > 0 && (
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pause className="h-5 w-5" />
              Transações Inativas ({inactiveRecurring.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inactiveRecurring.map((recurring) => (
                <Card key={recurring.id} className="bg-background/30 opacity-60">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {recurring.type === 'income' ? 'Receita' : 'Despesa'}
                      </Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleToggleActive(recurring)}>
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(recurring)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(recurring.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h3 className="font-medium">{recurring.description}</h3>
                      <p className="text-sm text-muted-foreground">{recurring.category}</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-bold text-muted-foreground">
                        €{recurring.amount.toFixed(2)}
                      </div>
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        {getFrequencyLabel(recurring.frequency)}
                      </Badge>
                    </div>

                    <div className="text-sm">
                      <p className="text-muted-foreground">Conta: {recurring.account}</p>
                      <p className="text-muted-foreground">Inativa</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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