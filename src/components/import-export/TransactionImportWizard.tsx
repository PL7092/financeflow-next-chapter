import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { toast } from '../ui/use-toast';

interface TransactionImportWizardProps {
  onClose: () => void;
}

export const TransactionImportWizard: React.FC<TransactionImportWizardProps> = ({ onClose }) => {
  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="text-center space-y-4">
        <h3 className="text-lg font-semibold">Importação Inteligente</h3>
        <p className="text-muted-foreground">
          A importação inteligente está temporariamente indisponível devido a atualizações no sistema.
        </p>
        <Button onClick={onClose} className="w-full">
          Voltar
        </Button>
      </div>
    </Card>
  );
};