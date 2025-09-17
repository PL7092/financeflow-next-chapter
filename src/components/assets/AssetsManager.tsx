import React, { useState } from 'react';
import { Plus, Edit, Trash2, Car, Home, Laptop, Diamond, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { formatDatePT } from '../../utils/dateUtils';
import type { Asset } from '../../contexts/FinanceContext';

const AssetForm: React.FC<{
  asset?: Asset | null;
  onClose: () => void;
  onSave: (asset: any) => void;
}> = ({ asset, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: asset?.name || '',
    type: asset?.type || 'veiculo',
    value: asset?.value?.toString() || '',
    purchaseDate: asset?.purchaseDate || new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.value || isNaN(parseFloat(formData.value))) newErrors.value = 'Valor deve ser um número válido';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      name: formData.name,
      type: formData.type,
      value: parseFloat(formData.value),
      purchaseDate: formData.purchaseDate,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-gradient-card">
        <CardHeader>
          <CardTitle>{asset ? 'Editar Ativo' : 'Novo Ativo'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Ativo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={errors.name ? 'border-red-500' : ''}
                placeholder="Ex: Toyota Corolla, Casa de Lisboa..."
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label>Tipo de Ativo</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="veiculo">Veículo</SelectItem>
                  <SelectItem value="imovel">Imóvel</SelectItem>
                  <SelectItem value="eletronicos">Eletrónicos</SelectItem>
                  <SelectItem value="joias">Joias</SelectItem>
                  <SelectItem value="arte">Arte e Colecionáveis</SelectItem>
                  <SelectItem value="moveis">Móveis</SelectItem>
                  <SelectItem value="equipamentos">Equipamentos</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Valor Atual (€)</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                className={errors.value ? 'border-red-500' : ''}
              />
              {errors.value && <p className="text-sm text-red-500">{errors.value}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Data de Compra</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                {asset ? 'Actualizar' : 'Guardar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export const AssetsManager: React.FC = () => {
  const { assets, addAsset, updateAsset, deleteAsset } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem a certeza que deseja eliminar este ativo?')) {
      await deleteAsset(id);
    }
  };

  const handleFormSave = async (assetData: any) => {
    try {
      if (editingAsset) {
        await updateAsset(editingAsset.id, assetData);
      } else {
        await addAsset(assetData);
      }
      setShowForm(false);
      setEditingAsset(null);
    } catch (error) {
      console.error('Erro ao guardar ativo:', error);
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'veiculo': return Car;
      case 'imovel': return Home;
      case 'eletronicos': return Laptop;
      case 'joias': return Diamond;
      default: return Car;
    }
  };

  const getAssetTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      veiculo: 'Veículo',
      imovel: 'Imóvel',
      eletronicos: 'Eletrónicos',
      joias: 'Joias',
      arte: 'Arte e Colecionáveis',
      moveis: 'Móveis',
      equipamentos: 'Equipamentos',
      outros: 'Outros'
    };
    return labels[type] || type;
  };

  // Asset type distribution
  const typeDistribution = assets.reduce((acc, asset) => {
    acc[asset.type] = (acc[asset.type] || 0) + asset.value;
    return acc;
  }, {} as Record<string, number>);

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ativos</h1>
          <p className="text-muted-foreground">Registe e acompanhe o valor dos seus bens</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Ativo
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">€{totalValue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{assets.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valor Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              €{assets.length > 0 ? (totalValue / assets.length).toFixed(2) : '0.00'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Type Distribution */}
      {Object.keys(typeDistribution).length > 0 && (
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle>Distribuição por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Object.entries(typeDistribution).map(([type, value]) => {
                const percentage = (value / totalValue) * 100;
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{getAssetTypeLabel(type)}</span>
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

      {/* Assets List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {assets.length === 0 ? (
          <Card className="col-span-full bg-gradient-card shadow-card">
            <CardContent className="py-12 text-center">
              <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum ativo registado</h3>
              <p className="text-muted-foreground mb-4">
                Registe os seus bens para acompanhar o património total
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Primeiro Ativo
              </Button>
            </CardContent>
          </Card>
        ) : (
          assets.map((asset) => {
            const Icon = getAssetIcon(asset.type);
            const purchaseDate = new Date(asset.purchaseDate);
            const ageInYears = (Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

            return (
              <Card key={asset.id} className="bg-gradient-card shadow-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-primary rounded-lg shadow-glow">
                        <Icon className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{asset.name}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {getAssetTypeLabel(asset.type)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(asset)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(asset.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Valor Atual</p>
                    <div className="text-2xl font-bold text-primary">
                      €{asset.value.toFixed(2)}
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Comprado em:</span>
                      <span>{formatDatePT(asset.purchaseDate)}</span>
                    </div>
                    <div className="text-muted-foreground">
                      Há {ageInYears.toFixed(1)} anos
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
        <AssetForm
          asset={editingAsset}
          onClose={() => {
            setShowForm(false);
            setEditingAsset(null);
          }}
          onSave={handleFormSave}
        />
      )}
    </div>
  );
};