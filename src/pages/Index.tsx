import { StatCard } from "@/components/dashboard/StatCard";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { BudgetOverview } from "@/components/dashboard/BudgetOverview";
import { InvestmentSummary } from "@/components/dashboard/InvestmentSummary";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  TrendingUp, 
  Target, 
  PiggyBank,
  Bell,
  Search,
  Calendar,
  Filter
} from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";


const Index = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

  return (
    <div id="topo" className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral das suas finanças</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 mr-2" />
            Pesquisar
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Este Mês
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div id="contas">
          <StatCard
            title="Saldo Total"
            value="€15.247,85"
            change="+€1.245,30 este mês"
            changeType="positive"
            icon={Wallet}
          />
        </div>
        <div id="receitas">
          <StatCard
            title="Receitas"
            value="€4.350,00"
            change="+12% vs mês anterior"
            changeType="positive"
            icon={TrendingUp}
          />
        </div>
        <div id="despesas">
          <StatCard
            title="Despesas"
            value="€2.891,45"
            change="-8% vs mês anterior"
            changeType="positive"
            icon={Target}
          />
        </div>
        <div id="poupancas">
          <StatCard
            title="Poupanças"
            value="€1.458,55"
            change="+€458,55 este mês"
            changeType="positive"
            icon={PiggyBank}
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - 2 sections */}
        <div className="lg:col-span-2 space-y-6">
          <section id="transacoes">
            <RecentTransactions />
          </section>
          <section id="investimentos">
            <InvestmentSummary />
          </section>
        </div>
        
        {/* Right Column - 2 sections */}
        <div className="space-y-6">
          <section id="acoes-rapidas">
            <QuickActions />
          </section>
          <section id="orcamentos">
            <BudgetOverview />
          </section>
        </div>
      </div>
    </div>
  );
};

export default Index;
