import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/useAuth";
import { decodeJwt } from "@/lib/jwt";
import logoImg from "@/assets/logo.png";

type Props = {
  allowed?: string[];
  children: React.ReactElement;
};

type JwtClaims = {
  exp?: number;
  realm_access?: {
    roles?: string[];
  };
  resource_access?: Record<string, { roles?: string[] }>;
  roles?: string[];
  groups?: string[];
};

function normalizeRole(role: string) {
  return role
    .replace(/^realm:/, "")
    .replace(/^role_/, "")
    .replace(/^client:[^:]+:/, "")
    .toLowerCase();
}

function extractRoles(token: string) {
  try {
    const claims = decodeJwt<JwtClaims>(token);
    const roles = new Set<string>();

    claims.realm_access?.roles?.forEach((role) => roles.add(normalizeRole(role)));
    claims.roles?.forEach((role) => roles.add(normalizeRole(role)));
    claims.groups?.forEach((role) => roles.add(normalizeRole(role)));

    Object.values(claims.resource_access ?? {}).forEach((resource) => {
      resource.roles?.forEach((role) => roles.add(normalizeRole(role)));
    });

    return {
      expired: typeof claims.exp === "number" && claims.exp * 1000 <= Date.now(),
      roles,
    };
  } catch {
    return {
      expired: true,
      roles: new Set<string>(),
    };
  }
}

function AccessDenied() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0D1A] px-6 text-white">
      <div className="max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
          <img src={logoImg} alt="Altair" className="h-12 w-12 object-contain" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm leading-6 text-white/55">
          This area is reserved for accounts with the required role. You are signed in,
          but your account cannot view this workspace.
        </p>
        <a
          href="/app"
          className="mt-6 inline-flex rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/[0.1] hover:text-white"
        >
          Back to the app
        </a>
      </div>
    </div>
  );
}

export function ProtectedRoute({ allowed, children }: Props) {
  const { token } = useAuth();
  const location = useLocation();

  const effectiveToken = token ?? sessionStorage.getItem("altair_token");

  if (!effectiveToken) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  const { expired, roles } = extractRoles(effectiveToken);

  if (expired) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (allowed?.length && !allowed.some((role) => roles.has(role))) {
    return <AccessDenied />;
  }

  return children;
}
