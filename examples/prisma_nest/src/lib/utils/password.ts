import { compare, hash } from "bcryptjs";

export function checkPassword(attempt: string, hashedPassword: string): Promise<boolean> {
  return compare(attempt, hashedPassword);
}

export async function setPassword(password: string): Promise<string> {
  return hash(password, 10);
}
