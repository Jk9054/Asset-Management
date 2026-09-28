import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Asset, MaintenanceRecord } from '../types';

export const exportAssetsToCSV = (assets: Asset[], filename = 'infrastructure_assets.csv') => {
  const headers = [
    'Asset Code',
    'Asset Name',
    'Type',
    'District',
    'Taluka',
    'Address',
    'Condition',
    'Status',
    'Construction Year',
    'Estimated Cost (INR)',
    'Responsible Division',
    'Latitude',
    'Longitude',
    'Created At',
  ];

  const rows = assets.map((a) => [
    `"${a.asset_code || ''}"`,
    `"${a.name.replace(/"/g, '""')}"`,
    `"${a.asset_type}"`,
    `"${a.district}"`,
    `"${a.taluka}"`,
    `"${a.address.replace(/"/g, '""')}"`,
    `"${a.condition}"`,
    `"${a.status}"`,
    a.construction_year,
    a.estimated_cost,
    `"${a.responsible_division}"`,
    a.latitude ?? '',
    a.longitude ?? '',
    `"${a.created_at}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportMaintenanceToCSV = (
  records: MaintenanceRecord[],
  assetsMap: Record<string, Asset>,
  filename = 'maintenance_history.csv'
) => {
  const headers = [
    'Maintenance ID',
    'Asset Code',
    'Asset Name',
    'District',
    'Date',
    'Type',
    'Description',
    'Cost (INR)',
    'Condition After',
    'Recorded By',
  ];

  const rows = records.map((r) => {
    const asset = assetsMap[r.asset_id];
    return [
      `"${r.id}"`,
      `"${asset?.asset_code || 'N/A'}"`,
      `"${(asset?.name || 'Unknown').replace(/"/g, '""')}"`,
      `"${asset?.district || 'N/A'}"`,
      `"${r.maintenance_date}"`,
      `"${r.maintenance_type}"`,
      `"${r.description.replace(/"/g, '""')}"`,
      r.cost,
      `"${r.condition_after}"`,
      `"${r.created_by}"`,
    ];
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateAssetPDF = (asset: Asset, maintenanceList: MaintenanceRecord[] = []) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header Bar
  doc.setFillColor(15, 23, 42); // Navy slate
  doc.rect(0, 0, 210, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('GOVERNMENT INFRASTRUCTURE ASSET REPORT', 14, 15);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Roads & Buildings Department | Lifecycle Audit Record', 14, 22);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 155, 22);

  // Asset Overview Card
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(asset.name, 14, 42);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235); // Blue
  doc.text(`ASSET CODE: ${asset.asset_code}`, 14, 48);

  // Details Grid Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 54, 182, 60, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  const leftColX = 18;
  const rightColX = 105;
  let y = 62;

  // Row 1
  doc.setFont('helvetica', 'bold');
  doc.text('Asset Type:', leftColX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(asset.asset_type, leftColX + 30, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Condition:', rightColX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(asset.condition, rightColX + 30, y);

  // Row 2
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('District / Taluka:', leftColX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${asset.district} / ${asset.taluka}`, leftColX + 30, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Current Status:', rightColX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(asset.status, rightColX + 30, y);

  // Row 3
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Construction Year:', leftColX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(String(asset.construction_year), leftColX + 30, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Est. Asset Cost:', rightColX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`₹ ${Number(asset.estimated_cost).toLocaleString('en-IN')}`, rightColX + 30, y);

  // Row 4
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Division:', leftColX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(asset.responsible_division, leftColX + 30, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Coordinates:', rightColX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(asset.latitude ? `${asset.latitude.toFixed(4)}°N, ${asset.longitude?.toFixed(4)}°E` : 'N/A', rightColX + 30, y);

  // Row 5
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Address:', leftColX, y);
  doc.setFont('helvetica', 'normal');
  const addressText = doc.splitTextToSize(asset.address, 140);
  doc.text(addressText, leftColX + 30, y);

  // Description section
  let nextY = 122;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Asset Description & Technical Summary', 14, nextY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  const descLines = doc.splitTextToSize(asset.description || 'No detailed technical description provided.', 180);
  doc.text(descLines, 14, nextY + 6);

  nextY += 12 + descLines.length * 4;

  // Maintenance Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Maintenance & Lifecycle Audit Logs', 14, nextY);

  if (maintenanceList.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('No maintenance records registered for this asset yet.', 14, nextY + 7);
  } else {
    const tableData = maintenanceList.map((m) => [
      m.maintenance_date,
      m.maintenance_type,
      m.description,
      `₹${Number(m.cost).toLocaleString('en-IN')}`,
      m.condition_after,
      m.created_by,
    ]);

    autoTable(doc, {
      startY: nextY + 4,
      head: [['Date', 'Type', 'Description', 'Cost (INR)', 'Condition', 'Recorded By']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
      },
      columnStyles: {
        2: { cellWidth: 60 },
      },
    });
  }

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Government Infrastructure Asset Management Platform | Official Document | Page ${i} of ${pageCount}`,
      14,
      288
    );
  }

  doc.save(`${asset.asset_code}_Asset_Report.pdf`);
};
