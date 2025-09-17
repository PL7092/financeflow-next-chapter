import React, { useState } from 'react';
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { Investment } from '../../contexts/FinanceContext';

const InvestmentForm: React.FC<{
  investment?: Investment | null;
  onClose: () => void;
  onSave: (investment: any) => void;
}> = ({ investment, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: investment?.name || '',
    type: investment?.type || 'ações',
    amount: investment?.amount?.toString() || '',
    currentValue: investment?.currentValue?.toString() || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.amount || isNaN(parseFloat(formData.amount))) newErrors.amount = 'Valor inicial deve ser um número válido';
    if (!formData.currentValue || isNaN(parseFloat(formData.currentValue))) newErrors.currentValue = 'Valor atual deve ser um número válido';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const amount = parseFloat(formData.amount);
    const currentValue = parseFloat(formData.currentValue);
    const returnAmount = currentValue - amount;
    const returnPercentage = ((returnAmount / amount) * 100);

    onSave({
      name: formData.name,
      type: formData.type,
      amount,
      currentValue,
      return: returnAmount,
      returnPercentage,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-gradient-card">
        <CardHeader>
          <CardTitle>{investment ? 'Editar Investimento' : 'Novo Investimento'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Investimento</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label>Tipo de Investimento</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ações">Ações</SelectItem>
                  <SelectItem value="obrigações">Obrigações</SelectItem>
                  <SelectItem value="etf">ETF</SelectItem>
                  <SelectItem value="fundos">Fundos de Investimento</SelectItem>
                  <SelectItem value="crypto">Criptomoedas</SelectItem>
                  <SelectItem value="imobiliario">Imobiliário</SelectItem>
                  <SelectItem value="commodities">Commodities</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor Inicial (€)</Label>
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
              <Label htmlFor="currentValue">Valor Atual (€)</Label>
              <Input
                id="currentValue"
                type="number"
                step="0.01"
                value={formData.currentValue}
                onChange={(e) => setFormData(prev => ({ ...prev, currentValue: e.target.value }))}
                className={errors.currentValue ? 'border-red-500' : ''}
              />
              {errors.currentValue && <p className="text-sm text-red-500">{errors.currentValue}</p>}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                {investment ? 'Actualizar' : 'Guardar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export const InvestmentManager: React.FC = () => {
  const { investments, addInvestment, updateInvestment, deleteInvestment } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);

  const handleEdit = (investment: Investment) => {
    setEditingInvestment(investment);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem a certeza que deseja eliminar este investimento?')) {
      await deleteInvestment(id);
    }
  };

  const handleFormSave = async (investmentData: any) => {
    try {
      if (editingInvestment) {
        await updateInvestment(editingInvestment.id, investmentData);
      } else {
        await addInvestment(investmentData);
      }
      setShowForm(false);
      setEditingInvestment(null);
    } catch (error) {
      console.error('Erro ao guardar investimento:', error);
    }
  };

  // Portfolio calculations
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalReturn = totalCurrentValue - totalInvested;
  const totalReturnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  // Investment type distribution
  const typeDistribution = investments.reduce((acc, inv) => {
    acc[inv.type] = (acc[inv.type] || 0) + inv.currentValue;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investimentos</h1>
          <p className="text-muted-foreground">Acompanhe o desempenho do seu portfolio</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Investimento
        </Button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Investido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalInvested.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valor Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalCurrentValue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Retorno</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              €{totalReturn.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Retorno %</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold flex items-center gap-2 ${
              totalReturnPercentage >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {totalReturnPercentage >= 0 ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
              {Math.abs(totalReturnPercentage).toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Type Distribution */}
      {Object.keys(typeDistribution).length > 0 && (
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribuição por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Object.entries(typeDistribution).map(([type, value]) => {
                const percentage = (value / totalCurrentValue) * 100;
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="capitalize text-sm font-medium">{type}</span>
                      <span className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-sm font-medium">€{value.toFixed(2)}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Investments List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {investments.length === 0 ? (
          <Card className="col-span-full bg-gradient-card shadow-card">
            <CardContent className="py-12 text-center">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum investimento registado</h3>
              <p className="text-muted-foreground mb-4">
                Adicione os seus investimentos para acompanhar o desempenho do seu portfolio
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Primeiro Investimento
              </Button>
            </CardContent>
          </Card>
        ) : (
          investments.map((investment) => {
            const returnPercentage = investment.returnPercentage || 0;
            const isPositive = returnPercentage >= 0;

            return (
              <Card key={investment.id} className="bg-gradient-card shadow-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{investment.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs capitalize mt-1">
                        {investment.type}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(investment)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(investment.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Investido:</span>
                      <span>€{investment.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Valor Atual:</span>
                      <span className="font-medium">€{investment.currentValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Retorno:</span>
                      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span className="font-medium">
                          €{Math.abs(investment.return || 0).toFixed(2)} ({Math.abs(returnPercentage).toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isPositive ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ 
                          width: `${Math.min(Math.abs(returnPercentage), 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <InvestmentForm
          investment={editingInvestment}
          onClose={() => {
            setShowForm(false);
            setEditingInvestment(null);
          }}
          onSave={handleFormSave}
        />
      )}
    </div>
  );
};