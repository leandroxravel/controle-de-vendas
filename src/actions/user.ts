"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, doc, updateDoc } from "firebase/firestore";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logAudit } from "./audit";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function createUser(data: any) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "Administrador") throw new Error("Acesso negado");

  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", data.email));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) throw new Error("E-mail já está em uso.");

  const passwordHash = await bcrypt.hash(data.password, 10);

  const userRef = await addDoc(usersRef, {
    name: data.name,
    email: data.email,
    passwordHash,
    roleName: data.roleName || "Vendedor", // Direct string lookup
    storeId: data.storeId || null,
    status: data.status,
    createdAt: new Date().toISOString()
  });

  await logAudit("CREATE", "USER", userRef.id, `Criou usuário ${data.email}`);
  revalidatePath("/users");
  return { id: userRef.id, email: data.email };
}

export async function changeUserPassword(id: string, newPassword: string) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "Administrador") throw new Error("Acesso negado");

  const passwordHash = await bcrypt.hash(newPassword, 10);

  const userDocRef = doc(db, "users", id);
  await updateDoc(userDocRef, {
    passwordHash,
    updatedAt: new Date().toISOString()
  });

  await logAudit("PASSWORD_RESET", "USER", id, `Senha redefinida para usuário via Admin`);
  return true;
}
