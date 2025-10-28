import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2, Pencil } from "lucide-react";
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

interface Category {
  id: string;
  name: string;
  icon: string;
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

const Transactions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(
    null
  );

  useEffect(() => {
    checkAuth();
    loadTransactions();
  }, []);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("*, categories(*)")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error loading transactions:", error);
      toast.error("Erro ao carregar transações");
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  };

  const handleDeleteTransaction = async () => {
    if (!selectedTransaction) return;

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", selectedTransaction);

    if (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Erro ao eliminar transação");
    } else {
      toast.success("Transação eliminada com sucesso");
      loadTransactions();
    }

    setDeleteDialogOpen(false);
    setSelectedTransaction(null);
  };

  const groupTransactionsByMonth = () => {
    const grouped: { [key: string]: Transaction[] } = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthYear = date.toLocaleString("pt-PT", {
        month: "long",
        year: "numeric",
      });
      const key = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(transaction);
    });

    return grouped;
  };

  const groupedTransactions = groupTransactionsByMonth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">A carregar...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <WalletIcon className="w-8 h-8" />
            <h1 className="text-xl font-bold text-foreground">Finanças+</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Transações</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Ainda não tem transações registadas
                </p>
                <Button onClick={() => navigate("/add-transaction")}>
                  Criar Primeira Transação
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedTransactions).map(([month, monthTransactions]) => (
                  <div key={month} className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                      {month}
                    </h3>
                    <div className="space-y-3">
                      {monthTransactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            {transaction.categories && (
                              <span className="text-3xl">
                                {transaction.categories.icon}
                              </span>
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-foreground">
                                {transaction.description ||
                                  transaction.categories?.name ||
                                  "Sem descrição"}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>
                                  {new Date(transaction.date).toLocaleDateString(
                                    "pt-PT"
                                  )}
                                </span>
                                {transaction.categories && (
                                  <span className="text-xs">
                                    {transaction.categories.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <p
                              className={`font-bold text-lg ${
                                transaction.type === "income"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {transaction.type === "income" ? "+" : "-"}€
                              {parseFloat(transaction.amount.toString()).toFixed(
                                2
                              )}
                            </p>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedTransaction(transaction.id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar transação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser revertida. A transação será permanentemente
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
    </div>
  );
};

export default Transactions;
