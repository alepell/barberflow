import { describe, it, expect } from "vitest";

// Test middleware route-matching logic as pure functions
// The actual middleware uses NextAuth's auth() wrapper,
// so we test the routing decision logic here

interface MockAuth {
  user?: { role?: string };
}

function resolveMiddleware(
  pathname: string,
  auth: MockAuth | null
): { action: "redirect"; to: string } | { action: "next" } {
  const isLoggedIn = !!auth;
  const userRole = auth?.user?.role;

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/cadastro");
  const isClientePage =
    pathname.startsWith("/dashboard") || pathname.startsWith("/novo");
  const isAdminPage = pathname.startsWith("/admin");

  if (isAuthPage && isLoggedIn) {
    if (userRole === "ADMIN") {
      return { action: "redirect", to: "/admin/dashboard" };
    }
    return { action: "redirect", to: "/dashboard" };
  }

  if (isClientePage && !isLoggedIn) {
    return { action: "redirect", to: "/login" };
  }

  if (isAdminPage && !isLoggedIn) {
    return { action: "redirect", to: "/login" };
  }

  if (isAdminPage && userRole !== "ADMIN") {
    return { action: "redirect", to: "/dashboard" };
  }

  return { action: "next" };
}

describe("Middleware: routing logic", () => {
  describe("Páginas de autenticação (login/cadastro)", () => {
    it("deve permitir acesso a /login para usuários não autenticados", () => {
      const result = resolveMiddleware("/login", null);
      expect(result).toEqual({ action: "next" });
    });

    it("deve permitir acesso a /cadastro para usuários não autenticados", () => {
      const result = resolveMiddleware("/cadastro", null);
      expect(result).toEqual({ action: "next" });
    });

    it("deve redirecionar CLIENTE autenticado de /login para /dashboard", () => {
      const result = resolveMiddleware("/login", {
        user: { role: "CLIENTE" },
      });
      expect(result).toEqual({ action: "redirect", to: "/dashboard" });
    });

    it("deve redirecionar ADMIN autenticado de /login para /admin/dashboard", () => {
      const result = resolveMiddleware("/login", { user: { role: "ADMIN" } });
      expect(result).toEqual({ action: "redirect", to: "/admin/dashboard" });
    });

    it("deve redirecionar CLIENTE autenticado de /cadastro para /dashboard", () => {
      const result = resolveMiddleware("/cadastro", {
        user: { role: "CLIENTE" },
      });
      expect(result).toEqual({ action: "redirect", to: "/dashboard" });
    });
  });

  describe("Área do cliente (/dashboard, /novo)", () => {
    it("deve redirecionar não autenticado de /dashboard para /login", () => {
      const result = resolveMiddleware("/dashboard", null);
      expect(result).toEqual({ action: "redirect", to: "/login" });
    });

    it("deve redirecionar não autenticado de /novo para /login", () => {
      const result = resolveMiddleware("/novo", null);
      expect(result).toEqual({ action: "redirect", to: "/login" });
    });

    it("deve permitir acesso a /dashboard para CLIENTE autenticado", () => {
      const result = resolveMiddleware("/dashboard", {
        user: { role: "CLIENTE" },
      });
      expect(result).toEqual({ action: "next" });
    });

    it("deve permitir acesso a /novo para CLIENTE autenticado", () => {
      const result = resolveMiddleware("/novo", {
        user: { role: "CLIENTE" },
      });
      expect(result).toEqual({ action: "next" });
    });

    it("deve permitir acesso a /dashboard para ADMIN autenticado", () => {
      const result = resolveMiddleware("/dashboard", {
        user: { role: "ADMIN" },
      });
      expect(result).toEqual({ action: "next" });
    });
  });

  describe("Área admin (/admin)", () => {
    it("deve redirecionar não autenticado de /admin para /login", () => {
      const result = resolveMiddleware("/admin/dashboard", null);
      expect(result).toEqual({ action: "redirect", to: "/login" });
    });

    it("deve redirecionar CLIENTE de /admin para /dashboard", () => {
      const result = resolveMiddleware("/admin/dashboard", {
        user: { role: "CLIENTE" },
      });
      expect(result).toEqual({ action: "redirect", to: "/dashboard" });
    });

    it("deve permitir acesso a /admin para ADMIN", () => {
      const result = resolveMiddleware("/admin/dashboard", {
        user: { role: "ADMIN" },
      });
      expect(result).toEqual({ action: "next" });
    });

    it("deve proteger /admin/agenda para não-admin", () => {
      const result = resolveMiddleware("/admin/agenda", {
        user: { role: "CLIENTE" },
      });
      expect(result).toEqual({ action: "redirect", to: "/dashboard" });
    });

    it("deve permitir /admin/agenda para ADMIN", () => {
      const result = resolveMiddleware("/admin/agenda", {
        user: { role: "ADMIN" },
      });
      expect(result).toEqual({ action: "next" });
    });
  });
});
