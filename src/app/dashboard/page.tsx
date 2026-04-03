// src/app/dashboard/page.tsx

import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path if necessary

const prisma = new PrismaClient();

// Fixed data as per requirements
const FIXED_BRANDS = ['FIAT', 'GM', 'VW', 'FORD', 'TOYOTA', 'HYUNDAI', 'RENAULT', 'PEUGEOT', 'CHEVROLET', 'HONDA', 'NISSAN', 'MITSUBISHI'];
const FIXED_STORES = ['Loja Centro', 'Loja Norte', 'Loja Sul', 'Loja Leste', 'Loja Oeste', 'Loja Principal'];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id || !session.user.role) {
    redirect('/api/auth/signin'); // Redirect to login if not authenticated or missing user info
  }

  const userRole = session.user.role;
  const userId = session.user.id;
  const userName = session.user.name || 'Usuário';

  let totalSales = 0;
  let totalSalesBySeller: { name: string; count: number }[] = [];
  let totalSalesByStore: { name: string; count: number }[] = [];
  let totalSalesByBrand: { name: string; count: number }[] = [];
  let totalSalesWithFinancing = 0;
  let totalSalesWithUsedCar = 0;

  try {
    const whereClause = userRole === 'VENDEDOR' ? { sellerId: userId } : {};

    // Total de vendas
    totalSales = await prisma.sale.count({ where: whereClause });

    // Total com financiamento
    totalSalesWithFinancing = await prisma.sale.count({
      where: {
        ...whereClause,
        hasFinancing: true,
      },
    });

    // Total com usado
    totalSalesWithUsedCar = await prisma.sale.count({
      where: {
        ...whereClause,
        hasUsedCar: true,
      },
    });

    // Total por vendedor
    if (userRole === 'ADMIN') {
      const salesBySellerRaw = await prisma.sale.groupBy({
        by: ['sellerId'],
        _count: {
          id: true,
        },
      });

      const sellerIds = salesBySellerRaw.map(s => s.sellerId);
      const sellers = await prisma.user.findMany({
        where: { id: { in: sellerIds } },
        select: { id: true, name: true },
      });

      totalSalesBySeller = salesBySellerRaw.map(sbs => ({
        name: sellers.find(s => s.id === sbs.sellerId)?.name || 'Desconhecido',
        count: sbs._count.id,
      }));
    } else {
      // For VENDEDOR, only show their own total
      totalSalesBySeller = [{
        name: userName,
        count: totalSales,
      }];
    }

    // Total por loja
    const salesByStoreRaw = await prisma.sale.groupBy({
      by: ['store'],
      _count: {
        id: true,
      },
      where: whereClause,
    });
    totalSalesByStore = salesByStoreRaw.map(sbs => ({
      name: sbs.store,
      count: sbs._count.id,
    })).sort((a, b) => a.name.localeCompare(b.name));

    // Fill in missing stores with 0 sales for a complete list
    FIXED_STORES.forEach(fixedStore => {
      if (!totalSalesByStore.some(s => s.name === fixedStore)) {
        totalSalesByStore.push({ name: fixedStore, count: 0 });
      }
    });
    totalSalesByStore.sort((a, b) => a.name.localeCompare(b.name));


    // Total por marca
    const salesByBrandRaw = await prisma.sale.groupBy({
      by: ['brand'],
      _count: {
        id: true,
      },
      where: whereClause,
    });
    totalSalesByBrand = salesByBrandRaw.map(sbb => ({
      name: sbb.brand,
      count: sbb._count.id,
    })).sort((a, b) => a.name.localeCompare(b.name));

    // Fill in missing brands with 0 sales for a complete list
    FIXED_BRANDS.forEach(fixedBrand => {
      if (!totalSalesByBrand.some(b => b.name === fixedBrand)) {
        totalSalesByBrand.push({ name: fixedBrand, count: 0 });
      }
    });
    totalSalesByBrand.sort((a, b) => a.name.localeCompare(b.name));

  } catch (error) {
    console.error('Erro ao carregar dados do dashboard:', error);
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-8">
        <p className="text-red-600 text-lg font-medium">Ocorreu um erro ao carregar o dashboard. Por favor, tente novamente.</p>
      </div>
    );
  }

  const DashboardCard = ({ title, value }: { title: string; value: string | number }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center justify-center">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-2 text-4xl font-extrabold text-gray-900">{value}</p>
    </div>
  );

  const DashboardListCard = ({ title, items }: { title: string; items: { name: string; count: number }[] }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
      {items.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {items.map((item, index) => (
            <li key={index} className="py-2 flex justify-between items-center text-gray-700">
              <span className="text-lg">{item.name}</span>
              <span className="text-lg font-bold text-indigo-600">{item.count}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">Nenhum dado encontrado para {title.toLowerCase()}.</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Dashboard de Vendas</h1>
        <p className="text-gray-600 text-lg">
          Olá, <span className="font-semibold">{userName}</span>! Você está logado como <span className="font-semibold">{userRole === 'ADMIN' ? 'Administrador' : 'Vendedor'}</span>.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <DashboardCard title="Total de Vendas" value={totalSales} />
        <DashboardCard title="Vendas c/ Financiamento" value={totalSalesWithFinancing} />
        <DashboardCard title="Vendas c/ Usado" value={totalSalesWithUsedCar} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <DashboardListCard
          title="Vendas por Vendedor"
          items={totalSalesBySeller}
        />
        <DashboardListCard
          title="Vendas por Loja"
          items={totalSalesByStore}
        />
        <DashboardListCard
          title="Vendas por Marca"
          items={totalSalesByBrand}
        />
      </section>
    </div>
  );
}