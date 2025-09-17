import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownLeft, MoreHorizontal } from "lucide-react";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  account: string;
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    description: "Salário",
    amount: 3500.00,
    type: "income",
    category: "Trabalho",
    date: "Hoje",
    account: "Conta Corrente"
  },
  {
    id: "2", 
    description: "Supermercado Continente",
    amount: 125.45,
    type: "expense",
    category: "Alimentação",
    date: "Ontem",
    account: "Cartão de Débito"
  },
  {
    id: "3",
    description: "Combustível BP",
    amount: 65.30,
    type: "expense", 
    category: "Transporte",
    date: "2 dias atrás",
    account: "Cartão de Crédito"
  },
  {
    id: "4",
    description: "Freelance Design",
    amount: 450.00,
    type: "income",
    category: "Trabalho Extra",
    date: "3 dias atrás", 
    account: "PayPal"
  },
  {
    id: "5",
    description: "Netflix",
    amount: 7.99,
    type: "expense",
    category: "Entretenimento",
    date: "1 semana atrás",
    account: "Cartão de Crédito"
  }
];

export function RecentTransactions() {
  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Transações Recentes</CardTitle>
          <Button variant="ghost" size="sm">
            Ver Todas
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                transaction.type === "income" 
                  ? "bg-profit/10 text-profit" 
                  : "bg-loss/10 text-loss"
              )}>
                {transaction.type === "income" ? (
                  <ArrowDownLeft className="h-5 w-5" />
                ) : (
                  <ArrowUpRight className="h-5 w-5" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {transaction.description}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {transaction.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {transaction.account}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className={cn(
                "text-sm font-medium",
                transaction.type === "income" ? "text-profit" : "text-loss"
              )}>
                {transaction.type === "income" ? "+" : "-"}€{transaction.amount.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                {transaction.date}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}