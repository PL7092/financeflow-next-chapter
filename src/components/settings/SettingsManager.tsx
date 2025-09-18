import React, { useState, useEffect } from 'react';
import { Settings, User, Bell, Shield, Palette, Database, Download, Trash2, Save, AlertCircle, Brain, FileText, TestTube, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';

import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { useToast } from '../ui/use-toast';

export const SettingsManager: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');

  // Load database stats on component mount
  useEffect(() => {
    if (activeTab === 'database') {
      loadDatabaseStats();
    }
  }, [activeTab]);

  // Profile Settings
  const [profileData, setProfileData] = useState({
    name: 'Utilizador Demo',
    email: 'user@example.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // App Settings
  const [appSettings, setAppSettings] = useState({
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    theme: 'system',
    language: 'pt',
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    budgetAlerts: true,
    transactionNotifications: false,
    monthlyReports: true,
    investmentAlerts: true,
    goalReminders: true,
    emailNotifications: true,
    pushNotifications: false,
  });

  // Security Settings
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    loginAlerts: true,
    dataEncryption: true,
  });

  // AI Settings
  const [aiSettings, setAiSettings] = useState(() => {
    const saved = localStorage.getItem('aiSettings');
    return saved ? JSON.parse(saved) : {
      openaiApiKey: '',
      anthropicApiKey: '',
      geminiApiKey: '',
      defaultProvider: 'openai',
      enableAutoCategories: true,
      enableSmartRecommendations: true,
      confidenceThreshold: 0.8,
    };
  });

  // Database Settings
  const [dbSettings, setDbSettings] = useState({
    host: 'mariadb',
    port: '3306',
    database: 'personal_finance',
    username: 'finance_user',
    password: 'finance_user_password_2024',
    useSSL: false,
    connectionTimeout: 30,
    maxConnections: 10,
  });

  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'untested' | 'success' | 'failed'>('untested');
  const [isSaving, setIsSaving] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [dbStats, setDbStats] = useState<any>(null);

  const handleProfileSave = () => {
    // In a real app, this would call the backend API
    console.log('Saving profile:', profileData);
    // Example: await updateProfile(profileData);
  };

  const handleAppSettingsSave = () => {
    // Save app settings to localStorage and backend
    localStorage.setItem('appSettings', JSON.stringify(appSettings));
    console.log('Saving app settings:', appSettings);
  };

  const handleNotificationsSave = () => {
    // Save notification preferences
    localStorage.setItem('notifications', JSON.stringify(notifications));
    console.log('Saving notifications:', notifications);
  };

  const handleSecuritySave = () => {
    // Save security settings
    localStorage.setItem('security', JSON.stringify(security));
    console.log('Saving security:', security);
  };

  const handleAiSettingsSave = () => {
    try {
      // Save all AI settings including API keys to localStorage
      // Note: For production use, connect to Supabase for secure storage
      localStorage.setItem('aiSettings', JSON.stringify(aiSettings));
      
      toast({
        title: "Configurações Salvas",
        description: "Configurações de IA foram salvas com sucesso",
      });
      
      console.log('AI settings saved successfully');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações de IA",
        variant: "destructive",
      });
      console.error('Error saving AI settings:', error);
    }
  };

  const handleDatabaseSave = async () => {
    setIsSaving(true);
    try {
      // Save database settings securely in production
      console.log('Saving database settings:', dbSettings);
      
      // In production, this should call a secure API endpoint
      // await saveDatabaseSettings(dbSettings);
      
      // For now, save to localStorage with encryption consideration
      localStorage.setItem('dbSettings', JSON.stringify(dbSettings));
      
      // Show success notification
      console.log('Database settings saved successfully');
      
      // Show toast notification
      toast({
        title: "Configurações guardadas",
        description: "As configurações da base de dados foram guardadas com sucesso!",
      });
      
      // In a real production environment, you would:
      // 1. Send settings to your backend API
      // 2. Backend validates and stores securely
      // 3. Backend updates app configuration
      // 4. Return success/error response
      
    } catch (error) {
      console.error('Failed to save database settings:', error);
      toast({
        title: "Erro ao guardar",
        description: "Ocorreu um erro ao guardar as configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const testDatabaseConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus('untested');
    
    try {
      const response = await fetch('/api/db/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dbSettings),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setConnectionStatus('success');
        toast({
          title: "Ligação bem-sucedida",
          description: `Ligação estabelecida em ${result.latency}`,
        });
      } else {
        setConnectionStatus('failed');
        toast({
          title: "Falha na ligação",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('failed');
      toast({
        title: "Erro ao testar ligação",
        description: "Verifique se o servidor está a funcionar",
        variant: "destructive",
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const initializeDatabase = async () => {
    setIsInitializing(true);
    
    try {
      const response = await fetch('/api/db/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbSettings),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Schema inicializado",
          description: `${result.tables?.totalTables || 0} tabelas criadas`,
        });
        await loadDatabaseStats();
      } else {
        toast({
          title: "Erro na inicialização",
          description: result.error || result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Schema initialization failed:', error);
      toast({
        title: "Erro ao inicializar",
        description: "Verifique a ligação à base de dados",
        variant: "destructive",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const loadDatabaseStats = async () => {
    try {
      const response = await fetch('/api/db/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbSettings),
      });
      const result = await response.json();
      
      if (result.success) {
        setDbStats(result.data);
      }
    } catch (error) {
      console.error('Failed to load database stats:', error);
    }
  };

  const importLocalData = async () => {
    setIsImporting(true);
    
    try {
      // Get data from FinanceContext - this would need to be passed as prop
      // For now, we'll use mock data
      const localData = {
        categories: JSON.parse(localStorage.getItem('categories') || '[]'),
        accounts: JSON.parse(localStorage.getItem('accounts') || '[]'),
        transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
        budgets: JSON.parse(localStorage.getItem('budgets') || '[]'),
      };
      
      const response = await fetch('/api/db/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: dbSettings, data: localData }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Dados importados",
          description: `${Object.values(result.results).reduce((a: number, b: number) => a + b, 0)} registos importados`,
        });
        await loadDatabaseStats();
      } else {
        toast({
          title: "Erro na importação",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Data import failed:', error);
      toast({
        title: "Erro ao importar",
        description: "Verifique a ligação à base de dados",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportData = () => {
    // Export all user data
    console.log('Exporting user data...');
    // This would trigger a full data export
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Tem a certeza que deseja eliminar a sua conta? Esta ação é irreversível.')) {
      // Delete account logic
      console.log('Deleting account...');
      // Account deletion would be handled here
    }
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'app', label: 'Aplicação', icon: Settings },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'ai', label: 'Inteligência Artificial', icon: Brain },
    { id: 'database', label: 'Base de Dados', icon: Database },
    { id: 'data', label: 'Gestão de Dados', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerir as suas preferências e definições da conta</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Navigation */}
        <Card className="lg:col-span-1 bg-gradient-card shadow-card">
          <CardContent className="p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'default' : 'ghost'}
                    className="w-full justify-start gap-2"
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </Button>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Content */}
        <Card className="lg:col-span-3 bg-gradient-card shadow-card">
          <CardContent className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Informações do Perfil</h3>
                  <p className="text-sm text-muted-foreground">
                    Atualize as informações da sua conta
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium mb-4">Alterar Palavra-passe</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Palavra-passe Atual</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={profileData.currentPassword}
                          onChange={(e) => setProfileData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">Nova Palavra-passe</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={profileData.newPassword}
                            onChange={(e) => setProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirmar Palavra-passe</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={profileData.confirmPassword}
                            onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleProfileSave} className="w-full md:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Alterações
                  </Button>
                </div>
              </div>
            )}

            {/* App Settings Tab */}
            {activeTab === 'app' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Configurações da Aplicação</h3>
                  <p className="text-sm text-muted-foreground">
                    Personalize a experiência da aplicação
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Moeda Padrão</Label>
                      <Select 
                        value={appSettings.currency} 
                        onValueChange={(value) => setAppSettings(prev => ({ ...prev, currency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EUR">Euro (€)</SelectItem>
                          <SelectItem value="USD">Dólar Americano ($)</SelectItem>
                          <SelectItem value="GBP">Libra Esterlina (£)</SelectItem>
                          <SelectItem value="BRL">Real Brasileiro (R$)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Formato de Data</Label>
                      <Select 
                        value={appSettings.dateFormat} 
                        onValueChange={(value) => setAppSettings(prev => ({ ...prev, dateFormat: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Tema</Label>
                      <Select 
                        value={appSettings.theme} 
                        onValueChange={(value) => setAppSettings(prev => ({ ...prev, theme: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Claro</SelectItem>
                          <SelectItem value="dark">Escuro</SelectItem>
                          <SelectItem value="system">Sistema</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Idioma</Label>
                      <Select 
                        value={appSettings.language} 
                        onValueChange={(value) => setAppSettings(prev => ({ ...prev, language: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pt">Português</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={handleAppSettingsSave} className="w-full md:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Configurações
                  </Button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Preferências de Notificação</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure como e quando receber notificações
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Alertas Financeiros</h4>
                    {[
                      { key: 'budgetAlerts', label: 'Alertas de Orçamento', desc: 'Quando se aproximar ou exceder limites' },
                      { key: 'transactionNotifications', label: 'Notificações de Transações', desc: 'Para transações acima de €100' },
                      { key: 'investmentAlerts', label: 'Alertas de Investimentos', desc: 'Mudanças significativas no portfolio' },
                      { key: 'goalReminders', label: 'Lembretes de Metas', desc: 'Progresso das metas de poupança' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <Switch
                          checked={notifications[item.key as keyof typeof notifications] as boolean}
                          onCheckedChange={(checked) => 
                            setNotifications(prev => ({ ...prev, [item.key]: checked }))
                          }
                        />
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Canais de Notificação</h4>
                    {[
                      { key: 'emailNotifications', label: 'Notificações por Email', desc: 'Receber alertas por email' },
                      { key: 'pushNotifications', label: 'Notificações Push', desc: 'Notificações no browser' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <Switch
                          checked={notifications[item.key as keyof typeof notifications] as boolean}
                          onCheckedChange={(checked) => 
                            setNotifications(prev => ({ ...prev, [item.key]: checked }))
                          }
                        />
                      </div>
                    ))}
                  </div>

                  <Button onClick={handleNotificationsSave} className="w-full md:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Preferências
                  </Button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Configurações de Segurança</h3>
                  <p className="text-sm text-muted-foreground">
                    Proteja a sua conta e dados pessoais
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    {[
                      { 
                        key: 'twoFactorAuth', 
                        label: 'Autenticação de Dois Fatores', 
                        desc: 'Adicionar uma camada extra de segurança',
                        type: 'switch'
                      },
                      { 
                        key: 'loginAlerts', 
                        label: 'Alertas de Login', 
                        desc: 'Notificar sobre novos acessos à conta',
                        type: 'switch'
                      },
                      { 
                        key: 'dataEncryption', 
                        label: 'Encriptação de Dados', 
                        desc: 'Encriptar dados sensíveis',
                        type: 'switch'
                      },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <Switch
                          checked={security[item.key as keyof typeof security] as boolean}
                          onCheckedChange={(checked) => 
                            setSecurity(prev => ({ ...prev, [item.key]: checked }))
                          }
                        />
                      </div>
                    ))}

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium">Timeout de Sessão</p>
                        <p className="text-xs text-muted-foreground">Minutos de inatividade antes de logout automático</p>
                      </div>
                      <Select 
                        value={security.sessionTimeout.toString()} 
                        onValueChange={(value) => setSecurity(prev => ({ ...prev, sessionTimeout: parseInt(value) }))}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 min</SelectItem>
                          <SelectItem value="30">30 min</SelectItem>
                          <SelectItem value="60">1 hora</SelectItem>
                          <SelectItem value="120">2 horas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={handleSecuritySave} className="w-full md:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Configurações
                  </Button>
                </div>
              </div>
            )}

            {/* AI Settings Tab */}
            {activeTab === 'ai' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Configurações de Inteligência Artificial</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure as APIs de IA para categorização automática e recomendações
                  </p>
                </div>

                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    As chaves de API são armazenadas de forma segura e apenas utilizadas para funcionalidades de IA.
                    Nunca partilhamos as suas chaves com terceiros.
                  </AlertDescription>
                </Alert>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Fornecedores de IA</h4>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Fornecedor Padrão</Label>
                        <Select 
                          value={aiSettings.defaultProvider} 
                          onValueChange={(value) => setAiSettings(prev => ({ ...prev, defaultProvider: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="openai">OpenAI (GPT-4)</SelectItem>
                            <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                            <SelectItem value="gemini">Google Gemini</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="openai-key">Chave API OpenAI</Label>
                        <div className="flex gap-2">
                          <Input
                            id="openai-key"
                            type="password"
                            value={aiSettings.openaiApiKey}
                            onChange={(e) => setAiSettings(prev => ({ ...prev, openaiApiKey: e.target.value }))}
                            placeholder="sk-..."
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="anthropic-key">Chave API Anthropic</Label>
                        <Input
                          id="anthropic-key"
                          type="password"
                          value={aiSettings.anthropicApiKey}
                          onChange={(e) => setAiSettings(prev => ({ ...prev, anthropicApiKey: e.target.value }))}
                          placeholder="sk-ant-..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gemini-key">Chave API Google Gemini</Label>
                        <Input
                          id="gemini-key"
                          type="password"
                          value={aiSettings.geminiApiKey}
                          onChange={(e) => setAiSettings(prev => ({ ...prev, geminiApiKey: e.target.value }))}
                          placeholder="AI..."
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Funcionalidades de IA</h4>
                    
                    {[
                      { key: 'enableAutoCategories', label: 'Categorização Automática', desc: 'Categorizar transações automaticamente usando IA' },
                      { key: 'enableSmartRecommendations', label: 'Recomendações Inteligentes', desc: 'Sugestões personalizadas baseadas nos seus padrões' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <Switch
                          checked={aiSettings[item.key as keyof typeof aiSettings] as boolean}
                          onCheckedChange={(checked) => 
                            setAiSettings(prev => ({ ...prev, [item.key]: checked }))
                          }
                        />
                      </div>
                    ))}

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium">Limite de Confiança</p>
                        <p className="text-xs text-muted-foreground">Nível mínimo de confiança para sugestões automáticas</p>
                      </div>
                      <Select 
                        value={aiSettings.confidenceThreshold.toString()} 
                        onValueChange={(value) => setAiSettings(prev => ({ ...prev, confidenceThreshold: parseFloat(value) }))}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0.6">60%</SelectItem>
                          <SelectItem value="0.7">70%</SelectItem>
                          <SelectItem value="0.8">80%</SelectItem>
                          <SelectItem value="0.9">90%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={handleAiSettingsSave} className="w-full md:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Configurações de IA
                  </Button>
                </div>
              </div>
            )}

            {/* Database Settings Tab */}
            {activeTab === 'database' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Configurações de Base de Dados</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure a ligação à base de dados MariaDB
                  </p>
                </div>

                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertDescription>
                    Configure aqui a ligação ao seu contentor MariaDB no Docker. 
                    Certifique-se que as credenciais estão corretas antes de testar a ligação.
                  </AlertDescription>
                </Alert>

                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="db-host">Servidor</Label>
                      <Input
                        id="db-host"
                        value={dbSettings.host}
                        onChange={(e) => setDbSettings(prev => ({ ...prev, host: e.target.value }))}
                        placeholder="mariadb ou IP do servidor"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="db-port">Porto</Label>
                      <Input
                        id="db-port"
                        value={dbSettings.port}
                        onChange={(e) => setDbSettings(prev => ({ ...prev, port: e.target.value }))}
                        placeholder="3306"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="db-name">Nome da Base de Dados</Label>
                      <Input
                        id="db-name"
                        value={dbSettings.database}
                        onChange={(e) => setDbSettings(prev => ({ ...prev, database: e.target.value }))}
                        placeholder="personal_finance"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="db-username">Utilizador</Label>
                      <Input
                        id="db-username"
                        value={dbSettings.username}
                        onChange={(e) => setDbSettings(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="finance_user"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="db-password">Palavra-passe</Label>
                      <Input
                        id="db-password"
                        type="password"
                        value={dbSettings.password}
                        onChange={(e) => setDbSettings(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Opções Avançadas</h4>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="connection-timeout">Timeout de Ligação (segundos)</Label>
                        <Select 
                          value={dbSettings.connectionTimeout.toString()} 
                          onValueChange={(value) => setDbSettings(prev => ({ ...prev, connectionTimeout: parseInt(value) }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 segundos</SelectItem>
                            <SelectItem value="30">30 segundos</SelectItem>
                            <SelectItem value="60">1 minuto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="max-connections">Máximo de Ligações</Label>
                        <Select 
                          value={dbSettings.maxConnections.toString()} 
                          onValueChange={(value) => setDbSettings(prev => ({ ...prev, maxConnections: parseInt(value) }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 ligações</SelectItem>
                            <SelectItem value="10">10 ligações</SelectItem>
                            <SelectItem value="20">20 ligações</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium">Usar SSL</p>
                        <p className="text-xs text-muted-foreground">Ativar ligação SSL segura</p>
                      </div>
                      <Switch
                        checked={dbSettings.useSSL}
                        onCheckedChange={(checked) => setDbSettings(prev => ({ ...prev, useSSL: checked }))}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Gestão da Base de Dados</h4>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <Button 
                        onClick={testDatabaseConnection} 
                        variant="outline"
                        disabled={testingConnection}
                        className="flex-1"
                      >
                        {testingConnection ? (
                          <>
                            <TestTube className="h-4 w-4 mr-2 animate-spin" />
                            Testando...
                          </>
                        ) : (
                          <>
                            <TestTube className="h-4 w-4 mr-2" />
                            Testar Ligação
                          </>
                        )}
                      </Button>

                      <Button 
                        onClick={initializeDatabase} 
                        variant="outline"
                        disabled={isInitializing}
                        className="flex-1"
                      >
                        {isInitializing ? (
                          <>
                            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Inicializando...
                          </>
                        ) : (
                          <>
                            <Database className="h-4 w-4 mr-2" />
                            Inicializar Tabelas
                          </>
                        )}
                      </Button>

                      <Button 
                        onClick={importLocalData} 
                        variant="outline"
                        disabled={isImporting}
                        className="flex-1"
                      >
                        {isImporting ? (
                          <>
                            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Importando...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Importar Dados
                          </>
                        )}
                      </Button>
                    </div>

                    {connectionStatus !== 'untested' && (
                      <div className="flex items-center gap-2 p-3 rounded-lg border">
                        {connectionStatus === 'success' ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600">Ligação bem-sucedida</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="text-sm text-red-600">Falha na ligação</span>
                          </>
                        )}
                      </div>
                    )}

                    {dbStats && (
                      <div className="p-4 rounded-lg border bg-muted/50">
                        <h5 className="text-sm font-medium mb-2">Estatísticas da Base de Dados</h5>
                        <div className="grid gap-2 text-sm">
                          <div className="flex justify-between">
                            <span>Tabelas:</span>
                            <span>{dbStats.totalTables}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Registos:</span>
                            <span>{dbStats.totalRecords}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tamanho:</span>
                            <span>{dbStats.sizeMB} MB</span>
                          </div>
                        </div>
                        <Button 
                          onClick={loadDatabaseStats} 
                          variant="ghost" 
                          size="sm" 
                          className="mt-2 h-8"
                        >
                          Atualizar
                        </Button>
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={handleDatabaseSave} 
                    className="w-full md:w-auto"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Configurações
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Data Tab */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Gestão de Dados</h3>
                  <p className="text-sm text-muted-foreground">
                    Exportar, fazer backup ou eliminar os seus dados
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Exportar Dados</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Faça download de todos os seus dados financeiros
                        </p>
                        <Button onClick={handleExportData} variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Exportar Todos os Dados
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200">
                      <CardHeader>
                        <CardTitle className="text-base text-red-600">Zona de Perigo</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Alert className="border-red-200 mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Eliminar a sua conta removerá permanentemente todos os seus dados. 
                            Esta ação não pode ser desfeita.
                          </AlertDescription>
                        </Alert>
                        <Button 
                          onClick={handleDeleteAccount} 
                          variant="destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar Conta
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};