import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Asset } from '../types';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, MapPin } from 'lucide-react';
import { ConditionBadge, TypeBadge } from './Badge';

interface AssetMapProps {
  assets: Asset[];
  selectedAsset?: Asset | null;
  height?: string;
  zoom?: number;
}

// Custom Leaflet Pin generator using SVG strings
const createCustomPinIcon = (condition: 'Good' | 'Fair' | 'Poor') => {
  const colors = {
    Good: '#10b981', // Emerald
    Fair: '#f59e0b', // Amber
    Poor: '#ef4444', // Red
  };
  const pinColor = colors[condition] || '#3b82f6';

  const svgHtml = `
    <div style="position: relative; width: 30px; height: 40px;">
      <svg width="30" height="40" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.71573 0 0 6.71573 0 15C0 26.25 15 40 15 40C15 40 30 26.25 30 15C30 6.71573 23.2843 0 15 0Z" fill="${pinColor}"/>
        <circle cx="15" cy="14" r="6" fill="#FFFFFF"/>
      </svg>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-marker',
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -36],
  });
};

// Component to dynamically adjust center/zoom
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const AssetMap: React.FC<AssetMapProps> = ({
  assets,
  selectedAsset,
  height = '420px',
  zoom = 8,
}) => {
  const navigate = useNavigate();

  // Filter assets that have valid coordinates
  const validAssets = assets.filter(
    (a) => a.latitude !== null && a.longitude !== null && !isNaN(Number(a.latitude)) && !isNaN(Number(a.longitude))
  );

  // Default center: Gujarat centroid (~ 22.3, 71.8) or selected asset coordinate
  const defaultCenter: [number, number] = selectedAsset?.latitude && selectedAsset?.longitude
    ? [selectedAsset.latitude, selectedAsset.longitude]
    : validAssets.length > 0 && validAssets[0].latitude && validAssets[0].longitude
    ? [validAssets[0].latitude, validAssets[0].longitude]
    : [23.0225, 72.5714]; // Ahmedabad default

  const mapZoom = selectedAsset ? 13 : zoom;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100" style={{ height }}>
      {validAssets.length === 0 && !selectedAsset ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-50/90 text-slate-500 p-4">
          <MapPin className="w-10 h-10 text-slate-400 mb-2 animate-bounce" />
          <p className="font-semibold text-sm">No Geolocation Coordinates Found</p>
          <p className="text-xs text-slate-400 text-center max-w-xs mt-1">
            Register latitude & longitude on assets to display interactive Leaflet map markers.
          </p>
        </div>
      ) : null}

      <MapContainer
        center={defaultCenter}
        zoom={mapZoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController center={defaultCenter} zoom={mapZoom} />

        {validAssets.map((asset) => (
          <Marker
            key={asset.id}
            position={[asset.latitude!, asset.longitude!]}
            icon={createCustomPinIcon(asset.condition)}
          >
            <Popup className="custom-popup">
              <div className="p-1 min-w-[200px]">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    {asset.asset_code}
                  </span>
                  <TypeBadge type={asset.asset_type} />
                </div>
                <h4 className="font-bold text-xs text-slate-900 leading-tight mb-1">{asset.name}</h4>
                <p className="text-[11px] text-slate-500 mb-2">{asset.district}, {asset.taluka}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <ConditionBadge condition={asset.condition} />
                  <button
                    onClick={() => navigate(`/assets/${asset.id}`)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
