import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Investment {
  id: string;
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
  allocation: number;
}

const mockInvestments: Investment[] = [
  {
    id: "1",
    name: "Fundo Índice S&P 500",
    symbol: "SPY",
    value: 12450.30,
    change: 145.20,
    changePercent: 1.18,
    allocation: 45
  },
  {
    id: "2",
    name: "ETF Europa",
    symbol: "EXS1",
    value: 8230.15,
    change: -78.45,
    changePercent: -0.94,
    allocation: 30
  },
  {
    id: "3",
    name: "Obrigações do Tesouro",
    symbol: "GOVT",
    value: 5670.80,
    change: 23.10,
    changePercent: 0.41,
    allocation: 20
  },
  {
    id: "4",
    name: "Criptomoedas",
    symbol: "BTC",
    value: 1235.90,
    change: -156.30,
    changePercent: -11.23,
    allocation: 5
  }
];

export function InvestmentSummary() {
  const totalValue = mockInvestments.reduce((sum, inv) => sum + inv.value, 0);
  const totalChange = mockInvestments.reduce((sum, inv) => sum + inv.change, 0);
  const totalChangePercent = (totalChange / (totalValue - totalChange)) * 100;

  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Portfolio de Investimentos</CardTitle>
          <Badge 
            variant={totalChangePercent >= 0 ? "secondary" : "destructive"}
            className="flex items-center gap-1"
          >
            {totalChangePercent >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {totalChangePercent >= 0 ? "+" : ""}{totalChangePercent.toFixed(2)}%
          </Badge>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">€{totalValue.toFixed(2)}</p>
          <p className={cn(
            "text-sm font-medium",
            totalChange >= 0 ? "text-profit" : "text-loss"
          )}>
            {totalChange >= 0 ? "+" : ""}€{totalChange.toFixed(2)} hoje
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockInvestments.map((investment) => (
          <div
            key={investment.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{investment.name}</p>
                <Badge variant="outline" className="text-xs">
                  {investment.symbol}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {investment.allocation}% do portfolio
              </p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-sm font-medium">
                €{investment.value.toFixed(2)}
              </p>
              <div className="flex items-center gap-1">
                {investment.changePercent >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-profit" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-loss" />
                )}
                <p className={cn(
                  "text-xs font-medium",
                  investment.changePercent >= 0 ? "text-profit" : "text-loss"
                )}>
                  {investment.changePercent >= 0 ? "+" : ""}{investment.changePercent.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}