// src/middlewares/validateBody.ts
import type { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";

type Target = "body" | "query" | "params";

function formatZodError(err: ZodError) {
  return err.issues.map((i) => ({
    path: i.path.join("."),
    code: i.code,
    message: i.message,
  }));
}

/**
 * Valide et remplace req[target] par la version parsée.
 * Si erreur: 400 + payload d'erreurs lisible.
 */
export function validatePart(schema: ZodSchema, target: Target) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // parseAsync pour supporter les effets asynchrones/transform
      const parsed = await schema.parseAsync((req as any)[target]);
      // Remplace la valeur par la version "clean" (coercions, defaults, transforms appliqués)
      (req as any)[target] = parsed;
      return next();
    } catch (e: any) {
      if (e instanceof ZodError) {
        return res.status(400).json({
          message: "Validation error",
          target,
          errors: formatZodError(e),
        });
      }
      return next(e);
    }
  };
}

/** validateBody(schema) */
export function validateBody(schema: ZodSchema) {
  return validatePart(schema, "body");
}

/** validateQuery(schema) */
export function validateQuery(schema: ZodSchema) {
  return validatePart(schema, "query");
}

/** validateParams(schema) */
export function validateParams(schema: ZodSchema) {
  return validatePart(schema, "params");
}

/**
 * Variante combinée: tu peux valider plusieurs parties en une fois.
 * Exemple:
 *   validate({ body: BodySchema, query: QuerySchema })
 */
export function validate(schemas: Partial<Record<Target, ZodSchema>>) {
  const middlewares: Array<
    (req: Request, res: Response, next: NextFunction) => Promise<void>
  > = [];
  if (schemas.body) middlewares.push(validateBody(schemas.body) as any);
  if (schemas.query) middlewares.push(validateQuery(schemas.query) as any);
  if (schemas.params) middlewares.push(validateParams(schemas.params) as any);

  return async (req: Request, res: Response, next: NextFunction) => {
    // Exécute séquentiellement pour surcharger req.* au fur et à mesure
    let idx = 0;
    const run = () =>
      middlewares[idx++]
        ? middlewares[idx - 1](req, res, (err) => (err ? next(err) : run()))
        : next();
    run();
  };
}
