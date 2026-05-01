import { useState, useEffect } from "react";
import { getStoredAccess, AUTH_CHANGE_EVENT, type StoredAccess } from "@/lib/access-storage";

export function useAuth() {
  const [access, setAccess] = useState<StoredAccess | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const check = () => {
      setAccess(getStoredAccess());
      setIsLoading(false);
    };

    check();
    window.addEventListener(AUTH_CHANGE_EVENT, check);
    window.addEventListener("storage", check);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, check);
      window.removeEventListener("storage", check);
    };
  }, []);

  return { access, isLoading, isAuthenticated: !!access };
}
