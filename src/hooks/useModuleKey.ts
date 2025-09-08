import { useLocation } from "react-router-dom";
import strings from "src/localization/strings";

type KeysWithBack = {
  [K in keyof typeof strings]: (typeof strings)[K] extends { back: string }
    ? K
    : never;
}[keyof typeof strings];

/**
 * Generic hook that maps a URL path segment to a strings key with `.back`.
 * Enforces type safety and throws if no valid mapping exists.
 * @param mapping - Record URL path segment to KeysWithBack (string: value) for keys in strings that have .back
 * @param adminRoot - Optional string representing admin route prefix (default: "admin")
 */
export function useModuleKey(
  mapping: Record<string, KeysWithBack>,
  adminRoot = "admin"
): KeysWithBack {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith(`/${adminRoot}`);
  const pathSegments = location.pathname.split("/").filter(Boolean);

  const pathSegment = isAdminPath ? pathSegments[1] : pathSegments[0];

  if (!pathSegment || !(pathSegment in mapping)) {
    throw new Error(
      `useModuleKey: No mapping found for path segment '${pathSegment}'. Update mapping.`
    );
  }

  const moduleKey = mapping[pathSegment];

  if (!(moduleKey in strings)) {
    throw new Error(
      `useModuleKey: Module key '${String(moduleKey)}' does not exist in strings.ts`
    );
  }

  return moduleKey;
}