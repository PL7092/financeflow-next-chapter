import React, { useState } from 'react';
import { 
  Plus, Edit, Trash2, Car, Home, Laptop, Diamond, TrendingUp, TrendingDown, 
  Calendar, FileText, Upload, Download, DollarSign, Wrench, Shield, 
  Calculator, Eye, X, Save, AlertCircle
} from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { useToast } from '@/hooks/use-toast';
import { formatDatePT } from '../../utils/dateUtils';
import type { Asset } from '../../contexts/FinanceContext';

// Cost Form Component
const CostForm: React.FC<{
  onClose: () => void;
  onSave: (cost: any) => void;
}> = ({ onClose, onSave }) => {
  const [costData, setCostData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    type: 'maintenance' as 'maintenance' | 'insurance' | 'tax' | 'other'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!costData.description || !costData.amount) return;

    onSave({
      id: Date.now().toString(),
      ...costData,
      amount: parseFloat(costData.amount)
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Custo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cost-date">Data</Label>
            <Input
              id="cost-date"
              type="date"
              value={costData.date}
              onChange={(e) => setCostData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost-type">Tipo de Custo</Label>
            <Select value={costData.type} onValueChange={(value: any) => setCostData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="insurance">Seguro</SelectItem>
                <SelectItem value="tax">Taxa/Imposto</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost-description">Descrição</Label>
            <Input
              id="cost-description"
              value={costData.description}
              onChange={(e) => setCostData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Ex: Revisão anual, Seguro auto"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost-amount">Valor (€)</Label>
            <Input
              id="cost-amount"
              type="number"
              step="0.01"
              value={costData.amount}
              onChange={(e) => setCostData(prev => ({ ...prev, amount: e.target.value }))}
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Document Form Component
const DocumentForm: React.FC<{
  onClose: () => void;
  onSave: (document: any) => void;
}> = ({ onClose, onSave }) => {
  const [docData, setDocData] = useState({
    name: '',
    type: 'invoice' as 'invoice' | 'warranty' | 'insurance' | 'manual' | 'other',
    url: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docData.name) return;

    onSave({
      id: Date.now().toString(),
      ...docData,
      uploadDate: new Date().toISOString()
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Documento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doc-name">Nome do Documento</Label>
            <Input
              id="doc-name"
              value={docData.name}
              onChange={(e) => setDocData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Fatura de compra, Manual do proprietário"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="doc-type">Tipo</Label>
            <Select value={docData.type} onValueChange={(value: any) => setDocData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invoice">Fatura</SelectItem>
                <SelectItem value="warranty">Garantia</SelectItem>
                <SelectItem value="insurance">Seguro</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="doc-url">URL/Caminho (opcional)</Label>
            <Input
              id="doc-url"
              value={docData.url}
              onChange={(e) => setDocData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://... ou caminho local"
            />
          </div>

          <Alert>
            <Upload className="h-4 w-4" />
            <AlertDescription>
              Em produção, aqui seria implementado o upload de ficheiros para o servidor.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Enhanced Asset Form
const AssetForm: React.FC<{
  asset?: Asset | null;
  onClose: () => void;
  onSave: (asset: any) => void;
}> = ({ asset, onClose, onSave }) => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: asset?.name || '',
    type: asset?.type || 'veiculo',
    value: asset?.value?.toString() || '',
    purchaseDate: asset?.purchaseDate || new Date().toISOString().split('T')[0],
    purchasePrice: asset?.purchasePrice?.toString() || '',
    notes: asset?.notes || '',
    // Depreciation
    depreciation: {
      method: asset?.depreciation?.method || 'linear',
      rate: asset?.depreciation?.rate?.toString() || '',
      usefulLife: asset?.depreciation?.usefulLife?.toString() || ''
    }
  });

  const [showCostForm, setShowCostForm] = useState(false);
  const [showDocForm, setShowDocForm] = useState(false);
  const [costs, setCosts] = useState(asset?.maintenanceCosts || []);
  const [documents, setDocuments] = useState(asset?.documents || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.value) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e valor atual são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const assetData = {
      ...formData,
      value: parseFloat(formData.value),
      purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
      maintenanceCosts: costs,
      documents: documents,
      depreciation: {
        method: formData.depreciation.method,
        rate: formData.depreciation.rate ? parseFloat(formData.depreciation.rate) : undefined,
        usefulLife: formData.depreciation.usefulLife ? parseInt(formData.depreciation.usefulLife) : undefined
      }
    };

    onSave(assetData);
  };

  const handleAddCost = (cost: any) => {
    setCosts(prev => [...prev, cost]);
    setShowCostForm(false);
    toast({
      title: "Custo adicionado",
      description: "Novo custo associado ao ativo.",
    });
  };

  const handleRemoveCost = (index: number) => {
    setCosts(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddDocument = (doc: any) => {
    setDocuments(prev => [...prev, doc]);
    setShowDocForm(false);
    toast({
      title: "Documento adicionado",
      description: "Novo documento associado ao ativo.",
    });
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const totalCosts = costs.reduce((sum, cost) => sum + cost.amount, 0);
  const currentValue = parseFloat(formData.value) || 0;
  const purchasePrice = parseFloat(formData.purchasePrice) || currentValue;
  const depreciation = purchasePrice - currentValue;
  const depreciationPercentage = purchasePrice > 0 ? (depreciation / purchasePrice) * 100 : 0;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            {asset ? 'Editar Ativo' : 'Novo Ativo'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Básico</TabsTrigger>
            <TabsTrigger value="costs">Custos ({costs.length})</TabsTrigger>
            <TabsTrigger value="documents">Documentos ({documents.length})</TabsTrigger>
            <TabsTrigger value="analysis">Análise</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="basic" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Ativo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: BMW X5, Casa Lisboa"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="veiculo">Veículo</SelectItem>
                      <SelectItem value="imovel">Imóvel</SelectItem>
                      <SelectItem value="eletronico">Eletrônico</SelectItem>
                      <SelectItem value="mobiliario">Mobiliário</SelectItem>
                      <SelectItem value="joia">Joia/Relógio</SelectItem>
                      <SelectItem value="arte">Arte/Coleção</SelectItem>
                      <SelectItem value="equipamento">Equipamento</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Preço de Compra (€)</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    step="0.01"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                    placeholder="Valor pago inicialmente"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">Valor Atual (€)</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="purchaseDate">Data de Aquisição</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                  />
                </div>
              </div>

              {/* Depreciation Configuration */}
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Configuração de Depreciação</h4>
                
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="depreciation-method">Método</Label>
                    <Select 
                      value={formData.depreciation.method} 
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        depreciation: { ...prev.depreciation, method: value as any }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linear">Linear</SelectItem>
                        <SelectItem value="accelerated">Acelerada</SelectItem>
                        <SelectItem value="none">Sem Depreciação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.depreciation.method !== 'none' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="depreciation-rate">Taxa Anual (%)</Label>
                        <Input
                          id="depreciation-rate"
                          type="number"
                          step="0.1"
                          value={formData.depreciation.rate}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            depreciation: { ...prev.depreciation, rate: e.target.value }
                          }))}
                          placeholder="10.0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="depreciation-life">Vida Útil (anos)</Label>
                        <Input
                          id="depreciation-life"
                          type="number"
                          value={formData.depreciation.usefulLife}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            depreciation: { ...prev.depreciation, usefulLife: e.target.value }
                          }))}
                          placeholder="10"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Observações, características especiais, etc..."
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="costs" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Custos Associados</h3>
                <Button type="button" onClick={() => setShowCostForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Custo
                </Button>
              </div>

              {costs.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Wrench className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Nenhum custo registado</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {costs.map((cost, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-100 text-red-600">
                              {cost.type === 'maintenance' && <Wrench className="h-4 w-4" />}
                              {cost.type === 'insurance' && <Shield className="h-4 w-4" />}
                              {cost.type === 'tax' && <Calculator className="h-4 w-4" />}
                              {cost.type === 'other' && <DollarSign className="h-4 w-4" />}
                            </div>
                            <div>
                              <p className="font-medium">{cost.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDatePT(cost.date)} • 
                                {cost.type === 'maintenance' ? ' Manutenção' :
                                 cost.type === 'insurance' ? ' Seguro' :
                                 cost.type === 'tax' ? ' Taxa' : ' Outro'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">€{cost.amount.toFixed(2)}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveCost(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <Card className="border-dashed">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total de Custos:</span>
                        <span className="text-lg font-bold text-red-600">€{totalCosts.toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Documentos</h3>
                <Button type="button" onClick={() => setShowDocForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Documento
                </Button>
              </div>

              {documents.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Nenhum documento associado</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {documents.map((doc, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  {doc.type === 'invoice' ? 'Fatura' :
                                   doc.type === 'warranty' ? 'Garantia' :
                                   doc.type === 'insurance' ? 'Seguro' :
                                   doc.type === 'manual' ? 'Manual' : 'Outro'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatDatePT(doc.uploadDate)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {doc.url && (
                              <Button variant="ghost" size="sm">
                                <Eye className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveDocument(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <h3 className="text-lg font-medium">Análise Financeira</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Valor e Depreciação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Preço de Compra:</span>
                        <span className="font-medium">€{purchasePrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Valor Atual:</span>
                        <span className="font-medium">€{currentValue.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Depreciação:</span>
                        <span className={`font-medium ${depreciation > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {depreciation > 0 ? '-' : '+'}€{Math.abs(depreciation).toFixed(2)}
                        </span>
                      </div>
                      <div className="pt-2">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Depreciação:</span>
                          <span className="text-sm">{depreciationPercentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={Math.min(depreciationPercentage, 100)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Custos Operacionais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total de Custos:</span>
                        <span className="font-medium text-red-600">€{totalCosts.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Custo Total de Propriedade:</span>
                        <span className="font-medium">€{(purchasePrice + totalCosts).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ROI Atual:</span>
                        <span className={`font-medium ${(currentValue - purchasePrice - totalCosts) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {((currentValue - purchasePrice - totalCosts) / (purchasePrice + totalCosts) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {costs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Breakdown de Custos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {['maintenance', 'insurance', 'tax', 'other'].map(type => {
                        const typeCosts = costs.filter(c => c.type === type);
                        const typeTotal = typeCosts.reduce((sum, c) => sum + c.amount, 0);
                        const percentage = totalCosts > 0 ? (typeTotal / totalCosts) * 100 : 0;
                        
                        if (typeTotal === 0) return null;
                        
                        return (
                          <div key={type}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">
                                {type === 'maintenance' ? 'Manutenção' :
                                 type === 'insurance' ? 'Seguro' :
                                 type === 'tax' ? 'Taxas' : 'Outros'}
                              </span>
                              <span className="text-sm">€{typeTotal.toFixed(2)} ({percentage.toFixed(1)}%)</span>
                            </div>
                            <Progress value={percentage} className="h-1" />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {asset ? 'Atualizar' : 'Criar'} Ativo
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>

      {/* Cost Form */}
      {showCostForm && (
        <CostForm
          onClose={() => setShowCostForm(false)}
          onSave={handleAddCost}
        />
      )}

      {/* Document Form */}
      {showDocForm && (
        <DocumentForm
          onClose={() => setShowDocForm(false)}
          onSave={handleAddDocument}
        />
      )}
    </Dialog>
  );
};

// Main Assets Manager Component
export const AssetsManager: React.FC = () => {
  const { assets, addAsset, updateAsset, deleteAsset, transactions } = useFinance();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem a certeza que deseja eliminar este ativo?')) {
      try {
        await deleteAsset(id);
        toast({
          title: "Ativo eliminado",
          description: "Ativo eliminado com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível eliminar o ativo.",
          variant: "destructive",
        });
      }
    }
  };

  const handleFormSave = async (assetData: any) => {
    try {
      if (editingAsset) {
        await updateAsset(editingAsset.id, assetData);
        toast({
          title: "Ativo atualizado",
          description: "Ativo atualizado com sucesso.",
        });
      } else {
        await addAsset(assetData);
        toast({
          title: "Ativo criado",
          description: "Novo ativo criado com sucesso.",
        });
      }
      setShowForm(false);
      setEditingAsset(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível guardar o ativo.",
        variant: "destructive",
      });
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'veiculo': return Car;
      case 'imovel': return Home;
      case 'eletronico': return Laptop;
      case 'joia': return Diamond;
      default: return Car;
    }
  };

  const getAssetTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      veiculo: 'Veículo',
      imovel: 'Imóvel',
      eletronico: 'Eletrônico',
      mobiliario: 'Mobiliário',
      joia: 'Joia/Relógio',
      arte: 'Arte/Coleção',
      equipamento: 'Equipamento',
      outro: 'Outro'
    };
    return labels[type] || type;
  };

  // Calculate enhanced statistics
  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalPurchasePrice = assets.reduce((sum, asset) => sum + (asset.purchasePrice || asset.value), 0);
  const totalCosts = assets.reduce((sum, asset) => 
    sum + (asset.maintenanceCosts?.reduce((costSum, cost) => costSum + cost.amount, 0) || 0), 0);
  const totalDocuments = assets.reduce((sum, asset) => sum + (asset.documents?.length || 0), 0);
  const avgDepreciation = assets.length > 0 ? 
    assets.reduce((sum, asset) => {
      const purchasePrice = asset.purchasePrice || asset.value;
      return sum + ((purchasePrice - asset.value) / purchasePrice * 100);
    }, 0) / assets.length : 0;

  // Asset type distribution
  const typeDistribution = assets.reduce((acc, asset) => {
    acc[asset.type] = (acc[asset.type] || 0) + asset.value;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Ativos</h1>
          <p className="text-muted-foreground">
            Controle completo dos seus bens com custos, documentos e análise de depreciação
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Ativo
        </Button>
      </div>

      {/* Enhanced Summary */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalValue.toFixed(0)}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Qtd. Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assets.length}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Custos Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">€{totalCosts.toFixed(0)}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Depreciação Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {avgDepreciation.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalDocuments}</div>
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
            <div className="grid gap-4 md:grid-cols-4">
              {Object.entries(typeDistribution).map(([type, value]) => {
                const percentage = (value / totalValue) * 100;
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{getAssetTypeLabel(type)}</span>
                      <span className="text-sm text-muted-foreground">€{value.toFixed(0)}</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}% do total</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assets List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Meus Ativos</h2>
        {assets.length === 0 ? (
          <Card className="bg-gradient-card shadow-card">
            <CardContent className="py-12 text-center">
              <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum ativo registado</h3>
              <p className="text-muted-foreground mb-4">
                Comece a registar os seus bens para melhor controlo patrimonial
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Primeiro Ativo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {assets.map((asset) => {
              const Icon = getAssetIcon(asset.type);
              const purchasePrice = asset.purchasePrice || asset.value;
              const depreciation = purchasePrice - asset.value;
              const depreciationPercentage = purchasePrice > 0 ? (depreciation / purchasePrice) * 100 : 0;
              const totalAssetCosts = asset.maintenanceCosts?.reduce((sum, cost) => sum + cost.amount, 0) || 0;
              const associatedTransactions = transactions.filter(t => 
                asset.associatedTransactions?.includes(t.id)
              ).length;

              return (
                <Card key={asset.id} className="bg-gradient-card shadow-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{asset.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{getAssetTypeLabel(asset.type)}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 items-center">
                        {(asset.maintenanceCosts?.length || 0) > 0 && (
                          <Badge variant="outline" className="gap-1">
                            <Wrench className="h-3 w-3" />
                            {asset.maintenanceCosts?.length}
                          </Badge>
                        )}
                        {(asset.documents?.length || 0) > 0 && (
                          <Badge variant="outline" className="gap-1">
                            <FileText className="h-3 w-3" />
                            {asset.documents?.length}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold">€{asset.value.toFixed(0)}</span>
                        {depreciationPercentage > 0 && (
                          <Badge variant={depreciationPercentage > 20 ? "destructive" : "secondary"}>
                            <TrendingDown className="h-3 w-3 mr-1" />
                            {depreciationPercentage.toFixed(1)}%
                          </Badge>
                        )}
                      </div>
                      
                      {totalAssetCosts > 0 && (
                        <div className="p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-red-600">Custos Totais:</span>
                            <span className="font-medium text-red-600">€{totalAssetCosts.toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Adquirido:</span>
                        <span>{formatDatePT(asset.purchaseDate)}</span>
                      </div>
                      
                      {associatedTransactions > 0 && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Transações:</span>
                          <Badge variant="outline">{associatedTransactions}</Badge>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(asset)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(asset.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
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