/**
 * Validates password strength.
 * Returns null if valid, or an error message string if invalid.
 */
export function validatePasswordStrength(password: string): string | null {
    if (!password) return "Password is required.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password.length > 72) return "Password must be 72 characters or less.";
    if (!/[A-Z]/.test(password)) return "Password must include at least one uppercase letter.";
    if (!/[a-z]/.test(password)) return "Password must include at least one lowercase letter.";
    if (!/[0-9]/.test(password)) return "Password must include at least one number.";
    return null;
}

/**
 * Returns an object describing which password rules pass/fail.
 * Useful for rendering a strength checklist UI.
 */
export function getPasswordChecks(password: string) {
    return [
        { label: "At least 8 characters", pass: password.length >= 8 },
        { label: "One uppercase letter (A-Z)", pass: /[A-Z]/.test(password) },
        { label: "One lowercase letter (a-z)", pass: /[a-z]/.test(password) },
        { label: "One number (0-9)", pass: /[0-9]/.test(password) },
    ];
}
