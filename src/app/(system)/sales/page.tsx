import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ShoppingCart, Plus, Search, Filter } from "lucide-react";

export default async function SalesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) return null;

  const isVendedor = session.user.role === "Vendedor";

  let conditions = [where("status", "==", true)];
  if (isVendedor) {
    conditions.push(where("userId", "==", session.user.id));
  }

  const salesSnapshot = await getDocs(query(collection(db, "sales"), ...conditions));
  
  const salesData = salesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
  salesData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const sales = salesData.map(sale => ({
    ...sale,
    brand: { name: sale.brandId },
    stockType: { name: sale.stockTypeId },
    store: { name: sale.storeId },
    user: { name: sale.userId }
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShoppingCart className="text-primary-600" /> Registro de Vendas
        </h1>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2 w-full sm:w-auto justify-center">
          <Plus size={18} /> Nova Venda
        </button>
      </div>

      {/* Toolbar / Filters (MVP static layout) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por cliente ou chassi..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 w-full md:w-auto justify-center">
          <Filter size={18} /> Filtros
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-gray-50 border-b text-sm text-gray-600">
              <th className="p-4 font-semibold">Chassi</th>
              <th className="p-4 font-semibold">Cliente</th>
              <th className="p-4 font-semibold">Veículo</th>
              <th className="p-4 font-semibold">Marca</th>
              <th className="p-4 font-semibold">Loja</th>
              <th className="p-4 font-semibold">Estoque</th>
              <th className="p-4 font-semibold">Financeiro</th>
              <th className="p-4 font-semibold">Vendedor</th>
              <th className="p-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm text-gray-800">
            {sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-gray-50">
                <td className="p-4 font-mono text-gray-500">{sale.chassi}</td>
                <td className="p-4 font-medium">{sale.clientName}</td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span>{sale.model} {sale.version}</span>
                    <span className="text-xs text-gray-500">{sale.color} - {sale.modelYear}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs tracking-wide">
                    {sale.brand.name}
                  </span>
                </td>
                <td className="p-4">{sale.store.name}</td>
                <td className="p-4">{sale.stockType.name}</td>
                <td className="p-4">
                  <div className="flex gap-1">
                    {sale.financed ? <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">Financiado</span> : <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">À Vista</span>}
                    {sale.used && <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs">Usado</span>}
                  </div>
                </td>
                <td className="p-4 text-gray-500 font-mono text-xs">{sale.id.slice(0,6)}...</td>
                <td className="p-4 text-right space-x-3">
                  <button className="text-primary-600 hover:text-primary-800 font-medium">Editar</button>
                  {!isVendedor && <button className="text-red-600 hover:text-red-800 font-medium">Excluir</button>}
                </td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-gray-500">Nenhuma venda encontrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
