
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SecurityEvent, DashboardMetrics } from '@/types/security';

export interface ExportData {
  timeRange: string;
  metrics?: DashboardMetrics;
  events?: SecurityEvent[];
  charts?: any;
  exportedAt: string;
}

export const exportToPDF = (data: ExportData, filename: string = 'security-report') => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(40, 44, 52);
  doc.text('SecureSOC - Relatório de Segurança', margin, 30);

  // Subtitle
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Período: ${data.timeRange}`, margin, 40);
  doc.text(`Gerado em: ${new Date(data.exportedAt).toLocaleString('pt-BR')}`, margin, 50);

  let yPosition = 70;

  // Metrics Summary
  if (data.metrics) {
    doc.setFontSize(16);
    doc.setTextColor(40, 44, 52);
    doc.text('Resumo Executivo', margin, yPosition);
    yPosition += 15;

    const metricsData = [
      ['Metric', 'Value'],
      ['Total de Eventos', data.events?.length.toString() || '0'],
      ['Vulnerabilidades Críticas', data.metrics.vulnerabilities.critical.toString()],
      ['Ativos Monitorados', data.metrics.assets.total.toString()],
      ['Ativos Online', data.metrics.assets.online.toString()],
      ['Score de Risco', `${data.metrics.assets.riskScore}%`]
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [metricsData[0]],
      body: metricsData.slice(1),
      margin: { left: margin },
      styles: {
        fontSize: 10,
        cellPadding: 5
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255
      }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;
  }

  // Events Table
  if (data.events && data.events.length > 0) {
    // Check if we need a new page
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 30;
    }

    doc.setFontSize(16);
    doc.setTextColor(40, 44, 52);
    doc.text('Eventos de Segurança', margin, yPosition);
    yPosition += 10;

    const eventsData = data.events.map(event => [
      event.title,
      event.severity,
      event.source,
      event.status,
      event.timestamp.toLocaleDateString('pt-BR')
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Título', 'Severidade', 'Fonte', 'Status', 'Data']],
      body: eventsData,
      margin: { left: margin },
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 }
      }
    });
  }

  // Save the PDF
  doc.save(`${filename}.pdf`);
};

export const exportToCSV = (data: ExportData, filename: string = 'security-data') => {
  if (!data.events || data.events.length === 0) {
    throw new Error('Nenhum dado disponível para exportação');
  }

  // CSV Headers
  const headers = [
    'ID',
    'Título',
    'Descrição',
    'Severidade',
    'Fonte',
    'Status',
    'Data',
    'Hora'
  ];

  // CSV Rows
  const rows = data.events.map(event => [
    event.id,
    event.title,
    event.description,
    event.severity,
    event.source,
    event.status,
    event.timestamp.toLocaleDateString('pt-BR'),
    event.timestamp.toLocaleTimeString('pt-BR')
  ]);

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      row.map(field => 
        typeof field === 'string' && field.includes(',') 
          ? `"${field.replace(/"/g, '""')}"` 
          : field
      ).join(',')
    )
  ].join('\n');

  // Add BOM for Excel compatibility
  const BOM = '\uFEFF';
  const csvWithBOM = BOM + csvContent;

  // Create and download file
  const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportToJSON = (data: ExportData, filename: string = 'security-data') => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
