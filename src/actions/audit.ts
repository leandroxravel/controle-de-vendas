"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function logAudit(
  action: "CREATE" | "UPDATE" | "DELETE_LOGICAL" | "PASSWORD_RESET",
  entity: "USER" | "STORE" | "SALE",
  entityId: string, // Changed to string because Firestore uses string IDs
  details?: string
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    console.error("AuditLog falhou: Sem sessão ativa.");
    return false;
  }

  try {
    await addDoc(collection(db, "auditLogs"), {
      action,
      entity,
      entityId,
      details: details || null,
      userId: session.user.id,
      createdAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Falha ao registrar AuditLog:", error);
    return false;
  }
}
