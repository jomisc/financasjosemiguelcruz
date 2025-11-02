import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import WalletIcon from "@/components/WalletIcon";
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(
    null
  );
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
    loadTransactions();
    loadCategories();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    const { data, error } = await api.transactions.getAll();

    if (error) {
      console.error("Error loading transactions:", error);
      toast.error("Erro ao carregar actividades");
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
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
      loadTransactions();
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
      loadTransactions();
    }
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
            <CardTitle>Histórico de Actividades</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Ainda não tem actividades registadas
                </p>
                <Button onClick={() => navigate("/add-transaction")}>
                  Criar Primeira Actividade
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
                          className="flex items-center justify-between p-4 border border-border rounded-lg"
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

export default Transactions;
