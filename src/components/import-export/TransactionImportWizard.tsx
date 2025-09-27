import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { toast } from '../ui/use-toast';

interface TransactionImportWizardProps {
  onClose: () => void;
}

export const TransactionImportWizard: React.FC<TransactionImportWizardProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [isSmartImportEnabled, setIsSmartImportEnabled] = useState(true);
  
  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Smart Import de Transações</h3>
          <p className="text-muted-foreground">
            Importação inteligente com IA para categorização automática
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h4 className="font-medium">Funcionalidades do Smart Import</h4>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                ✅ Smart Import está ativo e pronto para uso!
              </p>
              <p className="text-sm text-green-700 mt-2">
                <strong>Recursos disponíveis:</strong> Categorização automática, detecção de duplicatas e sugestões inteligentes.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Formatos Suportados:</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• CSV, XLS, XLSX</li>
                  <li>• PDF (extratos bancários)</li>
                  <li>• Copy/Paste de dados</li>
                  <li>• OFX, QIF</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Funcionalidades IA:</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Categorização automática</li>
                  <li>• Detecção de duplicatas</li>
                  <li>• Correção de dados</li>
                  <li>• Sugestões inteligentes</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Voltar
          </Button>
          <Button 
            onClick={() => {
              toast({
                title: "Smart Import Ativado",
                description: "Funcionalidade ativada! Selecione seus arquivos para começar a importação inteligente.",
              });
              // Redirect to main import interface
              onClose();
            }}
            className="flex-1"
          >
            Começar Importação
          </Button>
        </div>
      </div>
    </Card>
  );
};