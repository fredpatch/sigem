export const catchError = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
