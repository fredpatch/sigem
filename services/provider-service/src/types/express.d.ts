// src/types/express.d.ts

import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: string;
      username?: string;
      role: string;
      sessionId: string;
      matriculation?: string;
    };
  }
}

// Rendre ce fichier un module pour éviter les erreurs de portée globale
export {};
