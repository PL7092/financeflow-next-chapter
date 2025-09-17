import React, { useState } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';

interface ImportResult {
  success: boolean;
  message: string;
  importedCount: number;
  errors: string[];
}

export const ImportExport: React.FC = () => {
  const { transactions, budgets, accounts, addTransaction, addBudget, addAccount } = useFinance();
  const [importType, setImportType] = useState('transactions');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.replace(/"/g, '').trim());
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      return obj;
    });

    return data;
  };

  const importTransactions = async (data: any[]): Promise<ImportResult> => {
    let importedCount = 0;
    const errors: string[] = [];

    for (const row of data) {
      try {
        const transaction = {
          type: (row.Tipo?.toLowerCase() === 'receita' ? 'income' : 
                row.Tipo?.toLowerCase() === 'despesa' ? 'expense' : 
                row.Tipo?.toLowerCase() === 'transferência' ? 'transfer' : 'expense') as 'income' | 'expense' | 'transfer',
          amount: parseFloat(row.Valor || row.Amount || '0'),
          description: row.Descrição || row.Description || 'Importado',
          category: row.Categoria || row.Category || 'Outros',
          account: row.Conta || row.Account || accounts[0]?.name || 'Conta Principal',
          date: row.Data || row.Date || new Date().toISOString().split('T')[0],
          tags: row.Tags ? row.Tags.split(';') : undefined
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
          category: row.Categoria || row.Category || '',
          limit: parseFloat(row.Limite || row.Limit || '0'),
          month: parseInt(row.Mês || row.Month || new Date().getMonth().toString()),
          year: parseInt(row.Ano || row.Year || new Date().getFullYear().toString()),
          spent: parseFloat(row.Gasto || row.Spent || '0')
        };

        if (budget.category && budget.limit > 0) {
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
          name: row.Nome || row.Name || '',
          type: row.Tipo || row.Type || 'checking',
          balance: parseFloat(row.Saldo || row.Balance || '0'),
          currency: row.Moeda || row.Currency || 'EUR'
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
    if (!selectedFile) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const fileText = await selectedFile.text();
      const data = parseCSV(fileText);

      let result: ImportResult;
      
      switch (importType) {
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
          result = { success: false, message: 'Tipo de importação não suportado', importedCount: 0, errors: [] };
      }

      setImportResult(result);
    } catch (error) {
      setImportResult({
        success: false,
        message: 'Erro ao processar arquivo',
        importedCount: 0,
        errors: [String(error)]
      });
    } finally {
      setIsImporting(false);
    }
  };

  const exportTransactions = () => {
    const csvContent = [
      ['Data', 'Tipo', 'Descrição', 'Categoria', 'Conta', 'Valor', 'Tags'].join(','),
      ...transactions.map(t => [
        t.date,
        t.type === 'income' ? 'Receita' : t.type === 'expense' ? 'Despesa' : 'Transferência',
        t.description,
        t.category,
        t.account,
        t.amount.toFixed(2),
        (t.tags || []).join(';')
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    downloadCSV(csvContent, 'transacoes.csv');
  };

  const exportBudgets = () => {
    const csvContent = [
      ['Categoria', 'Limite', 'Gasto', 'Mês', 'Ano'].join(','),
      ...budgets.map(b => [
        b.category,
        b.limit.toFixed(2),
        b.spent.toFixed(2),
        b.month.toString(),
        b.year.toString()
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    downloadCSV(csvContent, 'orcamentos.csv');
  };

  const exportAccounts = () => {
    const csvContent = [
      ['Nome', 'Tipo', 'Saldo', 'Moeda'].join(','),
      ...accounts.map(a => [
        a.name,
        a.type,
        a.balance.toFixed(2),
        a.currency
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    downloadCSV(csvContent, 'contas.csv');
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
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Importar/Exportar</h1>
          <p className="text-muted-foreground">Gerir dados financeiros - importar e exportar informações</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Import Section */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Importar Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Import Type Selection */}
            <div className="space-y-2">
              <Label>Tipo de Dados</Label>
              <Select value={importType} onValueChange={setImportType}>
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

            {/* File Selection */}
            <div className="space-y-2">
              <Label>Arquivo CSV</Label>
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                disabled={isImporting}
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Arquivo selecionado: {selectedFile.name}
                </p>
              )}
            </div>

            {/* Import Button */}
            <Button 
              onClick={handleImport} 
              disabled={!selectedFile || isImporting}
              className="w-full"
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar
                </>
              )}
            </Button>

            {/* Import Progress */}
            {isImporting && (
              <div className="space-y-2">
                <Progress value={50} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  Processando dados...
                </p>
              </div>
            )}

            {/* Import Result */}
            {importResult && (
              <Alert className={importResult.success ? 'border-green-500' : 'border-red-500'}>
                {importResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  <div>
                    <p className="font-medium">{importResult.message}</p>
                    {importResult.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm">Erros encontrados:</p>
                        <ul className="text-sm list-disc list-inside">
                          {importResult.errors.slice(0, 3).map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                          {importResult.errors.length > 3 && (
                            <li>... e mais {importResult.errors.length - 3} erros</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* CSV Format Info */}
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Formato CSV esperado para {importType}:</p>
                  {importType === 'transactions' && (
                    <p className="text-sm">Data, Tipo, Descrição, Categoria, Conta, Valor, Tags</p>
                  )}
                  {importType === 'budgets' && (
                    <p className="text-sm">Categoria, Limite, Gasto, Mês, Ano</p>
                  )}
                  {importType === 'accounts' && (
                    <p className="text-sm">Nome, Tipo, Saldo, Moeda</p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Export Section */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Exportar Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Exporte os seus dados financeiros em formato CSV para backup ou análise externa.
            </p>

            {/* Export Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={exportTransactions} 
                variant="outline" 
                className="w-full justify-start"
                disabled={transactions.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Transações ({transactions.length})
              </Button>

              <Button 
                onClick={exportBudgets} 
                variant="outline" 
                className="w-full justify-start"
                disabled={budgets.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Orçamentos ({budgets.length})
              </Button>

              <Button 
                onClick={exportAccounts} 
                variant="outline" 
                className="w-full justify-start"
                disabled={accounts.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Contas ({accounts.length})
              </Button>
            </div>

            {/* Export Info */}
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <div>
                  <p className="font-medium">Informações sobre exportação:</p>
                  <ul className="text-sm mt-2 space-y-1">
                    <li>• Arquivos são exportados em formato CSV</li>
                    <li>• Compatível com Excel, Google Sheets</li>
                    <li>• Codificação UTF-8 para caracteres especiais</li>
                    <li>• Dados atualizados até o momento da exportação</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            {/* Quick Actions */}
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-3">Ações Rápidas</p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Backup Completo
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Relatório Mensal
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};