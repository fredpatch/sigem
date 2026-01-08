let navigateFn: (path: string) => void;

export const setNavigator = (navigate: (path: string) => void) => {
  navigateFn = navigate;
};

export const redirectTo = (path: string) => {
  if (navigateFn) navigateFn(path);
};
