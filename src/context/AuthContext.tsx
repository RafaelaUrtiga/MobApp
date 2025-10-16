import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

type User = { id: string; name: string; email: string };
type AuthCtx = {
  user: User | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  changePassword: (newPass: string) => Promise<void>;
};

const Ctx = createContext<AuthCtx>({} as any);

const USER_KEY = "auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      // Criar usuário de teste se não existir
      const usersRaw = await AsyncStorage.getItem("users");
      const users: any[] = usersRaw ? JSON.parse(usersRaw) : [];
      
      const testEmail = "rafa@email.com";
      const testExists = users.find((u) => u.email === testEmail);
      
      if (!testExists) {
        users.push({
          id: "test-001",
          name: "Rafa Teste",
          email: testEmail,
          password: "123456",
        });
        await AsyncStorage.setItem("users", JSON.stringify(users));
      }

      // Restaurar sessão se existir
      const raw = await AsyncStorage.getItem(USER_KEY);
      if (raw) setUser(JSON.parse(raw));
      setReady(true);
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    const raw = await AsyncStorage.getItem("users");
    const users: any[] = raw ? JSON.parse(raw) : [];
    const found = users.find(
      (u) => u.email === email && u.password === password
    );
    if (!found)
      throw new Error("Credenciais inválidas ou usuário não cadastrado");
    await AsyncStorage.setItem(
      USER_KEY,
      JSON.stringify({ id: found.id, name: found.name, email: found.email })
    );
    setUser({ id: found.id, name: found.name, email: found.email });
    router.replace("/tabs/events");
  };

  const signUp = async (name: string, email: string, password: string) => {
    const raw = await AsyncStorage.getItem("users");
    const users: any[] = raw ? JSON.parse(raw) : [];
    if (users.some((u) => u.email === email))
      throw new Error("Email já cadastrado");
    const newUser = { id: Date.now().toString(), name, email, password };
    users.push(newUser);
    await AsyncStorage.setItem("users", JSON.stringify(users));
    await AsyncStorage.setItem(
      USER_KEY,
      JSON.stringify({ id: newUser.id, name, email })
    );
    setUser({ id: newUser.id, name, email });
    router.replace("/tabs/events");
  };

  const signOut = async () => {
    await AsyncStorage.removeItem(USER_KEY);
    setUser(null);
    router.replace("/auth/login");
  };

  const changePassword = async (newPass: string) => {
    if (!user) return;
    const raw = await AsyncStorage.getItem("users");
    const users: any[] = raw ? JSON.parse(raw) : [];
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      users[idx].password = newPass;
      await AsyncStorage.setItem("users", JSON.stringify(users));
    }
  };

  return (
    <Ctx.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthReady,
        signIn,
        signUp,
        signOut,
        changePassword,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
