import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Asset } from '../types';
import { fetchAssetById, updateAssetRecord } from '../services/assetService';
import { AssetForm } from '../components/AssetForm';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Toast } from '../components/Toast';

export const EditAsset: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadAsset(id);
    }
  }, [id]);

  const loadAsset = async (assetId: string) => {
    setIsLoading(true);
    try {
      const data = await fetchAssetById(assetId);
      setAsset(data);
    } catch (e) {
      console.error('Error fetching asset to edit', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (
    assetData: Omit<Asset, 'id' | 'created_at' | 'updated_at'>
  ) => {
    if (!id) return;
    const updated = await updateAssetRecord(id, assetData);
    setToastMsg(`Asset "${updated.name}" updated successfully!`);
    setTimeout(() => {
      navigate(`/assets/${updated.id}`);
    }, 1200);
  };

  if (isLoading) return <LoadingSpinner message="Fetching asset profile for edit..." />;
  if (!asset) return <div className="p-8 text-center font-bold text-rose-600">Asset record not found</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
      <AssetForm initialData={asset} onSubmit={handleSubmit} isEditing={true} />
    </div>
  );
};
