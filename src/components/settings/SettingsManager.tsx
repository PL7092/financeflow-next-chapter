import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Palette, Database, Download, Trash2, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';

export const SettingsManager: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile Settings
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
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

  const handleExportData = () => {
    // Export all user data
    console.log('Exporting user data...');
    // This would trigger a full data export
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Tem a certeza que deseja eliminar a sua conta? Esta ação é irreversível.')) {
      // Delete account logic
      console.log('Deleting account...');
      logout();
    }
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'app', label: 'Aplicação', icon: Settings },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'data', label: 'Dados', icon: Database },
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