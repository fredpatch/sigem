import * as React from "react";
import { useState, useId } from "react";
import { Slot } from "@radix-ui/react-slot";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { TwoFactorForm } from "../_components/form/2FAForm";
import { useAuth } from "../hooks/use-auth";
import { toast } from "sonner";
import { useAuthStore } from "../store/use-auth.store";
// import { AuthAPI } from "../api/auth-api";
// import { useAuth } from "@/features/auth/hooks/use-auth";
// import { TwoFactorForm } from "../components/forms/two-factor-form";

// UTILITY: cn function for merging Tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- BUILT-IN UI COMPONENTS (No changes here) ---

// COMPONENT: Label
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

// COMPONENT: Button
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input dark:border-input/50 bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary-foreground/60 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-6",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// COMPONENT: Input
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-input dark:border-input/50 bg-background px-3 py-3 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:bg-primary focus-visible:text-white focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

// COMPONENT: PasswordInput
export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}
export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(({ className, label, ...props }, ref) => {
  const id = useId();
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  return (
    <div className="grid w-full items-center gap-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          className={cn("pe-10", className)}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center text-muted-foreground/80 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

// --- FORMS & AUTH LOGIC ---

// FORM: SignInForm
function SignInForm() {
  const { login } = useAuth();
  const { requestOtp } = useAuthStore();
  const { mutate: logUser, isPending, isError, error } = login;
  const [waitingFor2FA, setWaitingFor2FA] = useState(false);
  const [matriculation, setMatriculation] = useState("");

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const matriculation = String(data.get("matriculation") || "").trim();
    const password = String(data.get("password") || "").trim();

    if (!matriculation) {
      toast.error("Matricule requis");
      return;
    }

    // ✅ NEW: if no password, assume activation flow
    if (!password) {
      window.location.href = `/activate?matriculation=${matriculation}`;
      return;
    }

    logUser(
      { matriculation, password },
      {
        onSuccess: async () => {
          try {
            await requestOtp(matriculation, "LOGIN_2FA");
            setWaitingFor2FA(true);
          } catch (error) {}
        },
        onError(err: any) {
          const api = err?.response?.data;
          const code = api?.error || api?.code; // depends on your response format
          // const message = api?.message;

          // console.log("🚀 ~ file: auth-ui.tsx:427 ~ onError ~ code:", err);

          if (code === "ACTIVATE_ACCOUNT") {
            window.location.href = `/activate?matriculation=${data.get("matriculation")}`;
            return;
          }
          if (code === "ACCOUNT_DISABLED") {
            toast.error("Compte désactivé. Contactez MG.");
            return;
          }
          toast.error(api?.message || "Échec de la connexion");
        },
      }
    );

    // console.log("UI: Sign In form submitted", data.get("username"));
  };

  if (waitingFor2FA) {
    return (
      <TwoFactorForm
        matriculation={matriculation}
        onSuccess={() => {
          setWaitingFor2FA(false);
          window.location.href = "/home";
        }}
      />
    );
  }
  return (
    <form
      onSubmit={handleSignIn}
      autoComplete="on"
      className="flex flex-col gap-8"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">SIGEM</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Entrez votre matricule. Si votre compte est déjà actif, saisissez
          aussi votre mot de passe.
        </p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="matriculation">Matricule</Label>
          <Input
            id="matriculation"
            name="matriculation"
            onChange={(e) => setMatriculation(e.target.value)}
            type="text"
            placeholder="204"
            required
            autoComplete="matriculation"
          />
        </div>
        <PasswordInput
          name="password"
          label="Mot de passe"
          // required
          autoComplete="current-password"
          placeholder="••••••••"
        />

        {isError && (
          <div className="animate-in fade-in zoom-in slide-in-from-top-2! duration-300">
            <div className="mt-1 rounded-md bg-red-200 py-2 px-3 text-xs text-red-800 text-center shadow">
              {error.message}
            </div>
          </div>
        )}

        <Button
          type="submit"
          variant="default"
          className="mt-2 hover:bg-secondary cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Se connecter"
          )}
        </Button>
      </div>
    </form>
  );
}

