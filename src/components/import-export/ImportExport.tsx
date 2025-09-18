import React, { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { useToast } from '../ui/use-toast';
import { Upload, Download, FileText, AlertCircle } from 'lucide-react';
import { TransactionImportWizard } from './TransactionImportWizard';

interface ImportResult {
  success: boolean;
  message: string;
  importedCount: number;
  errors: string[];
}

export const ImportExport: React.FC = () => {
  const { 
    transactions, budgets, accounts, categories,
    addTransaction, addBudget, addAccount 
  } = useFinance();
  const { toast } = useToast();
  
  const [selectedImportType, setSelectedImportType] = useState<string>('transactions');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showWizard, setShowWizard] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
    
    return data;
  };

  const importTransactions = async (data: any[]): Promise<ImportResult> => {
    let importedCount = 0;
    const errors: string[] = [];

    for (const row of data) {
      try {
        // Find first available account if none specified
        const defaultAccount = accounts[0];
        if (!defaultAccount) {
          errors.push('Nenhuma conta disponível para importação');
          continue;
        }

        const transaction = {
          type: (row.type || row.Type || 'expense') as 'income' | 'expense' | 'transfer',
          amount: parseFloat(row.amount || row.Amount || '0'),
          description: row.description || row.Description || 'Importado',
          categoryId: row.categoryId || row.CategoryId || undefined,
          accountId: row.accountId || row.AccountId || defaultAccount.id,
          date: row.date || row.Date || new Date().toISOString().split('T')[0],
          tags: row.tags ? row.tags.split(',').map((tag: string) => tag.trim()) : [],
        };

        if (transaction.amount > 0 && transaction.description) {
          await addTransaction(transaction);
          importedCount++;
        } else {
          errors.push(`Linha inválida: ${JSON.stringify(row)}`);
        }
      } catch (error) {
        errors.push(`Erro ao processar linha: ${error}`);
      }
    }

    return {
      success: importedCount > 0,
      message: `${importedCount} transações importadas com sucesso`,
      importedCount,
      errors
    };
  };

  const importBudgets = async (data: any[]): Promise<ImportResult> => {
    let importedCount = 0;
    const errors: string[] = [];

    for (const row of data) {
      try {
        const budget = {
          name: row.name || row.Name || 'Orçamento Importado',
          amount: parseFloat(row.amount || row.Amount || row.limit || row.Limit || '0'),
          period: (row.period || row.Period || 'monthly') as 'weekly' | 'monthly' | 'quarterly' | 'yearly',
          startDate: row.startDate || row.StartDate || new Date().toISOString().split('T')[0],
          endDate: row.endDate || row.EndDate || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
          categoryId: row.categoryId || row.CategoryId || undefined,
          isActive: true,
          spent: 0,
        };

        if (budget.amount > 0 && budget.name) {
          await addBudget(budget);
          importedCount++;
        } else {
          errors.push(`Linha inválida: ${JSON.stringify(row)}`);
        }
      } catch (error) {
        errors.push(`Erro ao processar linha: ${error}`);
      }
    }

    return {
      success: importedCount > 0,
      message: `${importedCount} orçamentos importados com sucesso`,
      importedCount,
      errors
    };
  };

  const importAccounts = async (data: any[]): Promise<ImportResult> => {
    let importedCount = 0;
    const errors: string[] = [];

    for (const row of data) {
      try {
        const account = {
          name: row.name || row.Name || 'Conta Importada',
          type: (row.type || row.Type || 'other') as 'checking' | 'savings' | 'credit' | 'investment' | 'cash' | 'other',
          balance: parseFloat(row.balance || row.Balance || '0'),
          currency: row.currency || row.Currency || 'EUR',
          bankName: row.bankName || row.BankName || undefined,
          accountNumber: row.accountNumber || row.AccountNumber || undefined,
          isActive: true,
        };

        if (account.name) {
          await addAccount(account);
          importedCount++;
        } else {
          errors.push(`Linha inválida: ${JSON.stringify(row)}`);
        }
      } catch (error) {
        errors.push(`Erro ao processar linha: ${error}`);
      }
    }

    return {
      success: importedCount > 0,
      message: `${importedCount} contas importadas com sucesso`,
      importedCount,
      errors
    };
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo para importar",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileContent = await selectedFile.text();
      const data = parseCSV(fileContent);
      
      if (data.length === 0) {
        toast({
          title: "Erro",
          description: "Arquivo CSV vazio ou inválido",
          variant: "destructive",
        });
        return;
      }

      let result: ImportResult;
      
      switch (selectedImportType) {
        case 'transactions':
          result = await importTransactions(data);
          break;
        case 'budgets':
          result = await importBudgets(data);
          break;
        case 'accounts':
          result = await importAccounts(data);
          break;
        default:
          throw new Error('Tipo de importação não suportado');
      }

      setImportResult(result);
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: result.message,
        });
      } else {
        toast({
          title: "Aviso",
          description: "Importação concluída com alguns erros",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: `Erro durante a importação: ${error}`,
        variant: "destructive",
      });
    }
  };

  const exportTransactions = () => {
    const csvContent = [
      'Type,Amount,Description,CategoryId,AccountId,Date,Tags',
      ...transactions.map(transaction => 
        `${transaction.type},${transaction.amount},"${transaction.description}",${transaction.categoryId},${transaction.accountId},${transaction.date},"${transaction.tags?.join(', ') || ''}"`
      )
    ].join('\n');
    
    downloadCSV(csvContent, 'transactions.csv');
  };

  const exportBudgets = () => {
    const csvContent = [
      'Name,Amount,Period,StartDate,EndDate,CategoryId,IsActive',
      ...budgets.map(budget => 
        `"${budget.name}",${budget.amount},${budget.period},${budget.startDate},${budget.endDate},${budget.categoryId},${budget.isActive}`
      )
    ].join('\n');
    
    downloadCSV(csvContent, 'budgets.csv');
  };

  const exportAccounts = () => {
    const csvContent = [
      'Name,Type,Balance,Currency,BankName,AccountNumber,IsActive',
      ...accounts.map(account => 
        `"${account.name}",${account.type},${account.balance},${account.currency},"${account.bankName || ''}","${account.accountNumber || ''}",${account.isActive}`
      )
    ].join('\n');
    
    downloadCSV(csvContent, 'accounts.csv');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Sucesso",
      description: `Arquivo ${filename} baixado com sucesso`,
    });
  };

  if (showWizard) {
    return <TransactionImportWizard onClose={() => setShowWizard(false)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Importar/Exportar Dados</h1>
      </div>

      <Tabs defaultValue="smart-import" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="smart-import">Smart Import</TabsTrigger>
          <TabsTrigger value="basic-import">Importação Básica</TabsTrigger>
          <TabsTrigger value="export">Exportação</TabsTrigger>
        </TabsList>

        <TabsContent value="smart-import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Smart Import de Transações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Use o assistente inteligente para importar e categorizar automaticamente suas transações.
              </p>
              <Button onClick={() => setShowWizard(true)}>
                Iniciar Smart Import
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="basic-import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Importação Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="import-type">Tipo de Dados</Label>
                <Select value={selectedImportType} onValueChange={setSelectedImportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transactions">Transações</SelectItem>
                    <SelectItem value="budgets">Orçamentos</SelectItem>
                    <SelectItem value="accounts">Contas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file-upload">Arquivo CSV</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                />
              </div>

              <Button 
                onClick={handleImport} 
                disabled={!selectedFile}
                className="w-full"
              >
                Importar Dados
              </Button>

              {importResult && (
                <Alert className={importResult.success ? "border-green-200" : "border-red-200"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div>
                      <p className="font-medium">{importResult.message}</p>
                      {importResult.errors.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Erros encontrados:</p>
                          <ul className="text-sm list-disc list-inside">
                            {importResult.errors.slice(0, 5).map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                            {importResult.errors.length > 5 && (
                              <li>... e mais {importResult.errors.length - 5} erros</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Transações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {transactions.length} transações disponíveis
                </p>
                <Button 
                  onClick={exportTransactions} 
                  variant="outline" 
                  className="w-full"
                  disabled={transactions.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Orçamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {budgets.length} orçamentos disponíveis
                </p>
                <Button 
                  onClick={exportBudgets} 
                  variant="outline" 
                  className="w-full"
                  disabled={budgets.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {accounts.length} contas disponíveis
                </p>
                <Button 
                  onClick={exportAccounts} 
                  variant="outline" 
                  className="w-full"
                  disabled={accounts.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};