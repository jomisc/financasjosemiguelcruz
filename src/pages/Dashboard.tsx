import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Plus, LogOut, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { toast } from "sonner";
import WalletIcon from "@/components/WalletIcon";

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Budget {
  id: string;
  category_id: string;
  amount: number;
  month: number;
  year: number;
  categories: Category;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: string;
  description: string | null;
  category_id: string | null;
  categories: Category | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);
    await initializeUserData(session.user.id);
    await loadData();
    setLoading(false);
  };

  const initializeUserData = async (userId: string) => {
    // Check if user has categories
    const { data: categories } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId);

    // If no categories, create default ones
    if (!categories || categories.length === 0) {
      const { error } = await supabase.rpc("create_default_categories", {
        _user_id: userId,
      });

      if (error) {
        console.error("Error creating default categories:", error);
      }
    }
  };

  const loadData = async () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Load budgets for current month
    const { data: budgetsData, error: budgetsError } = await supabase
      .from("budgets")
      .select("*, categories(*)")
      .eq("month", currentMonth)
      .eq("year", currentYear);

    if (budgetsError) {
      console.error("Error loading budgets:", budgetsError);
    } else {
      setBudgets(budgetsData || []);
    }

    // Load transactions for current month
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1)
      .toISOString()
      .split("T")[0];
    const lastDayOfMonth = new Date(currentYear, currentMonth, 0)
      .toISOString()
      .split("T")[0];

    const { data: transactionsData, error: transactionsError } = await supabase
      .from("transactions")
      .select("*, categories(*)")
      .gte("date", firstDayOfMonth)
      .lte("date", lastDayOfMonth)
      .order("date", { ascending: false });

    if (transactionsError) {
      console.error("Error loading transactions:", transactionsError);
    } else {
      setTransactions(transactionsData || []);

      // Calculate totals
      const income = transactionsData
        ?.filter((t) => t.type === "income")
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;

      const expenses = transactionsData
        ?.filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;

      setTotalIncome(income);
      setTotalExpenses(expenses);
    }
  };

  const getSpentAmount = (categoryId: string) => {
    return transactions
      .filter((t) => t.type === "expense" && t.category_id === categoryId)
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
  };

  const getBudgetProgress = (spent: number, budget: number) => {
    return (spent / budget) * 100;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-destructive";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-primary";
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">A carregar...</p>
      </div>
    );
  }

  const netSavings = totalIncome - totalExpenses;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 focus:outline-none"
          >
            <WalletIcon className="w-8 h-8" />
            <h1 className="text-xl font-bold text-foreground">Finanças+</h1>
          </button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Monthly Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Resumo do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span>Rendimentos</span>
                </div>
                <p className="text-3xl font-bold text-green-600">
                  €{totalIncome.toFixed(2)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <span>Despesas</span>
                </div>
                <p className="text-3xl font-bold text-red-600">
                  €{totalExpenses.toFixed(2)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Wallet className="w-4 h-4" />
                  <span>Poupança</span>
                </div>
                <p
                  className={`text-3xl font-bold ${
                    netSavings >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  €{netSavings.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button
            onClick={() => navigate("/add-transaction")}
            className="h-14"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Transação
          </Button>
          <Button
            onClick={() => navigate("/budgets")}
            variant="outline"
            className="h-14"
            size="lg"
          >
            Gerir Orçamentos
          </Button>
          <Button
            onClick={() => navigate("/transactions")}
            variant="outline"
            className="h-14"
            size="lg"
          >
            Ver Histórico
          </Button>
        </div>

        {/* Budget Progress */}
        {budgets.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Orçamentos por Categoria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {budgets.map((budget) => {
                const spent = getSpentAmount(budget.category_id);
                const progress = getBudgetProgress(spent, budget.amount);

                return (
                  <div key={budget.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{budget.categories.icon}</span>
                        <span className="font-medium text-foreground">
                          {budget.categories.name}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        €{spent.toFixed(2)} / €{budget.amount.toFixed(2)}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(progress, 100)}
                      className={`h-3 ${getProgressColor(progress)}`}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {progress.toFixed(0)}% utilizado
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                Ainda não criou nenhum orçamento para este mês.
              </p>
              <Button onClick={() => navigate("/budgets")}>
                Criar Primeiro Orçamento
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      {transaction.categories && (
                        <span className="text-2xl">
                          {transaction.categories.icon}
                        </span>
                      )}
                      <div>
                        <p className="font-medium text-foreground">
                          {transaction.description ||
                            transaction.categories?.name ||
                            "Sem descrição"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString("pt-PT")}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`font-bold ${
                        transaction.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}€
                      {parseFloat(transaction.amount.toString()).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
