import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold text-primary-600 mb-8 w-full text-center">
          Sistema de Controle de Vendas de Veículos
        </h1>
      </div>
      <p className="text-xl mb-8 text-gray-700">Bem-vindo ao sistema de gestão corporativa.</p>
      
      <div className="flex gap-4">
        <Link 
          href="/login" 
          className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 transition"
        >
          Acessar o Sistema
        </Link>
      </div>
    </main>
  );
}
