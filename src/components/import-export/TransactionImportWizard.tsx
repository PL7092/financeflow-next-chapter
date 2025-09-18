import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { toast } from '../ui/use-toast';

interface TransactionImportWizardProps {
  onClose: () => void;
}

export const TransactionImportWizard: React.FC<TransactionImportWizardProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  
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
            <h4 className="font-medium">Configuração da IA</h4>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">
                ⚠️ Para usar o Smart Import, configure primeiro suas chaves de API da IA nas configurações.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Formatos Suportados:</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• CSV, XLS, XLSX</li>
                  <li>• PDF (extratos bancários)</li>
                  <li>• Copy/Paste de dados</li>
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
                title: "Funcionalidade em Desenvolvimento",
                description: "Smart Import será ativado após conectar ao Supabase",
                variant: "destructive",
              });
            }}
            className="flex-1"
          >
            Continuar
          </Button>
        </div>
      </div>
    </Card>
  );
};