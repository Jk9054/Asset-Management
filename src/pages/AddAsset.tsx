import React, { useState } from 'react';
import { Asset } from '../types';
import { createAsset } from '../services/assetService';
import { AssetForm } from '../components/AssetForm';
import { Toast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';

export const AddAsset: React.FC = () => {
  const navigate = useNavigate();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleSubmit = async (
    assetData: Omit<Asset, 'id' | 'created_at' | 'updated_at'>
  ) => {
    const created = await createAsset(assetData);
    setToastMsg(`Infrastructure asset "${created.name}" registered successfully!`);
    setTimeout(() => {
      navigate(`/assets/${created.id}`);
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
      <AssetForm onSubmit={handleSubmit} isEditing={false} />
    </div>
  );
};
