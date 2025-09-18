import React, { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { useToast } from '../ui/use-toast';
import { Plus, Edit, Trash2, Home, Car, Diamond, Package } from 'lucide-react';
import type { Asset } from '../../contexts/FinanceContext';

interface AssetFormData {
  name: string;
  type: 'property' | 'vehicle' | 'collectible' | 'other';
  purchasePrice: string;
  currentValue: string;
  purchaseDate: string;
  description: string;
  depreciationRate: string;
}

const AssetForm: React.FC<{
  asset?: Asset | null;
  onClose: () => void;
  onSave: (asset: any) => void;
}> = ({ asset, onClose, onSave }) => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<AssetFormData>({
    name: asset?.name || '',
    type: asset?.type || 'other',
    purchasePrice: asset?.purchasePrice?.toString() || '',
    currentValue: asset?.currentValue?.toString() || '',
    purchaseDate: asset?.purchaseDate || new Date().toISOString().split('T')[0],
    description: asset?.description || '',
    depreciationRate: asset?.depreciationRate?.toString() || '0',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive",
      });
      return;
    }

    const assetData = {
      id: asset?.id,
      name: formData.name,
      type: formData.type,
      purchasePrice: parseFloat(formData.purchasePrice) || 0,
      currentValue: parseFloat(formData.currentValue) || 0,
      purchaseDate: formData.purchaseDate,
      description: formData.description,
      depreciationRate: parseFloat(formData.depreciationRate) || 0,
    };

    onSave(assetData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{asset ? 'Editar Ativo' : 'Novo Ativo'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do ativo"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Preço de Compra</Label>
              <Input
                id="purchasePrice"
                type="number"
                step="0.01"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentValue">Valor Atual</Label>
              <Input
                id="currentValue"
                type="number"
                step="0.01"
                value={formData.currentValue}
                onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Data de Compra</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="depreciationRate">Taxa de Depreciação (%)</Label>
              <Input
                id="depreciationRate"
                type="number"
                step="0.1"
                value={formData.depreciationRate}
                onChange={(e) => setFormData({ ...formData, depreciationRate: e.target.value })}
                placeholder="0.0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição do ativo"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {asset ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const AssetsManager: React.FC = () => {
  const { assets, addAsset, updateAsset, deleteAsset } = useFinance();
  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const handleSaveAsset = async (assetData: any) => {
    try {
      if (editingAsset) {
        await updateAsset(editingAsset.id, assetData);
        toast({
          title: "Sucesso",
          description: "Ativo atualizado com sucesso",
        });
      } else {
        await addAsset(assetData);
        toast({
          title: "Sucesso",
          description: "Ativo criado com sucesso",
        });
      }
      setIsFormOpen(false);
      setEditingAsset(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar ativo",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este ativo?')) {
      try {
        await deleteAsset(id);
        toast({
          title: "Sucesso",
          description: "Ativo excluído com sucesso",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir ativo",
          variant: "destructive",
        });
      }
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'property': return <Home className="h-5 w-5" />;
      case 'vehicle': return <Car className="h-5 w-5" />;
      case 'collectible': return <Diamond className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const getAssetLabel = (type: string) => {
    switch (type) {
      case 'property': return 'Propriedade';
      case 'vehicle': return 'Veículo';
      case 'collectible': return 'Colecionável';
      default: return 'Outro';
    }
  };

  // Summary calculations
  const totalValue = assets.reduce((sum, asset) => sum + (asset.currentValue || 0), 0);
  const totalQuantity = assets.length;
  const averageDepreciation = assets.length > 0 
    ? assets.reduce((sum, asset) => {
        const currentValue = asset.currentValue || 0;
        const purchasePrice = asset.purchasePrice || 0;
        return sum + (purchasePrice > 0 ? ((purchasePrice - currentValue) / purchasePrice) * 100 : 0);
      }, 0) / assets.length 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestão de Ativos</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Ativo
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuantity}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Depreciação Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageDepreciation.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Assets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset) => (
          <Card key={asset.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getAssetIcon(asset.type)}
                  <div>
                    <CardTitle className="text-base">{asset.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{getAssetLabel(asset.type)}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Valor Atual</p>
                  <p className="font-medium">€{(asset.currentValue || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Preço de Compra</p>
                  <p className="font-medium">€{(asset.purchasePrice || 0).toLocaleString()}</p>
                </div>
              </div>
              {asset.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{asset.description}</p>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingAsset(asset);
                    setIsFormOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteAsset(asset.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {asset.purchaseDate && new Date(asset.purchaseDate).toLocaleDateString()}
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>

      {assets.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Nenhum ativo encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece adicionando seus primeiros ativos financeiros.
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Ativo
            </Button>
          </CardContent>
        </Card>
      )}

      {isFormOpen && (
        <AssetForm
          asset={editingAsset}
          onClose={() => {
            setIsFormOpen(false);
            setEditingAsset(null);
          }}
          onSave={handleSaveAsset}
        />
      )}
    </div>
  );
};