"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logAudit } from "./audit";
import { revalidatePath } from "next/cache";

export async function createStore(data: { name: string, status: boolean }) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "Administrador") throw new Error("Acesso negado");

  const storeRef = await addDoc(collection(db, "stores"), { 
    name: data.name, 
    status: data.status,
    createdAt: new Date().toISOString()
  });

  await logAudit("CREATE", "STORE", storeRef.id, `Criou loja ${data.name}`);
  revalidatePath("/stores");
  return { id: storeRef.id, name: data.name };
}

export async function updateStore(id: string, data: { name: string, status: boolean }) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "Administrador") throw new Error("Acesso negado");

  const storeDocRef = doc(db, "stores", id);
  await updateDoc(storeDocRef, { 
    name: data.name, 
    status: data.status,
    updatedAt: new Date().toISOString()
  });

  await logAudit("UPDATE", "STORE", id, `Atualizou loja ${data.name}`);
  revalidatePath("/stores");
  return { id, name: data.name };
}
