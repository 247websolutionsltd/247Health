// Support contact details come from the environment so nothing is invented in the app. Set the ones you offer in .env.
export const support = {
  email: process.env.EXPO_PUBLIC_SUPPORT_EMAIL?.trim() || null,
  phone: process.env.EXPO_PUBLIC_SUPPORT_PHONE?.trim() || null,
  hours: process.env.EXPO_PUBLIC_SUPPORT_HOURS?.trim() || null,
};
