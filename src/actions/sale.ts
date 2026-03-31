"use server";

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, doc, updateDoc } from "firebase/firestore";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logAudit } from "./audit";
import { revalidatePath } from "next/cache";

export async function createSale(data: any) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Acesso negado");

  // Validate duplicate Chassi if active
  const salesRef = collection(db, "sales");
  const q = query(salesRef, where("chassi", "==", data.chassi), where("status", "==", true));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    throw new Error("Já existe uma venda ativa com este chassi.");
  }

  const saleRef = await addDoc(salesRef, {
    chassi: data.chassi,
    clientName: data.clientName,
    factoryOrder: data.factoryOrder,
    model: data.model,
    version: data.version,
    color: data.color,
    modelYear: Number(data.modelYear),
    used: data.used,
    financed: data.financed,
    brandId: data.brandId,
    stockTypeId: data.stockTypeId,
    storeId: data.storeId,
    userId: session.user.id,
    status: true,
    createdAt: new Date().toISOString()
  });

  await logAudit("CREATE", "SALE", saleRef.id, `Venda criada (Chassi: ${data.chassi})`);
  revalidatePath("/sales");
  revalidatePath("/dashboard");
  return { id: saleRef.id };
}

export async function deleteSaleLogical(id: string) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "Administrador") throw new Error("Acesso negado. Apenas admin pode excluir.");

  const saleDocRef = doc(db, "sales", id);
  await updateDoc(saleDocRef, {
    status: false,
    updatedAt: new Date().toISOString()
  });

  await logAudit("DELETE_LOGICAL", "SALE", id, `Venda inativada`);
  revalidatePath("/sales");
  revalidatePath("/dashboard");
  return true;
}
