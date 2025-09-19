import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useFinance } from '../../contexts/FinanceContext';
import { toast } from '../ui/use-toast';

interface AssetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AssetForm: React.FC<AssetFormProps> = ({ open, onOpenChange }) => {
  const { addAsset } = useFinance();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'other' as const,
    purchasePrice: 0,
    currentValue: 0,
    purchaseDate: '',
    description: '',
    depreciationRate: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    
    try {
      setIsLoading(true);
      await addAsset(formData);
      toast({
        title: "Ativo Criado",
        description: "O ativo foi adicionado com sucesso.",
      });
      onOpenChange(false);
      // Reset form
      setFormData({
        name: '',
        type: 'other',
        purchasePrice: 0,
        currentValue: 0,
        purchaseDate: '',
        description: '',
        depreciationRate: 0,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar ativo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Ativo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Ativo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Casa, Carro, etc."
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Tipo</Label>
            <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="property">Propriedade</SelectItem>
                <SelectItem value="vehicle">Veículo</SelectItem>
                <SelectItem value="collectible">Colecionável</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="purchasePrice">Preço de Compra</Label>
              <Input
                id="purchasePrice"
                type="number"
                step="0.01"
                value={formData.purchasePrice}
                onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="currentValue">Valor Atual</Label>
              <Input
                id="currentValue"
                type="number"
                step="0.01"
                value={formData.currentValue}
                onChange={(e) => setFormData(prev => ({ ...prev, currentValue: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="purchaseDate">Data de Compra (opcional)</Label>
            <Input
              id="purchaseDate"
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="depreciationRate">Taxa de Depreciação Anual (%)</Label>
            <Input
              id="depreciationRate"
              type="number"
              step="0.01"
              value={formData.depreciationRate}
              onChange={(e) => setFormData(prev => ({ ...prev, depreciationRate: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o ativo..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Criando...' : 'Criar Ativo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};