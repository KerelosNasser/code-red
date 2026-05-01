# Global Auth Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a mandatory site-wide authentication gate that blocks all content until a valid phone number (Admin or Team Member) is provided.

**Architecture:** A top-level `AuthGate` component in the root layout will wrap the application. It will check for a valid session in `localStorage`. If missing, it renders a full-screen login overlay. Authenticated users are managed via a new `useAuth` hook.

**Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Lucide React, Zod, React Hook Form.

---

### Task 1: Centralize Auth Logic into a Hook

**Files:**
- Create: `hooks/use-auth.ts`
- Modify: `lib/access-storage.ts`

- [ ] **Step 1: Update lib/access-storage.ts with logout and event**

```typescript
// lib/access-storage.ts additions
export const AUTH_CHANGE_EVENT = "dara_auth_change";

export function triggerAuthChange() {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

// Update storeAccess and clearStoredAccess to trigger event
export function storeAccess(access: StoredAccess) {
  if (typeof window === "undefined") return
  localStorage.setItem(ACCESS_STORAGE_KEY, JSON.stringify(access))
  setSessionValidated(true)
  triggerAuthChange()
}

export function clearStoredAccess() {
  if (typeof window === "undefined") return
  localStorage.removeItem(ACCESS_STORAGE_KEY)
  sessionStorage.removeItem(SESSION_VALIDATED_KEY)
  triggerAuthChange()
}
```

- [ ] **Step 2: Create hooks/use-auth.ts**

```typescript
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
```

- [ ] **Step 3: Commit**

```bash
git add lib/access-storage.ts hooks/use-auth.ts
git commit -m "feat: add useAuth hook and auth change events"
```

---

### Task 2: Create the AuthGate Component

**Files:**
- Create: `components/auth-gate.tsx`

- [ ] **Step 1: Implement components/auth-gate.tsx**

```typescript
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, RefreshCw, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { loginSchema, normalizePhoneNumber, type LoginFormValues } from "@/lib/registration";
import { checkUserAccess } from "@/lib/api-client";
import { storeAccess } from "@/lib/access-storage";

const ADMIN_PHONES = (process.env.NEXT_PUBLIC_ADMIN_PHONES || "").split(",").map(p => normalizePhoneNumber(p.trim()));

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { access, isLoading, isAuthenticated } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: "" }
  });

  const onLogin = async (values: LoginFormValues) => {
    setIsVerifying(true);
    const normalizedPhone = normalizePhoneNumber(values.phone);

    // Admin Check
    if (ADMIN_PHONES.includes(normalizedPhone)) {
      storeAccess({
        phone: normalizedPhone,
        role: "admin",
        firstName: "Admin",
        lastName: ""
      });
      toast.success("Welcome, Admin!");
      setIsVerifying(false);
      return;
    }

    // Sheets Check
    try {
      const result = await checkUserAccess({ phone: normalizedPhone });
      if (result.data?.hasAccess) {
        storeAccess({
          phone: normalizedPhone,
          role: result.data.role || "member",
          teamName: result.data.teamName || "",
          firstName: result.data.user?.first_name || "",
          lastName: result.data.user?.last_name || ""
        });
        toast.success("Access Granted!");
      } else {
        toast.error("Access Denied. Please contact your team administrator.");
      }
    } catch (error) {
      toast.error("Connection error. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-900" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-md px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="h-2 w-full bg-blue-900" />
        <div className="p-8 md:p-10">
          <div className="mb-8 flex flex-col items-center text-center">
            <Image src="/icon-dara-logo.png" alt="DaRa Logo" width={70} height={70} className="mb-4" />
            <h1 className="text-3xl font-extrabold tracking-tight text-blue-900">Access Protected</h1>
            <p className="mt-2 text-sm text-slate-500 uppercase tracking-widest font-bold">DaRa Platform Entrance</p>
          </div>

          <form onSubmit={handleSubmit(onLogin)} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">Enter Registered Phone Number</Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 border-r border-slate-200 pr-3">+20</div>
                <Input 
                  {...register("phone")}
                  placeholder="01XXXXXXXXX" 
                  className="h-14 border-slate-200 pl-16 text-lg transition-all focus:border-blue-900 focus:ring-4 focus:ring-blue-900/5"
                  autoFocus
                />
              </div>
              {errors.phone && <p className="text-xs font-medium text-red-500">{errors.phone.message}</p>}
            </div>

            <Button 
              type="submit" 
              className="h-14 w-full rounded-xl bg-blue-900 text-lg font-bold text-white shadow-lg transition-all hover:bg-blue-800 active:scale-[0.98]"
              disabled={isVerifying}
            >
              {isVerifying ? <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
              {isVerifying ? "Verifying..." : "Enter Platform"}
            </Button>
          </form>

          <div className="mt-8 rounded-xl bg-amber-50 p-4 border border-amber-100 flex gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-xs leading-relaxed text-amber-900">
              Only registered members and administrators can enter. If you don't have access, please contact your team lead.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/auth-gate.tsx
git commit -m "feat: add AuthGate component"
```

---

### Task 3: Apply AuthGate to Root Layout

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Wrap children with AuthGate in app/layout.tsx**

```typescript
// app/layout.tsx
import { AuthGate } from "@/components/auth-gate";
// ... existing imports

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthGate>
          <Navbar />
          <main>{children}</main>
          <Toaster position="top-center" richColors />
        </AuthGate>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: wrap application with AuthGate"
```

---

### Task 4: Cleanup app/register/page.tsx

**Files:**
- Modify: `app/register/page.tsx`

- [ ] **Step 1: Remove login view from app/register/page.tsx**

```typescript
// app/register/page.tsx
// Update the component to only render the Dashboard if admin, 
// otherwise redirect or show nothing (since the Gate handles the login)

export default function RegisterPage() {
  const { access, isLoading, isAuthenticated } = useAuth();
  // ... existing fetch logic
  
  if (isLoading) return null; // Handled by Gate
  
  if (!isAuthenticated || access?.role !== 'admin') {
     // This shouldn't happen if Gate is working, but safety first
     return (
       <div className="flex min-h-screen items-center justify-center">
         <p className="text-slate-500 font-bold">Unauthorized. Admins only.</p>
       </div>
     );
  }

  // Render ONLY the Admin Dashboard View here
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
       {/* Dashboard JSX ... */}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/register/page.tsx
git commit -m "refactor: app/register/page.tsx to dashboard only"
```

---

### Task 5: Final Verification

- [ ] **Step 1: Test Admin Login**
  - Enter an admin phone number from `.env`.
  - Verify site opens and "Registration" link is visible in Navbar.
- [ ] **Step 2: Test Team Member Login**
  - Enter a number from the `Users` sheet.
  - Verify site opens, "Registration" is hidden, but "Assets" is visible.
- [ ] **Step 3: Test Unauthorized**
  - Enter a random number.
  - Verify gate stays closed with an error message.
- [ ] **Step 4: Test Logout**
  - Click logout in Navbar.
  - Verify the Gate immediately reappears.
