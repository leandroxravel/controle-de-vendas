import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Car, Store, Users, Banknote, ShieldAlert } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return <div>Acesso negado.</div>;
  }

  const role = session.user.role;
  const isVendedor = role === "Vendedor";
  const userId = session.user.id;

  let conditions = [];
  if (isVendedor) {
    conditions.push(where("userId", "==", userId));
  }
  conditions.push(where("status", "==", true));

  const salesRef = collection(db, "sales");
  const salesSnapshot = await getDocs(query(salesRef, ...conditions));
  const totalSales = salesSnapshot.size;

  let totalFinanced = 0;
  let totalUsed = 0;
  const salesByBrandMap: Record<string, number> = {};

  salesSnapshot.forEach(doc => {
    const data = doc.data();
    if (data.financed) totalFinanced++;
    if (data.used) totalUsed++;
    
    // Grouping manually since Firestore doesn't have groupBy
    const bId = data.brandId || "outros";
    salesByBrandMap[bId] = (salesByBrandMap[bId] || 0) + 1;
  });

  const salesByBrand = Object.entries(salesByBrandMap).map(([brandId, count]) => ({
    brandId,
    _count: count
  }));

  // Static brand names mapping or fetching from a brands collection
  const getBrandName = (id: string) => id; // In NoSQL, consider storing brandName in Sale document directly

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-4">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-full"><Car size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Total de Vendas</p><p className="text-3xl font-bold text-gray-900">{totalSales}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-4">
          <div className="p-4 bg-green-100 text-green-600 rounded-full"><Banknote size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Com Financiamento</p><p className="text-3xl font-bold text-gray-900">{totalFinanced}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-4">
          <div className="p-4 bg-purple-100 text-purple-600 rounded-full"><ShieldAlert size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Usados na Troca</p><p className="text-3xl font-bold text-gray-900">{totalUsed}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Vendas por Marca</h2>
          <div className="space-y-4">
            {salesByBrand.length > 0 ? salesByBrand.map(stat => (
              <div key={stat.brandId} className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600 font-medium">{getBrandName(stat.brandId)}</span>
                <span className="bg-primary-100 text-primary-700 font-bold px-3 py-1 rounded-full">{stat._count}</span>
              </div>
            )) : <p className="text-gray-500 text-sm">Nenhuma venda registrada.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
