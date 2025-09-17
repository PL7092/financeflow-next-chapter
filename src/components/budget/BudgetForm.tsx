import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { X } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import type { Budget } from '../../contexts/FinanceContext';

interface BudgetFormProps {
  budget?: Budget | null;
  onClose: () => void;
  onSave: (budget: any) => void;
  defaultMonth?: number;
  defaultYear?: number;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({
  budget,
  onClose,
  onSave,
  defaultMonth = new Date().getMonth(),
  defaultYear = new Date().getFullYear(),
}) => {
  const { categories } = useFinance();
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    month: defaultMonth,
    year: defaultYear,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (budget) {
      setFormData({
        category: budget.category,
        limit: budget.limit.toString(),
        month: budget.month,
        year: budget.year,
      });
    }
  }, [budget]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória';
    }
    if (!formData.limit || parseFloat(formData.limit) <= 0) {
      newErrors.limit = 'Limite deve ser maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const budgetData = {
      category: formData.category,
      limit: parseFloat(formData.limit),
      month: formData.month,
      year: formData.year,
      spent: budget?.spent || 0,
    };

    onSave(budgetData);
  };

  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-gradient-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {budget ? 'Editar Orçamento' : 'Novo Orçamento'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Categoria */}
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => (
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
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category}</p>
              )}
            </div>

            {/* Limite */}
            <div className="space-y-2">
              <Label htmlFor="limit">Limite Mensal (€)</Label>
              <Input
                id="limit"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.limit}
                onChange={(e) => handleInputChange('limit', e.target.value)}
                className={errors.limit ? 'border-red-500' : ''}
              />
              {errors.limit && (
                <p className="text-sm text-red-500">{errors.limit}</p>
              )}
            </div>

            {/* Mês */}
            <div className="space-y-2">
              <Label>Mês</Label>
              <Select
                value={formData.month.toString()}
                onValueChange={(value) => handleInputChange('month', parseInt(value))}
              >
                <SelectTrigger>
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

            {/* Ano */}
            <div className="space-y-2">
              <Label>Ano</Label>
              <Select
                value={formData.year.toString()}
                onValueChange={(value) => handleInputChange('year', parseInt(value))}
              >
                <SelectTrigger>
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

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                {budget ? 'Actualizar' : 'Guardar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};