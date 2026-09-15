/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useMemo, useState } from "react";
import * as authService from "../services/auth.service.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const session = authService.getSession();
    return session?.user ?? null;
  });
  const [booting, _setBooting] = useState(false);

  const value = useMemo(() => {
    return {
      user,
      booting,
      async login(email, password) {
        const res = await authService.login({ email, password });
        setUser(res.user);
        return res;
      },
      async logout() {
        await authService.logout();
        setUser(null);
      },
      async startOtp(email) {
        return authService.startOtp({ email });
      },
      async verifyOtp(email, code) {
        const res = await authService.verifyOtp({ email, code });
        setUser(res.user);
        return res;
      },
      async requestPasswordReset(email) {
        return authService.requestPasswordReset({ email });
      },
      async resendOtp(email) {
        return authService.resendOtp({ email });
      },
    };
  }, [user, booting]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
