import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useFinance } from '@/contexts/FinanceContext';
import { Plus, Edit, Trash2, Tag, Building2, Zap, AlertCircle, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Category, Entity, AIRule } from '@/contexts/FinanceContext';

// Category Form Component
const CategoryForm: React.FC<{
  category?: Category | null;
  onClose: () => void;
  onSave: (category: any) => void;
}> = ({ category, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    type: category?.type || 'expense',
    color: category?.color || '#FF6B6B',
    parentId: category?.parentId || '',
    icon: category?.icon || '',
    keywords: category?.keywords?.join(', ') || '',
    isActive: category?.isActive ?? true,
  });

  const { categories } = useFinance();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const categoryData = {
      ...formData,
      keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()).filter(Boolean) : [],
      parentId: formData.parentId || undefined,
    };

    onSave(categoryData);
  };

  // Get main categories (no parent) for subcategory selection
  const mainCategories = categories.filter(c => c.type === formData.type && !c.parentId && c.id !== category?.id);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" aria-describedby="category-form-description">
        <DialogHeader>
          <DialogTitle>{category ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
        </DialogHeader>
        <p id="category-form-description" className="sr-only">
          Formulário para {category ? 'editar uma categoria existente' : 'criar uma nova categoria'} no sistema financeiro.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Categoria</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'income' | 'expense' }))}>
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
              <Label htmlFor="color">Cor</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-16 h-10"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="#FF6B6B"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Ícone (opcional)</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                placeholder="shopping-cart"
              />
            </div>

            {mainCategories.length > 0 && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="parentId">Categoria Principal (para criar subcategoria)</Label>
                <Select value={formData.parentId || "none"} onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value === "none" ? "" : value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhuma - criar categoria principal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma - criar categoria principal</SelectItem>
                    {mainCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">Palavras-chave para IA (separadas por vírgula)</Label>
            <Textarea
              id="keywords"
              value={formData.keywords}
              onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
              placeholder="supermercado, alimentação, compras"
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Categoria Ativa</Label>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                {category ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Entity Form Component  
const EntityForm: React.FC<{
  entity?: Entity | null;
  onClose: () => void;
  onSave: (entity: any) => void;
}> = ({ entity, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: entity?.name || '',
    type: entity?.type || '',
    aliases: entity?.aliases?.join(', ') || '',
    defaultCategory: entity?.defaultCategory || '',
    defaultSubcategory: entity?.defaultSubcategory || '',
    notes: entity?.notes || '',
    isActive: entity?.isActive ?? true,
  });

  const { categories } = useFinance();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entityData = {
      ...formData,
      aliases: formData.aliases ? formData.aliases.split(',').map(a => a.trim()).filter(Boolean) : [],
      defaultCategory: formData.defaultCategory || undefined,
      defaultSubcategory: formData.defaultSubcategory || undefined,
    };

    onSave(entityData);
  };

  // Get main categories and subcategories
  const mainCategories = categories.filter(c => c.isActive && !c.parentId);
  const selectedMainCategory = mainCategories.find(c => c.name === formData.defaultCategory);
  const subcategories = categories.filter(c => c.isActive && c.parentId === selectedMainCategory?.id);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" aria-describedby="entity-form-description">
        <DialogHeader>
          <DialogTitle>{entity ? 'Editar Entidade' : 'Nova Entidade'}</DialogTitle>
        </DialogHeader>
        <p id="entity-form-description" className="sr-only">
          Formulário para {entity ? 'editar uma entidade existente' : 'criar uma nova entidade'} no sistema financeiro.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Entidade</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                placeholder="Supermercado, Banco, etc."
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="aliases">Nomes Alternativos (separados por vírgula)</Label>
              <Input
                id="aliases"
                value={formData.aliases}
                onChange={(e) => setFormData(prev => ({ ...prev, aliases: e.target.value }))}
                placeholder="Continente, Cont., Continente Modelo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultCategory">Categoria Padrão</Label>
              <Select value={formData.defaultCategory || "none"} onValueChange={(value) => setFormData(prev => ({ ...prev, defaultCategory: value === "none" ? "" : value, defaultSubcategory: "" }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {mainCategories.map((category) => (
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

            {subcategories.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="defaultSubcategory">Subcategoria Padrão</Label>
                <Select value={formData.defaultSubcategory || "none"} onValueChange={(value) => setFormData(prev => ({ ...prev, defaultSubcategory: value === "none" ? "" : value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma subcategoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {subcategories.map((category) => (
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
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Informações adicionais sobre a entidade"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Entidade Ativa</Label>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                {entity ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// AI Rule Form Component
const AIRuleForm: React.FC<{
  rule?: AIRule | null;
  onClose: () => void;
  onSave: (rule: any) => void;
}> = ({ rule, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: rule?.name || '',
    description: rule?.description || '',
    condition: rule?.condition || '',
    targetCategory: rule?.targetCategory || '',
    targetSubcategory: rule?.targetSubcategory || '',
    targetEntity: rule?.targetEntity || '',
    confidence: rule?.confidence || 80,
    priority: rule?.priority || 1,
    isActive: rule?.isActive ?? true,
  });

  const { categories, entities } = useFinance();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const ruleData = {
      ...formData,
      confidence: formData.confidence / 100, // Convert percentage to decimal
      targetCategory: formData.targetCategory || undefined,
      targetSubcategory: formData.targetSubcategory || undefined,
      targetEntity: formData.targetEntity || undefined,
    };

    onSave(ruleData);
  };

  const mainCategories = categories.filter(c => c.isActive && !c.parentId);
  const selectedMainCategory = mainCategories.find(c => c.name === formData.targetCategory);
  const subcategories = categories.filter(c => c.isActive && c.parentId === selectedMainCategory?.id);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" aria-describedby="ai-rule-form-description">
        <DialogHeader>
          <DialogTitle>{rule ? 'Editar Regra IA' : 'Nova Regra IA'}</DialogTitle>
        </DialogHeader>
        <p id="ai-rule-form-description" className="sr-only">
          Formulário para {rule ? 'editar uma regra de IA existente' : 'criar uma nova regra de IA'} no sistema financeiro.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Regra</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade (1-10)</Label>
              <Input
                id="priority"
                type="number"
                min="1"
                max="10"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição da regra"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition">Condição</Label>
            <Textarea
              id="condition"
              value={formData.condition}
              onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
              placeholder="description contains 'netflix' OR entity equals 'Netflix'"
              rows={3}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="targetCategory">Categoria Alvo</Label>
              <Select value={formData.targetCategory || "none"} onValueChange={(value) => setFormData(prev => ({ ...prev, targetCategory: value === "none" ? "" : value, targetSubcategory: "" }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {mainCategories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {subcategories.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="targetSubcategory">Subcategoria Alvo</Label>
                <Select value={formData.targetSubcategory || "none"} onValueChange={(value) => setFormData(prev => ({ ...prev, targetSubcategory: value === "none" ? "" : value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {subcategories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="targetEntity">Entidade Alvo</Label>
              <Select value={formData.targetEntity || "none"} onValueChange={(value) => setFormData(prev => ({ ...prev, targetEntity: value === "none" ? "" : value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {entities.filter(e => e.isActive).map((entity) => (
                    <SelectItem key={entity.id} value={entity.name}>
                      {entity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confidence">Confiança ({formData.confidence}%)</Label>
            <Input
              id="confidence"
              type="range"
              min="1"
              max="100"
              value={formData.confidence}
              onChange={(e) => setFormData(prev => ({ ...prev, confidence: parseInt(e.target.value) }))}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Regra Ativa</Label>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                {rule ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Main DataManager Component
export const DataManager: React.FC = () => {
  const { categories, entities, aiRules, addCategory, updateCategory, addEntity, updateEntity, addAIRule, updateAIRule, deleteCategory, deleteEntity, deleteAIRule } = useFinance();
  const { toast } = useToast();
  
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showEntityForm, setShowEntityForm] = useState(false);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [editingRule, setEditingRule] = useState<AIRule | null>(null);

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleEditEntity = (entity: Entity) => {
    setEditingEntity(entity);
    setShowEntityForm(true);
  };

  const handleEditRule = (rule: AIRule) => {
    setEditingRule(rule);
    setShowRuleForm(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Tem a certeza que deseja eliminar esta categoria?')) {
      try {
        await deleteCategory(id);
        toast({
          title: "Categoria eliminada",
          description: "A categoria foi eliminada com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível eliminar a categoria.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteEntity = async (id: string) => {
    if (window.confirm('Tem a certeza que deseja eliminar esta entidade?')) {
      try {
        await deleteEntity(id);
        toast({
          title: "Entidade eliminada",
          description: "A entidade foi eliminada com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível eliminar a entidade.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (window.confirm('Tem a certeza que deseja eliminar esta regra?')) {
      try {
        await deleteAIRule(id);
        toast({
          title: "Regra eliminada",
          description: "A regra foi eliminada com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível eliminar a regra.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCategoryFormSave = async (categoryData: any) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData);
      } else {
        await addCategory(categoryData);
      }
      
      setShowCategoryForm(false);
      setEditingCategory(null);
      toast({
        title: editingCategory ? "Categoria atualizada" : "Categoria criada",
        description: `A categoria foi ${editingCategory ? 'atualizada' : 'criada'} com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível guardar a categoria.",
        variant: "destructive",
      });
    }
  };

  const handleEntityFormSave = async (entityData: any) => {
    try {
      if (editingEntity) {
        await updateEntity(editingEntity.id, entityData);
      } else {
        await addEntity(entityData);
      }
      
      setShowEntityForm(false);
      setEditingEntity(null);
      toast({
        title: editingEntity ? "Entidade atualizada" : "Entidade criada",
        description: `A entidade foi ${editingEntity ? 'atualizada' : 'criada'} com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível guardar a entidade.",
        variant: "destructive",
      });
    }
  };

  const handleRuleFormSave = async (ruleData: any) => {
    try {
      if (editingRule) {
        await updateAIRule(editingRule.id, ruleData);
      } else {
        await addAIRule(ruleData);
      }
      
      setShowRuleForm(false);
      setEditingRule(null);
      toast({
        title: editingRule ? "Regra atualizada" : "Regra criada",
        description: `A regra foi ${editingRule ? 'atualizada' : 'criada'} com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível guardar a regra.",
        variant: "destructive",
      });
    }
  };

  const activeCategories = categories.filter(c => c.isActive);
  const inactiveCategories = categories.filter(c => !c.isActive);
  const activeEntities = entities.filter(e => e.isActive);
  const inactiveEntities = entities.filter(e => !e.isActive);
  const activeRules = aiRules.filter(r => r.isActive);
  const inactiveRules = aiRules.filter(r => !r.isActive);

  // Separate main categories and subcategories
  const mainCategories = activeCategories.filter(c => !c.parentId);
  const subcategories = activeCategories.filter(c => c.parentId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Dados</h1>
          <p className="text-muted-foreground">
            Gerir categorias, subcategorias, entidades e regras de inteligência artificial
          </p>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          As regras de IA e padrões de reconhecimento ajudam a categorizar automaticamente as transações.
          Configure palavras-chave, aliases e condições para melhor precisão.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="entities">Entidades</TabsTrigger>
          <TabsTrigger value="rules">Regras IA</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Categorias e Subcategorias</h2>
            <Button onClick={() => setShowCategoryForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </div>

          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Categorias Principais ({mainCategories.length})
                </CardTitle>
                <CardDescription>
                  Categorias principais de despesas e receitas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mainCategories.map((category) => {
                    const categorySubcategories = subcategories.filter(s => s.parentId === category.id);
                    return (
                      <div key={category.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            />
                            <div>
                              <span className="font-medium">{category.name}</span>
                              <Badge variant={category.type === 'income' ? 'default' : 'secondary'} className="ml-2">
                                {category.type === 'income' ? 'Receita' : 'Despesa'}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCategory(category)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {categorySubcategories.length > 0 && (
                          <div className="ml-7 space-y-2">
                            <p className="text-sm text-muted-foreground">Subcategorias:</p>
                            <div className="grid gap-2">
                              {categorySubcategories.map((subcategory) => (
                                <div key={subcategory.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-3 h-3 rounded-full" 
                                      style={{ backgroundColor: subcategory.color }}
                                    />
                                    <span className="text-sm">{subcategory.name}</span>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditCategory(subcategory)}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteCategory(subcategory.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="entities" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Entidades</h2>
            <Button onClick={() => setShowEntityForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Entidade
            </Button>
          </div>

          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Entidades Ativas ({activeEntities.length})
                </CardTitle>
                <CardDescription>
                  Empresas, lojas e organizações que aparecem nas transações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeEntities.map((entity) => (
                    <div key={entity.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{entity.name}</span>
                          <Badge variant="outline">{entity.type}</Badge>
                        </div>
                        {entity.defaultCategory && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Categoria padrão: {entity.defaultCategory}
                            {entity.defaultSubcategory && ` → ${entity.defaultSubcategory}`}
                          </p>
                        )}
                        {entity.aliases && entity.aliases.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            Aliases: {entity.aliases.join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditEntity(entity)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteEntity(entity.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Regras de IA</h2>
            <Button onClick={() => setShowRuleForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Regra
            </Button>
          </div>

          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Regras Ativas ({activeRules.length})
                </CardTitle>
                <CardDescription>
                  Regras que ajudam a categorizar automaticamente as transações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeRules.map((rule) => (
                    <div key={rule.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">Prioridade {rule.priority}</Badge>
                          <span className="font-medium">{rule.name}</span>
                          <Badge variant="secondary">{Math.round((rule.confidence || 0) * 100)}% confiança</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditRule(rule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRule(rule.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">{rule.description}</p>
                      <p className="text-sm font-mono bg-muted p-2 rounded">{rule.condition}</p>
                      
                      <div className="flex gap-4 mt-2 text-sm">
                        {rule.targetCategory && (
                          <span>Categoria: <strong>{rule.targetCategory}</strong></span>
                        )}
                        {rule.targetSubcategory && (
                          <span>Subcategoria: <strong>{rule.targetSubcategory}</strong></span>
                        )}
                        {rule.targetEntity && (
                          <span>Entidade: <strong>{rule.targetEntity}</strong></span>
                        )}
                      </div>
                      
                      {rule.successRate && (
                        <div className="mt-2">
                          <Badge variant="default">{Math.round(rule.successRate * 100)}% sucesso</Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {showCategoryForm && (
        <CategoryForm
          category={editingCategory}
          onClose={() => {
            setShowCategoryForm(false);
            setEditingCategory(null);
          }}
          onSave={handleCategoryFormSave}
        />
      )}

      {showEntityForm && (
        <EntityForm
          entity={editingEntity}
          onClose={() => {
            setShowEntityForm(false);
            setEditingEntity(null);
          }}
          onSave={handleEntityFormSave}
        />
      )}

      {showRuleForm && (
        <AIRuleForm
          rule={editingRule}
          onClose={() => {
            setShowRuleForm(false);
            setEditingRule(null);
          }}
          onSave={handleRuleFormSave}
        />
      )}
    </div>
  );
};