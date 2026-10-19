import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 — route not found:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md px-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg mx-auto">
          <Heart className="w-8 h-8 text-primary-foreground fill-current" />
        </div>
        <div>
          <h1 className="text-7xl font-bold text-foreground">404</h1>
          <p className="text-xl text-muted-foreground mt-2">Page not found</p>
          <p className="text-sm text-muted-foreground mt-1">
            The page <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{location.pathname}</code> doesn't exist.
          </p>
        </div>
        <Button onClick={() => navigate("/")} className="bg-gradient-primary text-primary-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <p className="text-xs text-muted-foreground">Novalife — Blood Bank Management System</p>
      </div>
    </div>
  );
};

export default NotFound;
