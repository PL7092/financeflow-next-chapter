import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  CreditCard, 
  Target, 
  Wallet, 
  TrendingUp, 
  Calendar,
  PiggyBank,
  Car,
  BarChart3,
  Brain,
  Settings,
  FileText,
  Upload
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    current: true,
  },
  {
    name: "Transações",
    href: "/#transacoes",
    icon: CreditCard,
    current: false,
  },
  {
    name: "Orçamentos",
    href: "/#orcamentos",
    icon: Target,
    current: false,
  },
  {
    name: "Contas",
    href: "/#contas",
    icon: Wallet,
    current: false,
  },
  {
    name: "Investimentos",
    href: "/#investimentos",
    icon: TrendingUp,
    current: false,
  },
  {
    name: "Recorrentes",
    href: "/#transacoes",
    icon: Calendar,
    current: false,
  },
  {
    name: "Poupanças",
    href: "/#poupancas",
    icon: PiggyBank,
    current: false,
  },
  {
    name: "Ativos",
    href: "/#investimentos",
    icon: Car,
    current: false,
  },
  {
    name: "Relatórios",
    href: "/#transacoes",
    icon: BarChart3,
    current: false,
  },
  {
    name: "Conselheiro IA",
    href: "/#acoes-rapidas",
    icon: Brain,
    current: false,
  },
  {
    name: "Importar/Exportar",
    href: "/#acoes-rapidas",
    icon: Upload,
    current: false,
  },
];

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn("flex h-full w-64 flex-col bg-gradient-sidebar border-r border-border", className)}>
      <div className="flex h-16 items-center px-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-bold text-foreground">FinanceFlow</h1>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.name} to={item.href}>
              <Button
                variant={item.current ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-10",
                  item.current && "bg-gradient-primary shadow-card"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-border">
        <Link to="/">
          <Button variant="ghost" className="w-full justify-start gap-3 h-10">
            <Settings className="h-4 w-4" />
            Configurações
          </Button>
        </Link>
      </div>
    </div>
  );
}