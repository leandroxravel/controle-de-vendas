export const runtime = "edge";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Store, Plus } from "lucide-react";

export default async function StoresPage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user.role !== "Administrador") {
    return <div className="p-8 text-center text-red-500 font-medium">Acesso negado. Apenas Administradores podem acessar esta página.</div>;
  }

  const storesSnapshot = await getDocs(query(collection(db, "stores"), orderBy("createdAt", "desc")));
  const stores = storesSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      status: data.status,
      _count: { sales: "N/A", users: "N/A" } // Aggregation typically done via counters in Firestore
    };
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Store className="text-primary-600" /> Gestão de Lojas
        </h1>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2">
          <Plus size={18} /> Nova Loja
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b text-sm text-gray-600">
              <th className="p-4 font-semibold">ID</th>
              <th className="p-4 font-semibold">Nome da Loja</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Usuários</th>
              <th className="p-4 font-semibold">Vendas</th>
              <th className="p-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm text-gray-800">
            {stores.map((store) => (
              <tr key={store.id} className="hover:bg-gray-50">
                <td className="p-4 text-gray-500 font-mono text-xs">{store.id.slice(0,6)}...</td>
                <td className="p-4 font-medium">{store.name}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${store.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {store.status ? "Ativa" : "Inativa"}
                  </span>
                </td>
                <td className="p-4">{store._count.users}</td>
                <td className="p-4">{store._count.sales}</td>
                <td className="p-4 text-right">
                  <button className="text-primary-600 hover:text-primary-800 font-medium">Editar</button>
                </td>
              </tr>
            ))}
            {stores.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">Nenhuma loja cadastrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
