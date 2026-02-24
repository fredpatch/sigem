import type { JSX } from "react";
import { useAuthStore } from "@/modules/auth/store/use-auth.store";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShieldAlert,
  Home,
  Loader,
  LockKeyhole,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children: JSX.Element;
}

export default function RouteGuard({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { logout, me } = useAuth();
  const { data: user, isLoading } = me;
  const { mutate } = logout;
  const preAuthUser = useAuthStore((state) => state.preAuthUser);
  const userRole = user?.role;

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Card className="w-full max-w-md bg-slate-900/90 border-slate-800 text-slate-50">
          <CardHeader className="flex flex-col items-center gap-3">
            <div className="rounded-full p-3 bg-red-500/10">
              <Loader className="h-6 w-6 animate-spin text-orange-500" />
            </div>
            <CardTitle className="text-xl font-semibold">
              Loading User...
            </CardTitle>
            <CardDescription className="text-center text-slate-300">
              Please wait while we are getting your information
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // 1️⃣ Pas connecté du tout → redirection vers /login
  if (!user && !preAuthUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // ⏳ Connected but OTP not validated yet
  if (!user && preAuthUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950/95 mx-auto">
        <Card className="w-full max-w-md bg-slate-900/90 border-slate-800 text-slate-50">
          <CardHeader className="flex flex-col items-center gap-3">
            <div className="rounded-full p-3 bg-yellow-500/10">
              <LockKeyhole className="h-6 w-6 text-yellow-500" />
            </div>
            <CardTitle className="text-xl font-semibold">
              Vérification en cours
            </CardTitle>
            <CardDescription className="text-center text-slate-300">
              Tu as bien commencé ta connexion. Valide le code 2FA envoyé par
              e-mail pour accéder à cette page.
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center text-sm text-slate-400">
            Si tu ne vois pas le formulaire 2FA, reviens à l&apos;écran de
            connexion et relance la procédure.
          </CardContent>

          <CardFooter className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.location.href = "/login";
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Revenir à la connexion
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // 3️⃣ Rôle non autorisé
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return (
      <div className="h-screen flex items-center justify-center mx-auto">
        <Card className="w-full max-w-md bg-slate-900/90 border-slate-800 text-slate-50">
          <CardHeader className="flex flex-col items-center gap-3">
            <div className="rounded-full p-3 bg-red-500/10">
              <ShieldAlert className="h-6 w-6 text-red-500" />
            </div>
            <CardTitle className="text-xl font-semibold">
              Accès refusé
            </CardTitle>
            <CardDescription className="text-center text-slate-300">
              Ton compte est connecté, mais tu n&apos;as pas les permissions
              nécessaires pour accéder à cette page.
            </CardDescription>
          </CardHeader>

          <CardFooter className="flex justify-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                window.location.href = "/home";
              }}
            >
              <Home className="mr-1 h-4 w-4" />
              Retour à l&apos;accueil
            </Button>
            {/* Optionnel : bouton pour se déconnecter */}
            <Button size="sm" variant="destructive" onClick={() => mutate()}>
              Se déconnecter
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // If it is a guest connected, we will redirect to a specific page
  // if (userRole === "GUEST") {
  //   return <Navigate to="/my-vehicle" replace />;
  // }

  return children;
}
