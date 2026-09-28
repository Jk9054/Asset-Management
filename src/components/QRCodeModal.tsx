import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Asset } from '../types';
import { X, Download, Printer, QrCode } from 'lucide-react';

interface QRCodeModalProps {
  asset: Asset;
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ asset, isOpen, onClose }) => {
  const qrRef = useRef<HTMLDivElement>(null);
  if (!isOpen) return null;

  const assetUrl = `${window.location.origin}/assets/${asset.id}`;

  const handleDownloadQR = () => {
    const svgElement = qrRef.current?.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 60;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.fillText(asset.asset_code, canvas.width / 2, canvas.height - 20);
      }
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${asset.asset_code}_QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden text-center animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm">Asset Physical QR Identification</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 inline-block" ref={qrRef}>
            <QRCodeSVG value={assetUrl} size={180} level="H" includeMargin={true} />
            <div className="font-mono font-bold text-sm text-slate-900 mt-2">{asset.asset_code}</div>
          </div>

          <div>
            <h4 className="font-bold text-sm text-slate-900 leading-tight">{asset.name}</h4>
            <p className="text-xs text-slate-500 mt-1">{asset.district} District | {asset.responsible_division}</p>
            <p className="text-[11px] text-slate-400 mt-2 bg-blue-50 p-2 rounded-lg border border-blue-100">
              Attach QR sticker onto physical infrastructure asset site for instant field inspection scanning.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleDownloadQR}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" /> Download PNG
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors"
            >
              <Printer className="w-4 h-4" /> Print Label
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
