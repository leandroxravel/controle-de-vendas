import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Users, UserPlus } from "lucide-react";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user.role !== "Administrador") {
    return <div className="p-8 text-center text-red-500 font-medium">Acesso negado. Apenas Administradores podem acessar esta página.</div>;
  }

  const usersSnapshot = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc")));
  const users = usersSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      email: data.email,
      roleName: data.roleName,
      storeId: data.storeId,
      status: data.status
    };
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="text-primary-600" /> Gestão de Usuários
        </h1>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2">
          <UserPlus size={18} /> Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b text-sm text-gray-600">
              <th className="p-4 font-semibold">Nome</th>
              <th className="p-4 font-semibold">E-mail</th>
              <th className="p-4 font-semibold">Perfil</th>
              <th className="p-4 font-semibold">Loja Vinculada</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm text-gray-800">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{user.name}</td>
                <td className="p-4 text-gray-600">{user.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${user.roleName === 'Administrador' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {user.roleName}
                  </span>
                </td>
                <td className="p-4 text-gray-500">{user.storeId || "Nenhuma"}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user.status ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="p-4 text-right space-x-3">
                  <button className="text-primary-600 hover:text-primary-800 font-medium">Editar</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">Nenhum usuário encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
