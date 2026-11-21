export function validateSignUpPassword(value: string): string | null {
  if (value.length < 6) {
    return "Password must be at least 6 characters long";
  }
  if (value.length > 128) {
    return "Password must be at most 128 characters long";
  }
  if (!/[A-Z]/.test(value)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/[a-z]/.test(value)) {
    return "Password must contain at least one lowercase letter";
  }
  return null;
}

export function validateSignInPassword(value: string): string | null {
  if (value.length === 0) {
    return "Please enter your password";
  }
  return null;
}
