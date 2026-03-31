"use client";

import { useState } from "react";
import { FileBarChart, Download, FileText } from "lucide-react";

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);

  const handleExportCSV = () => {
    setLoading(true);
    // Simulating CSV Export (In real app, this calls an API route that returns CSV string)
    setTimeout(() => {
      const csvContent = "data:text/csv;charset=utf-8,ID,Chassi,Cliente,Modelo,Loja,Vendedor\n1,XYZ123,João Silva,Fiat Argo,Loja Matriz,Vendedor 1";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "relatorio_vendas.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      setLoading(false);
    }, 1000);
  };

  const handleExportPDF = () => {
    setLoading(true);
    // Usually uses html2pdf, jsPDF or an API
    setTimeout(() => {
      alert("No MVP, a exportação PDF pode usar a impressão nativa do navegador (Ctrl+P) ou bibliotecas como jsPDF.");
      window.print();
      setLoading(false);
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileBarChart className="text-primary-600" /> Central de Relatórios
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
              <Download size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Exportar para Excel (CSV)</h2>
              <p className="text-sm text-gray-500">Baixe os dados brutos para criar suas próprias análises.</p>
            </div>
          </div>
          <button 
            onClick={handleExportCSV}
            disabled={loading}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex justify-center items-center gap-2"
          >
            {loading ? "Processando..." : "Gerar Planilha CSV"}
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-lg">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Exportar para PDF</h2>
              <p className="text-sm text-gray-500">Gere um documento formatado para impressão rápida.</p>
            </div>
          </div>
          <button 
            onClick={handleExportPDF}
            disabled={loading}
            className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex justify-center items-center gap-2"
          >
            {loading ? "Processando..." : "Gerar Relatório PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
