import { useLocation } from "react-router-dom";
import strings from "src/localization/strings";

type StringsKey = keyof typeof strings;

/**
 * Generic hook that maps a URL path segment to a strings key.
 * Enforces type safety and throws if no valid mapping exists.
 */
export function useModuleKey<T extends StringsKey>(
  mapping: Record<string, T>,
  adminRoot = "admin"
): T {
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
      `useModuleKey: Module key '${moduleKey}' does not exist in strings.ts`
    );
  }

  return moduleKey;
}
