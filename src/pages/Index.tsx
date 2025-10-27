import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import WalletIcon from "@/components/WalletIcon";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-12">
        <div className="flex flex-col items-center space-y-6 text-center">
          <WalletIcon className="w-20 h-20" />
          
          <div className="space-y-3">
            <h1 className="text-5xl font-bold text-foreground tracking-tight">
              Finanças+
            </h1>
            <p className="text-lg text-muted-foreground">
              A sua vida financeira, simplificada.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => navigate("/auth")}
            className="w-full h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Registar Novo Utilizador
          </Button>
          
          <Button
            onClick={() => navigate("/auth")}
            variant="outline"
            className="w-full h-14 text-base font-semibold border-2 hover:bg-secondary"
          >
            Iniciar Sessão
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
