export function flattenDirectoryPages(data: any) {
  return data?.pages?.flatMap((p: any) => p.items) ?? [];
}
