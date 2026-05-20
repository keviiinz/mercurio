const SPECIAL = /[!@#$%^&*()\-_=+\[\]{}|;':",.<>/?`~\\]/;

export function validateUsername(username: string): string | null {
  if (!username?.trim()) return "El usuario es obligatorio.";
  if (username.length > 20) return "El usuario no puede tener más de 20 caracteres.";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "La contraseña es obligatoria.";
  if (password.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
  if (password.length > 16) return "La contraseña no puede tener más de 16 caracteres.";
  if (!/[0-9]/.test(password)) return "La contraseña debe contener al menos un número.";
  if (!SPECIAL.test(password)) return "La contraseña debe contener al menos un carácter especial (!@#$...).";
  return null;
}
