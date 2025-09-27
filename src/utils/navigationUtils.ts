export const resetNavigation = (navigation: any, routeName: string, params: Record<string, any> = {}) => {
  navigation.reset({
    index: 0,
    routes: [{ name: routeName, params }],
  });
};