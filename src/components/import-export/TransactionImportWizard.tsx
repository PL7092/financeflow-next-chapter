import React, { useState, useRef } from 'react';
import { Upload, FileText, Clipboard, Brain, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { FileParsingService, ParsedTransaction } from '../../services/FileParsingService';
import { AICategorizationService, AICategorizationSuggestion, Transaction } from '../../services/AICategorizationService';
import { useFinance } from '../../contexts/FinanceContext';
import { useToast } from '../ui/use-toast';

interface ImportStep {
  id: 'upload' | 'preview' | 'categorize' | 'confirm';
  title: string;
  description: string;
}

const importSteps: ImportStep[] = [
  {
    id: 'upload',
    title: 'Carregar Dados',
    description: 'Escolha o método de importação dos dados'
  },
  {
    id: 'preview',
    title: 'Pré-visualizar',
    description: 'Revise os dados importados'
  },
  {
    id: 'categorize',
    title: 'Categorizar com IA',
    description: 'IA sugere categorias baseadas no histórico'
  },
  {
    id: 'confirm',
    title: 'Confirmar',
    description: 'Confirme e importe as transações'
  }
];

export const TransactionImportWizard: React.FC = () => {
  const { accounts, transactions, addTransaction } = useFinance();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentStep, setCurrentStep] = useState<ImportStep['id']>('upload');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [importMethod, setImportMethod] = useState<'file' | 'paste'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pasteData, setPasteData] = useState<string>('');
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AICategorizationSuggestion[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrors([]);
    }
  };

  const handleNextStep = async () => {
    switch (currentStep) {
      case 'upload':
        await processUploadData();
        break;
      case 'preview':
        await generateAISuggestions();
        break;
      case 'categorize':
        setCurrentStep('confirm');
        break;
      case 'confirm':
        await confirmImport();
        break;
    }
  };

  const processUploadData = async () => {
    if (!selectedAccount) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma conta de destino",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingStep('Processando dados...');
    setErrors([]);

    try {
      let parseResult;

      if (importMethod === 'file' && selectedFile) {
        parseResult = await FileParsingService.parseFile(selectedFile);
      } else if (importMethod === 'paste' && pasteData.trim()) {
        parseResult = await FileParsingService.parseTextData(pasteData);
      } else {
        throw new Error('Nenhum dado para processar');
      }

      if (!parseResult.success) {
        setErrors(parseResult.errors);
        return;
      }

      setParsedTransactions(parseResult.data);
      
      if (parseResult.data.length === 0) {
        setErrors(['Nenhuma transação válida foi encontrada nos dados']);
        return;
      }

      toast({
        title: "Sucesso",
        description: `${parseResult.data.length} transações processadas`,
      });

      setCurrentStep('preview');
    } catch (error) {
      setErrors([`Erro ao processar dados: ${error}`]);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const generateAISuggestions = async () => {
    setIsProcessing(true);
    setProcessingStep('Analisando com IA...');

    try {
      const existingCategories = Array.from(new Set(transactions.map(t => t.category)));
      const result = await AICategorizationService.categorizeTransactions(
        parsedTransactions,
        transactions as Transaction[],
        existingCategories
      );

      setAiSuggestions(result.suggestions);
      setCurrentStep('categorize');

      toast({
        title: "IA Analisou",
        description: `${result.suggestions.length} sugestões geradas`,
      });
    } catch (error) {
      setErrors([`Erro na análise IA: ${error}`]);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const confirmImport = async () => {
    setIsProcessing(true);
    setProcessingStep('Importando transações...');

    try {
      let successCount = 0;
      const importErrors: string[] = [];

      for (const suggestion of aiSuggestions) {
        try {
          const transaction = {
            type: suggestion.suggestedType,
            amount: suggestion.originalTransaction.amount,
            description: suggestion.originalTransaction.description,
            category: suggestion.suggestedCategory,
            account: selectedAccount,
            date: suggestion.originalTransaction.date,
            tags: suggestion.suggestedTags
          };

          await addTransaction(transaction);
          successCount++;
        } catch (error) {
          importErrors.push(`Erro na transação ${suggestion.originalTransaction.description}: ${error}`);
        }
      }

      if (successCount > 0) {
        toast({
          title: "Importação Concluída",
          description: `${successCount} transações importadas com sucesso`,
        });

        // Reset wizard
        resetWizard();
      }

      if (importErrors.length > 0) {
        setErrors(importErrors);
      }
    } catch (error) {
      setErrors([`Erro na importação: ${error}`]);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const resetWizard = () => {
    setCurrentStep('upload');
    setSelectedFile(null);
    setPasteData('');
    setParsedTransactions([]);
    setAiSuggestions([]);
    setErrors([]);
    setSelectedAccount('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateSuggestion = (index: number, field: string, value: any) => {
    setAiSuggestions(prev => prev.map((suggestion, i) => 
      i === index 
        ? { ...suggestion, [field]: value }
        : suggestion
    ));
  };

  const currentStepIndex = importSteps.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / importSteps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Importação Inteligente de Transações
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {importSteps[currentStepIndex]?.description}
              </p>
            </div>
            <Badge variant="outline">
              Passo {currentStepIndex + 1} de {importSteps.length}
            </Badge>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Step Content */}
      <div className="grid gap-6">
        {currentStep === 'upload' && (
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle>Carregar Dados das Transações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Account Selection */}
              <div className="space-y-2">
                <Label>Conta de Destino *</Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conta onde importar" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(account => (
                      <SelectItem key={account.id} value={account.name}>
                        {account.name} ({account.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Import Method Selection */}
              <div className="space-y-4">
                <Label>Método de Importação</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card 
                    className={`cursor-pointer transition-colors ${
                      importMethod === 'file' ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setImportMethod('file')}
                  >
                    <CardContent className="flex items-center space-x-3 p-4">
                      <Upload className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="font-medium">Carregar Arquivo</h3>
                        <p className="text-sm text-muted-foreground">
                          CSV, Excel (XLS/XLSX), PDF
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer transition-colors ${
                      importMethod === 'paste' ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setImportMethod('paste')}
                  >
                    <CardContent className="flex items-center space-x-3 p-4">
                      <Clipboard className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="font-medium">Colar Dados</h3>
                        <p className="text-sm text-muted-foreground">
                          Copiar e colar do extrato
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* File Upload */}
              {importMethod === 'file' && (
                <div className="space-y-2">
                  <Label>Arquivo</Label>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls,.pdf"
                    onChange={handleFileSelect}
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      📄 {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>
              )}

              {/* Paste Data */}
              {importMethod === 'paste' && (
                <div className="space-y-2">
                  <Label>Dados do Extrato</Label>
                  <Textarea
                    placeholder="Cole aqui os dados do seu extrato bancário...&#10;Exemplo:&#10;Data,Descrição,Valor&#10;2024-01-15,Supermercado Continente,-45.67&#10;2024-01-14,Salário,2500.00"
                    value={pasteData}
                    onChange={(e) => setPasteData(e.target.value)}
                    rows={8}
                  />
                </div>
              )}

              {/* Format Info */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Formatos Suportados:</p>
                    <ul className="text-sm space-y-1">
                      <li>• <strong>CSV/Excel:</strong> Data, Descrição, Valor, Categoria (opcional)</li>
                      <li>• <strong>PDF:</strong> Extratos bancários com tabelas</li>
                      <li>• <strong>Copy/Paste:</strong> Dados separados por vírgula ou tabulação</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {currentStep === 'preview' && (
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle>Pré-visualização dos Dados</CardTitle>
              <p className="text-sm text-muted-foreground">
                {parsedTransactions.length} transações encontradas
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="max-h-96 overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Data</th>
                        <th className="text-left p-2">Descrição</th>
                        <th className="text-right p-2">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedTransactions.slice(0, 10).map((transaction, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{transaction.date}</td>
                          <td className="p-2">{transaction.description}</td>
                          <td className="p-2 text-right">
                            €{transaction.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedTransactions.length > 10 && (
                  <p className="text-sm text-muted-foreground">
                    ... e mais {parsedTransactions.length - 10} transações
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'categorize' && (
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Sugestões da IA
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Revise e ajuste as categorizações sugeridas pela IA
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiSuggestions.map((suggestion, index) => (
                  <Card key={index} className="border">
                    <CardContent className="p-4">
                      <div className="grid gap-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{suggestion.originalTransaction.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {suggestion.originalTransaction.date} • €{suggestion.originalTransaction.amount.toFixed(2)}
                            </p>
                          </div>
                          <Badge 
                            variant={suggestion.confidence > 0.8 ? "default" : "secondary"}
                          >
                            {Math.round(suggestion.confidence * 100)}% confiança
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>Categoria</Label>
                            <Input
                              value={suggestion.suggestedCategory}
                              onChange={(e) => updateSuggestion(index, 'suggestedCategory', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Tipo</Label>
                            <Select
                              value={suggestion.suggestedType}
                              onValueChange={(value) => updateSuggestion(index, 'suggestedType', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="expense">Despesa</SelectItem>
                                <SelectItem value="income">Receita</SelectItem>
                                <SelectItem value="transfer">Transferência</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Tags</Label>
                            <Input
                              value={suggestion.suggestedTags.join(', ')}
                              onChange={(e) => updateSuggestion(index, 'suggestedTags', e.target.value.split(',').map(t => t.trim()))}
                              placeholder="tag1, tag2, tag3"
                            />
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          <strong>Análise:</strong> {suggestion.reasoning}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'confirm' && (
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Confirmação de Importação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div>
                    <p className="font-medium">Resumo da Importação:</p>
                    <ul className="mt-2 space-y-1">
                      <li>• {aiSuggestions.length} transações serão importadas</li>
                      <li>• Conta de destino: {selectedAccount}</li>
                      <li>• Método: {importMethod === 'file' ? 'Arquivo' : 'Copy/Paste'}</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="font-medium">Categorias a serem criadas:</h4>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(aiSuggestions.map(s => s.suggestedCategory))).map(category => (
                    <Badge key={category} variant="outline">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div>
                <p className="font-medium">Erros encontrados:</p>
                <ul className="mt-2 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Processing */}
        {isProcessing && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                <div>
                  <p className="font-medium">{processingStep}</p>
                  <p className="text-sm text-muted-foreground">
                    Por favor, aguarde...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              if (currentStep === 'upload') {
                resetWizard();
              } else {
                const currentIndex = importSteps.findIndex(step => step.id === currentStep);
                if (currentIndex > 0) {
                  setCurrentStep(importSteps[currentIndex - 1].id);
                }
              }
            }}
            disabled={isProcessing}
          >
            {currentStep === 'upload' ? 'Cancelar' : 'Voltar'}
          </Button>

          <Button
            onClick={handleNextStep}
            disabled={isProcessing || (currentStep === 'upload' && !selectedAccount)}
          >
            {currentStep === 'confirm' ? 'Importar Transações' : 'Continuar'}
          </Button>
        </div>
      </div>
    </div>
  );
};