import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Budget {
  id: string;
  category: string;
  spent: number;
  limit: number;
  color: string;
}

const mockBudgets: Budget[] = [
  {
    id: "1",
    category: "Alimentação",
    spent: 435.50,
    limit: 600.00,
    color: "bg-profit"
  },
  {
    id: "2",
    category: "Transporte", 
    spent: 285.20,
    limit: 300.00,
    color: "bg-warning"
  },
  {
    id: "3",
    category: "Entretenimento",
    spent: 150.75,
    limit: 200.00,
    color: "bg-info"
  },
  {
    id: "4",
    category: "Compras",
    spent: 320.40,
    limit: 250.00,
    color: "bg-loss"
  }
];

export function BudgetOverview() {
  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Orçamentos do Mês</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {mockBudgets.map((budget) => {
          const percentage = (budget.spent / budget.limit) * 100;
          const isOverBudget = budget.spent > budget.limit;
          
          return (
            <div key={budget.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("h-3 w-3 rounded-full", budget.color)} />
                  <span className="text-sm font-medium">{budget.category}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    €{budget.spent.toFixed(2)} / €{budget.limit.toFixed(2)}
                  </p>
                  {isOverBudget && (
                    <Badge variant="destructive" className="text-xs">
                      Excedido
                    </Badge>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Progress 
                  value={Math.min(percentage, 100)} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {percentage.toFixed(1)}% usado
                  {isOverBudget && ` (€${(budget.spent - budget.limit).toFixed(2)} acima)`}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}