export const onRequest: PagesFunction = async (context) => {
    // This top-level middleware no longer handles admin auth.
    // Admin auth is now handled in functions/api/admin/_middleware.ts
    // with real JWT verification.
    return context.next();
}
