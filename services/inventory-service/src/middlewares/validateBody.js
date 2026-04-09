import { ZodError } from "zod";
function formatZodError(err) {
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
export function validatePart(schema, target) {
    return async (req, res, next) => {
        try {
            // parseAsync pour supporter les effets asynchrones/transform
            const parsed = await schema.parseAsync(req[target]);
            // Remplace la valeur par la version "clean" (coercions, defaults, transforms appliqués)
            req[target] = parsed;
            return next();
        }
        catch (e) {
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
export function validateBody(schema) {
    return validatePart(schema, "body");
}
/** validateQuery(schema) */
export function validateQuery(schema) {
    return validatePart(schema, "query");
}
/** validateParams(schema) */
export function validateParams(schema) {
    return validatePart(schema, "params");
}
/**
 * Variante combinée: tu peux valider plusieurs parties en une fois.
 * Exemple:
 *   validate({ body: BodySchema, query: QuerySchema })
 */
export function validate(schemas) {
    const middlewares = [];
    if (schemas.body)
        middlewares.push(validateBody(schemas.body));
    if (schemas.query)
        middlewares.push(validateQuery(schemas.query));
    if (schemas.params)
        middlewares.push(validateParams(schemas.params));
    return async (req, res, next) => {
        // Exécute séquentiellement pour surcharger req.* au fur et à mesure
        let idx = 0;
        const run = () => middlewares[idx++]
            ? middlewares[idx - 1](req, res, (err) => (err ? next(err) : run()))
            : next();
        run();
    };
}
