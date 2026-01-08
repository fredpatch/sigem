export function normalizeRefValue(input: string) {
    return input
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();
}
