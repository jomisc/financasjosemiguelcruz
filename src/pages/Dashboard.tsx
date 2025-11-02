import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, TrendingUp, TrendingDown, Wallet, Pencil, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import WalletIcon from "@/components/WalletIcon";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editFormData, setEditFormData] = useState({
    type: "expense" as "income" | "expense",
    amount: "",
    category_id: "",
    date: "",
    description: "",
  });

  useEffect(() => {
    loadData();
    loadCategories();
  }, []);

  const loadData = async () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    try {
      // Use the dashboard stats endpoint for optimized data loading
      const { data: statsData, error: statsError } = await api.dashboard.getStats();

      if (statsError) {
        console.error("Error loading dashboard stats:", statsError);
        toast.error("Erro ao carregar dados do dashboard");
      } else if (statsData) {
        setTotalIncome(statsData.income);
        setTotalExpenses(statsData.expenses);
        setBudgets(statsData.budgets || []);
      }

      // Load recent transactions
      const { data: transactionsData, error: transactionsError } = await api.transactions.getAll({
        limit: 10
      });

      if (transactionsError) {
        console.error("Error loading transactions:", transactionsError);
        toast.error("Erro ao carregar actividades");
      } else {
        setTransactions(transactionsData || []);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
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

  const loadCategories = async () => {
    const { data, error } = await api.categories.getAll();

    if (error) {
      console.error("Error loading categories:", error);
      toast.error("Erro ao carregar categorias");
    } else {
      setCategories(data || []);
    }
  };

  const handleDeleteTransaction = async () => {
    if (!selectedTransaction) return;

    const { error } = await api.transactions.delete(selectedTransaction);

    if (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Erro ao eliminar actividade");
    } else {
      toast.success("Actividade eliminada com sucesso");
      loadData();
    }

    setDeleteDialogOpen(false);
    setSelectedTransaction(null);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditFormData({
      type: transaction.type as "income" | "expense",
      amount: transaction.amount.toString(),
      category_id: transaction.category_id || "",
      date: transaction.date.split('T')[0],
      description: transaction.description || "",
    });
    setEditDialogOpen(true);
  };

  const handleUpdateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingTransaction) return;

    if (!editFormData.description || editFormData.description.trim() === "") {
      toast.error("Por favor, insira uma descrição");
      return;
    }

    if (!editFormData.amount || parseFloat(editFormData.amount) <= 0) {
      toast.error("Por favor, insira um valor válido");
      return;
    }

    if (!editFormData.category_id && editFormData.type === "expense") {
      toast.error("Por favor, selecione uma categoria");
      return;
    }

    const { error } = await api.transactions.update(editingTransaction.id, {
      type: editFormData.type,
      amount: parseFloat(editFormData.amount),
      category_id: editFormData.type === "expense" ? editFormData.category_id : null,
      date: editFormData.date,
      description: editFormData.description,
    });

    if (error) {
      console.error("Error updating transaction:", error);
      toast.error("Erro ao atualizar actividade");
    } else {
      toast.success("Actividade atualizada com sucesso!");
      setEditDialogOpen(false);
      setEditingTransaction(null);
      loadData();
    }
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
            Nova Actividade
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
              <CardTitle>Actividades Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0 p-2"
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

                    <div className="flex items-center gap-4">
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

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditTransaction(transaction)}
                        className="hover:bg-primary/10"
                      >
                        <Pencil className="w-4 h-4 text-primary" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedTransaction(transaction.id);
                          setDeleteDialogOpen(true);
                        }}
                        className="hover:bg-primary/10"
                      >
                        <Trash2 className="w-4 h-4 text-primary" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => navigate("/transactions")}
                variant="outline"
                className="w-full mt-4"
              >
                Ver Mais
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar actividade?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser revertida. A actividade será permanentemente
              eliminada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTransaction}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Actividade</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateTransaction} className="space-y-6">
            {/* Type Selection */}
            <div className="space-y-2">
              <Label>Tipo</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={editFormData.type === "expense" ? "default" : "outline"}
                  className="h-14"
                  onClick={() =>
                    setEditFormData((prev) => ({ ...prev, type: "expense" }))
                  }
                >
                  Despesa
                </Button>
                <Button
                  type="button"
                  variant={editFormData.type === "income" ? "default" : "outline"}
                  className="h-14"
                  onClick={() =>
                    setEditFormData((prev) => ({ ...prev, type: "income" }))
                  }
                >
                  Rendimento
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="edit-description">
                Descrição <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="edit-description"
                placeholder="Ex: Compras no supermercado"
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                required
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="edit-amount">
                Valor (€) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={editFormData.amount}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, amount: e.target.value }))
                }
                required
                className="text-lg"
              />
            </div>

            {/* Category (only for expenses) */}
            {editFormData.type === "expense" && (
              <div className="space-y-2">
                <Label htmlFor="edit-category">
                  Categoria <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={editFormData.category_id}
                  onValueChange={(value) =>
                    setEditFormData((prev) => ({ ...prev, category_id: value }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="edit-date">Data</Label>
              <Input
                id="edit-date"
                type="date"
                value={editFormData.date}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Guardar Alterações</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
