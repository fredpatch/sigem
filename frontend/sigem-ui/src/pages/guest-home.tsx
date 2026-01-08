import { Link } from "react-router-dom";
import { Car, Gauge } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const GuestHome = () => {
  return (
    <div className="max-w-xl mx-auto mt-16 px-4">
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Car className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg">
            Bienvenue sur SIGEM Véhicule
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Vous êtes connecté en tant qu’utilisateur limité.
            <br />
            Votre accès est limité à la gestion de{" "}
            <strong>votre véhicule</strong>.
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Gauge className="h-4 w-4" />
            <span>
              Vous pouvez mettre à jour le kilométrage après une vidange
            </span>
          </div>

          <Button asChild className="mt-4 w-full">
            <Link to="/my-vehicle">Accéder à mon véhicule</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestHome;
