import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Trash2 } from "lucide-react";
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
  categories: Category;
}

const Budgets = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [amount, setAmount] = useState("");

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    checkAuth();
    loadCategories();
    loadBudgets();
  }, []);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error loading categories:", error);
    } else {
      setCategories(data || []);
    }
  };

  const loadBudgets = async () => {
    const { data, error } = await supabase
      .from("budgets")
      .select("*, categories(*)")
      .eq("month", currentMonth)
      .eq("year", currentYear);

    if (error) {
      console.error("Error loading budgets:", error);
    } else {
      setBudgets(data || []);
    }
  };

  const handleAddBudget = async () => {
    if (!selectedCategory || !amount || parseFloat(amount) <= 0) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    // Check if budget already exists for this category
    const existingBudget = budgets.find(
      (b) => b.category_id === selectedCategory
    );
    if (existingBudget) {
      toast.error("Já existe um orçamento para esta categoria");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Utilizador não autenticado");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("budgets").insert({
      user_id: user.id,
      category_id: selectedCategory,
      amount: parseFloat(amount),
      month: currentMonth,
      year: currentYear,
    });

    setLoading(false);

    if (error) {
      console.error("Error creating budget:", error);
      toast.error("Erro ao criar orçamento");
    } else {
      toast.success("Orçamento criado com sucesso!");
      setSelectedCategory("");
      setAmount("");
      loadBudgets();
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    const { error } = await supabase.from("budgets").delete().eq("id", budgetId);

    if (error) {
      console.error("Error deleting budget:", error);
      toast.error("Erro ao eliminar orçamento");
    } else {
      toast.success("Orçamento eliminado");
      loadBudgets();
    }
  };

  const availableCategories = categories.filter(
    (cat) => !budgets.find((b) => b.category_id === cat.id)
  );

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Budget Form */}
          <Card>
            <CardHeader>
              <CardTitle>Criar Novo Orçamento</CardTitle>
              <p className="text-sm text-muted-foreground">
                Mês: {currentDate.toLocaleString("pt-PT", { month: "long" })}{" "}
                {currentYear}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((category) => (
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

              <div className="space-y-2">
                <Label htmlFor="amount">Valor do Orçamento (€)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <Button
                onClick={handleAddBudget}
                disabled={loading || availableCategories.length === 0}
                className="w-full"
              >
                {loading ? "A criar..." : "Criar Orçamento"}
              </Button>

              {availableCategories.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  Já criou orçamentos para todas as categorias disponíveis
                </p>
              )}
            </CardContent>
          </Card>

          {/* Existing Budgets */}
          <Card>
            <CardHeader>
              <CardTitle>Orçamentos Atuais</CardTitle>
            </CardHeader>
            <CardContent>
              {budgets.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Ainda não criou nenhum orçamento para este mês
                </p>
              ) : (
                <div className="space-y-4">
                  {budgets.map((budget) => (
                    <div
                      key={budget.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{budget.categories.icon}</span>
                        <div>
                          <p className="font-medium text-foreground">
                            {budget.categories.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            €{budget.amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteBudget(budget.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Budgets;
