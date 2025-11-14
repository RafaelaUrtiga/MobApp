import React, { createContext, useContext, useEffect, useState } from "react";
import { router } from "expo-router";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updatePassword,
  User as FirebaseUser,
} from "firebase/auth";
import { auth, db } from "../storage/firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs, Timestamp } from "firebase/firestore";

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

// Coleção de usuários no Firestore
const USERS_COLLECTION = "users";

// Função para buscar dados do usuário no Firestore
async function getUserData(firebaseUser: FirebaseUser): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, firebaseUser.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        id: firebaseUser.uid,
        name: data.name,
        email: firebaseUser.email || "",
      };
    }
    // Se não existir documento, criar um básico
    return {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Usuário",
      email: firebaseUser.email || "",
    };
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setReady] = useState(false);

  useEffect(() => {
    // Observar mudanças no estado de autenticação do Firebase
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Usuário autenticado - buscar dados no Firestore
        const userData = await getUserData(firebaseUser);
        setUser(userData);
      } else {
        // Usuário não autenticado
        setUser(null);
      }
      setReady(true);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await getUserData(userCredential.user);
      if (userData) {
        setUser(userData);
        router.replace("/tabs/events");
      }
    } catch (error: any) {
      let errorMessage = "Não foi possível entrar";
      if (error.code === "auth/user-not-found") {
        errorMessage = "Usuário não encontrado";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Senha incorreta";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email inválido";
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = "Credenciais inválidas";
      }
      throw new Error(errorMessage);
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      // Verificar se email já existe
      const usersRef = collection(db, USERS_COLLECTION);
      const q = query(usersRef, where("email", "==", email));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        throw new Error("Email já cadastrado");
      }

      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Salvar dados adicionais no Firestore
      await setDoc(doc(db, USERS_COLLECTION, userCredential.user.uid), {
        name,
        email,
        createdAt: Timestamp.now(),
      });

      // Atualizar estado
      setUser({
        id: userCredential.user.uid,
        name,
        email,
      });
      
      router.replace("/tabs/events");
    } catch (error: any) {
      let errorMessage = "Não foi possível cadastrar";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email já cadastrado";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email inválido";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Senha muito fraca";
      } else if (error.message === "Email já cadastrado") {
        errorMessage = error.message;
      }
      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      router.replace("/auth/login");
    } catch (error: any) {
      throw new Error("Erro ao sair: " + error.message);
    }
  };

  const changePassword = async (newPass: string) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("Usuário não autenticado");
      }
      await updatePassword(currentUser, newPass);
    } catch (error: any) {
      let errorMessage = "Não foi possível alterar a senha";
      if (error.code === "auth/requires-recent-login") {
        errorMessage = "Por segurança, faça login novamente antes de alterar a senha";
      }
      throw new Error(errorMessage);
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
