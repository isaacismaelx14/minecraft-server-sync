export function slugifyDisplayName(displayName: string): string {
  return (
    displayName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 32) || 'server'
  );
}

export async function generateProfileId(
  displayName: string,
  checkExists: (id: string) => Promise<boolean>,
): Promise<string> {
  const base = slugifyDisplayName(displayName);

  if (!(await checkExists(base))) {
    return base;
  }

  // Collision: append 4-char random alphanumeric suffix
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base.slice(0, 27)}-${suffix}`;
}
