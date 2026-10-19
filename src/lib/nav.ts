import { router } from "expo-router";

/** Loosely-typed navigation helpers so screens stay readable. */
export const go = (path: string) => router.push(path as never);
export const goReplace = (path: string) => router.replace(path as never);
export const goWith = (pathname: string, params: Record<string, string | number>) =>
  router.push({ pathname, params } as never);
