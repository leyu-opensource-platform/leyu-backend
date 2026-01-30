import bcrypt from 'bcrypt';
// hashing password
export const hashPassword = (password: string) => bcrypt.hash(password, 10);
// verify password
export const verifyPassword = (password: string, hashedPassword: string) =>
  bcrypt.compare(password, hashedPassword);