// FORM: SignUpForm
function SignUpForm() {
  const handleSignUp = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("UI: Sign Up form submitted");
  };
  return (
    <form
      onSubmit={handleSignUp}
      autoComplete="on"
      className="flex flex-col gap-8"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your details below to sign up
        </p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-1">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            required
            autoComplete="name"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
            autoComplete="email"
          />
        </div>
        <PasswordInput
          name="password"
          label="Mot de passe"
          required
          autoComplete="new-password"
          placeholder="••••••••"
        />
        <Button type="submit" variant="outline" className="mt-2">
          Sign Up
        </Button>
      </div>
    </form>
  );
}

// CONTAINER for the forms to handle state switching
function AuthFormContainer() {
  const [isSignIn] = useState(true);
  // const isDev = process.env.NODE_ENV === "development";
  return (
    <div className="mx-auto grid w-[350px] gap-2">
      {isSignIn ? <SignInForm /> : <SignUpForm />}
      {/* <div className="text-center text-sm">
        {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
        <Button
          variant="link"
          className="pl-1 text-foreground"
          onClick={() => setIsSignIn(!isSignIn)}
        >
          {isSignIn ? "Request an account" : "Sign in"}
        </Button>
      </div> */}
      {/* {isDev && (
        <>
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              for testing purposes | comptes de démonstration
            </span>
          </div>
          <div className="p-4 bg-muted/15 rounded-lg">
            <p className="text-sm font-medium mb-2">Demo Accounts:</p>
            <hr className="mb-4" />
            <div className="space-y-1 text-xs text-muted-foreground">
              <table className="w-full border">
                <tbody>
                  <tr className="bg-muted/50 border">
                    <td className="p-2">Matricule</td>
                    <td className="p-2">Mot de passe</td>
                  </tr>
                  <tr className="border">
                    <td className="p-2 text-red-700">0000 (dev)</td>
                    <td className="p-2">password</td>
                  </tr>
                  <tr className="border">
                    <td className="p-2 text-red-700">0157</td>
                    <td className="p-2">password</td>
                  </tr>
                  <tr className="border">
                    <td className="p-2 text-red-700">0118</td>
                    <td className="p-2">password</td>
                  </tr>
                  <tr className="border">
                    <td className="p-2 text-red-700">207</td>
                    <td className="p-2">password</td>
                  </tr>
                  <tr className="border">
                    <td className="p-2 text-red-700">208 (admin)</td>
                    <td className="p-2">password</td>
                  </tr>
                  <tr>
                <td className="p-2">staff</td>
                <td className="p-2">Password123!</td>
              </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )} */}
    </div>
  );
}

// --- MAIN EXPORTED COMPONENT ---

interface AuthUIProps {
  image?: {
    src: string;
    alt: string; // alt is kept for semantic prop naming, but not used in bg-image
  };
  quote?: {
    text: string;
    author: string;
  };
}

const defaultImage = {
  src: "/wings.jpg",
  alt: "A beautiful interior design",
};

// text: "La gestion efficace des véhicules est essentielle pour optimiser les opérations et réduire les coûts dans toute organisation.",
const defaultQuote = {
  text: "Système Intégré de Gestion du Matériel roulant et du Patrimoine. Suivi complet et optimisation des ressources.",
  author: "Anac Gabon",
};

export function AuthUI({
  image = defaultImage,
  quote = defaultQuote,
}: AuthUIProps) {
  return (
    <div className="w-full min-h-screen md:grid md:grid-cols-2">
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>

      {/* Left Column: The Form */}
      <div className="flex h-screen items-center justify-center p-6 md:h-auto md:p-0 md:py-12">
        <AuthFormContainer />
      </div>

      {/* Right Column: The Image and Quote */}
      <div
        className="hidden md:block relative bg-cover bg-center"
        style={{ backgroundImage: `url(${image.src})` }}
      >
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Centered Quote */}
        <div className="relative z-10 flex h-full items-center justify-center p-10">
          <blockquote className="space-y-2 text-center text-white">
            <p className="text-lg font-medium">“{quote.text}”</p>
            <cite className="block text-sm font-light text-neutral-300 not-italic">
              - {quote.author}
            </cite>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
