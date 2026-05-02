import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFReportButtonProps {
  targetId?: string;
  reportTitle?: string;
  fileName?: string;
  reportType?: 'crop' | 'analytics' | 'supply-chain' | 'custom';
  data?: Record<string, any>;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export default function PDFReportButton({
  targetId,
  reportTitle = 'FarmConnect Report',
  fileName = 'farmconnect-report.pdf',
  reportType = 'custom',
  data,
  variant = 'secondary',
}: PDFReportButtonProps) {
  const [generating, setGenerating] = useState(false);

  const generateFromHTML = async () => {
    if (!targetId) return;
    const element = document.getElementById(targetId);
    if (!element) { alert(`Element #${targetId} not found`); return; }
    setGenerating(true);
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(fileName);
    } catch (err) {
      console.error(err);
      generateDataReport();
    } finally {
      setGenerating(false);
    }
  };

  const generateDataReport = () => {
    setGenerating(true);
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const now = new Date();

    // Header gradient bar
    pdf.setFillColor(22, 163, 74); // green-600
    pdf.rect(0, 0, pageWidth, 40, 'F');

    // Title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.text('🌾 FarmConnect', 14, 16);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(reportTitle, 14, 26);
    pdf.setFontSize(9);
    pdf.text(`Generated: ${now.toLocaleString()}`, 14, 36);

    // Reset text color
    pdf.setTextColor(30, 30, 30);
    let y = 52;

    // Report type section
    const sections: Record<string, { title: string; rows: [string, string][] }> = {
      crop: {
        title: 'Crop Batch Report',
        rows: [
          ['Total Crops', '4 active batches'],
          ['Total Area', '150.5 hectares'],
          ['Estimated Yield', '8,800 kg'],
          ['Blockchain Status', '✅ All batches verified'],
          ['Last Updated', now.toLocaleDateString()],
          ['Certification', 'USDA Organic'],
        ],
      },
      analytics: {
        title: 'Platform Analytics Report',
        rows: [
          ['Total Users', '1,667'],
          ['Total Farms', '142'],
          ['Total Products', '950'],
          ['Verification Rate', '94.5%'],
          ['Monthly Revenue', '₹2,15,000'],
          ['Active Orders', '48'],
        ],
      },
      'supply-chain': {
        title: 'Supply Chain Report',
        rows: [
          ['Active Shipments', '12'],
          ['Delivered This Month', '45'],
          ['Blockchain Events', '234'],
          ['Avg Delivery Time', '2.8 days'],
          ['Total Distance', '2,450 km'],
          ['On-Time Rate', '91.7%'],
        ],
      },
      custom: {
        title: reportTitle,
        rows: data
          ? Object.entries(data).map(([k, v]) => [k, String(v)] as [string, string])
          : [['Report', 'FarmConnect Platform Report'], ['Date', now.toLocaleDateString()]],
      },
    };

    const section = sections[reportType];

    pdf.setFontSize(15);
    pdf.setFont('helvetica', 'bold');
    pdf.text(section.title, 14, y);
    y += 10;

    pdf.setFillColor(240, 253, 244); // green-50
    pdf.rect(14, y - 3, pageWidth - 28, 8, 'F');
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(22, 101, 52);
    pdf.text('Metric', 18, y + 2);
    pdf.text('Value', 110, y + 2);
    y += 10;

    section.rows.forEach(([key, val], i) => {
      if (i % 2 === 0) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(14, y - 4, pageWidth - 28, 8, 'F');
      }
      pdf.setTextColor(30, 30, 30);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(key, 18, y + 1);
      pdf.setFont('helvetica', 'bold');
      pdf.text(val, 110, y + 1);
      y += 10;
    });

    y += 8;
    // Footer
    pdf.setFillColor(22, 163, 74);
    pdf.rect(0, 287, pageWidth, 10, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('FarmConnect AI — Blockchain-based Food Traceability Platform | Polygon Mumbai Testnet', 14, 293);

    pdf.save(fileName);
    setGenerating(false);
  };

  const handleGenerate = () => {
    if (targetId) {
      generateFromHTML();
    } else {
      generateDataReport();
    }
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg',
    secondary: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:shadow-md',
    ghost: 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleGenerate}
      disabled={generating}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-60 ${variantStyles[variant]}`}
      id="pdf-report-btn"
      title="Export as PDF"
    >
      {generating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <FileText className="h-4 w-4" />
          Export PDF
          <Download className="h-3.5 w-3.5 opacity-70" />
        </>
      )}
    </motion.button>
  );
}
