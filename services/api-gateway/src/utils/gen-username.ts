/**
 * Extracts a clean username from the email's local part.
 */
export function extractUsernameFromEmail(email: string): string {
  const [raw] = email.toLowerCase().split("@");
  return raw.replace(/[^a-z0-9._]/g, "");
}

/**
 * Generates a unique username using an external check function.
 */
export async function generateUniqueUsername(
  email: string,
  isTaken: (username: string) => Promise<boolean>
): Promise<string> {
  const baseUsername = extractUsernameFromEmail(email);
  let username = baseUsername;
  let counter = 0;

  while (await isTaken(username)) {
    counter++;
    username = `${baseUsername}${counter}`;
  }

  return username;
}

export const generateUserNameFromLastnameMatriculation = (
  matriculation: string,
  lastname: string
) => {
  const cleanLastname = lastname
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z]/g, ""); // Keep only letters

  const username = `${cleanLastname}.${matriculation}`.toLowerCase();

  return username;
};
