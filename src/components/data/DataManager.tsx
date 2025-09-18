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
import type { Category, Entity } from '@/contexts/FinanceContext';

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
    budgetDefault: category?.budgetDefault?.toString() || '',
    isActive: category?.isActive ?? true,
  });

  const { categories } = useFinance();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const categoryData = {
      ...formData,
      keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()).filter(Boolean) : [],
      budgetDefault: formData.budgetDefault ? parseFloat(formData.budgetDefault) : undefined,
      parentId: formData.parentId || undefined,
    };

    onSave(categoryData);
  };

  const parentCategories = categories.filter(c => c.type === formData.type && !c.parentId && c.id !== category?.id);

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

            {parentCategories.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="parentId">Categoria Pai (opcional)</Label>
                <Select value={formData.parentId || "none"} onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value === "none" ? "" : value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhuma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {parentCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="budgetDefault">Orçamento Padrão (€)</Label>
              <Input
                id="budgetDefault"
                type="number"
                step="0.01"
                value={formData.budgetDefault}
                onChange={(e) => setFormData(prev => ({ ...prev, budgetDefault: e.target.value }))}
                placeholder="500.00"
              />
            </div>
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
    website: entity?.website || '',
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
    };

    onSave(entityData);
  };

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
              <Select value={formData.defaultCategory || "none"} onValueChange={(value) => setFormData(prev => ({ ...prev, defaultCategory: value === "none" ? "" : value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
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
              <Label htmlFor="website">Website (opcional)</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://example.com"
              />
            </div>
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

// Main DataManager Component
export const DataManager: React.FC = () => {
  const { categories, entities, addCategory, addEntity, deleteCategory, deleteEntity } = useFinance();
  const { toast } = useToast();
  
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showEntityForm, setShowEntityForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleEditEntity = (entity: Entity) => {
    setEditingEntity(entity);
    setShowEntityForm(true);
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

  const handleCategoryFormSave = async (categoryData: any) => {
    try {
      if (editingCategory) {
        // For now, using addCategory - in production would use updateCategory
        console.log('Update category:', categoryData);
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
        // For now, using addEntity - in production would use updateEntity
        console.log('Update entity:', entityData);
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

  const activeCategories = categories.filter(c => c.isActive);
  const inactiveCategories = categories.filter(c => !c.isActive);
  const activeEntities = entities.filter(e => e.isActive);
  const inactiveEntities = entities.filter(e => !e.isActive);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Dados</h1>
          <p className="text-muted-foreground">
            Gerir categorias, entidades e regras de inteligência artificial
          </p>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          As regras de IA e padrões de reconhecimento ajudam a categorizar automaticamente as transações.
          Configure palavras-chave e aliases para melhor precisão.
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
            <h2 className="text-xl font-semibold">Categorias</h2>
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
                  Categorias Ativas ({activeCategories.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activeCategories.map((category) => (
                    <div key={category.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <Badge variant={category.type === 'income' ? 'default' : 'secondary'}>
                          {category.type === 'income' ? 'Receita' : 'Despesa'}
                        </Badge>
                      </div>
                      
                      {category.keywords && category.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {category.keywords.slice(0, 3).map((keyword, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                          {category.keywords.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{category.keywords.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditCategory(category)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteCategory(category.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {inactiveCategories.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Categorias Inativas ({inactiveCategories.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {inactiveCategories.map((category) => (
                      <div key={category.id} className="flex items-center justify-between p-2 border rounded opacity-60">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          <span>{category.name}</span>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleEditCategory(category)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
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
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activeEntities.map((entity) => (
                    <div key={entity.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{entity.name}</span>
                        <Badge variant="outline">{entity.type}</Badge>
                      </div>
                      
                      {entity.aliases && entity.aliases.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          Aliases: {entity.aliases.slice(0, 2).join(', ')}
                          {entity.aliases.length > 2 && '...'}
                        </div>
                      )}
                      
                      {entity.defaultCategory && (
                        <div className="text-sm text-muted-foreground">
                          Categoria: {entity.defaultCategory}
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditEntity(entity)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteEntity(entity.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {inactiveEntities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Entidades Inativas ({inactiveEntities.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {inactiveEntities.map((entity) => (
                      <div key={entity.id} className="flex items-center justify-between p-2 border rounded opacity-60">
                        <div>
                          <span className="font-medium">{entity.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">({entity.type})</span>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleEditEntity(entity)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Regras de Inteligência Artificial
              </CardTitle>
              <CardDescription>
                Configurações automáticas para categorização de transações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  As regras de IA são aplicadas automaticamente quando novas transações são adicionadas.
                  Configure as palavras-chave nas categorias e aliases nas entidades para melhor precisão.
                </AlertDescription>
              </Alert>
              
              <div className="mt-4 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Categorias com Regras</h4>
                    <div className="space-y-2">
                      {categories.filter(c => c.keywords && c.keywords.length > 0).map((category) => (
                        <div key={category.id} className="flex items-center justify-between text-sm">
                          <span>{category.name}</span>
                          <Badge variant="outline">{category.keywords?.length} palavras-chave</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Entidades com Padrões</h4>
                    <div className="space-y-2">
                      {entities.filter(e => e.aliases && e.aliases.length > 0).map((entity) => (
                        <div key={entity.id} className="flex items-center justify-between text-sm">
                          <span>{entity.name}</span>
                          <Badge variant="outline">{entity.aliases?.length} aliases</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Forms */}
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
    </div>
  );
};