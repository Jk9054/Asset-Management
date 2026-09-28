import React, { useState } from 'react';
import { Asset, AssetCondition, AssetStatus, AssetType } from '../types';
import { DEMO_DISTRICTS, DEMO_DIVISIONS } from '../services/mockData';
import { uploadAssetPhoto } from '../services/assetService';
import { Save, ArrowLeft, Upload, MapPin, Building, DollarSign, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AssetFormProps {
  initialData?: Partial<Asset>;
  onSubmit: (assetData: Omit<Asset, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  isEditing?: boolean;
}

export const AssetForm: React.FC<AssetFormProps> = ({
  initialData,
  onSubmit,
  isEditing = false,
}) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [assetCode, setAssetCode] = useState(initialData?.asset_code || '');
  const [name, setName] = useState(initialData?.name || '');
  const [assetType, setAssetType] = useState<AssetType>(initialData?.asset_type || 'Road');
  const [description, setDescription] = useState(initialData?.description || '');
  const [district, setDistrict] = useState(initialData?.district || DEMO_DISTRICTS[0]);
  const [taluka, setTaluka] = useState(initialData?.taluka || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [latitude, setLatitude] = useState<string>(
    initialData?.latitude !== undefined && initialData?.latitude !== null
      ? String(initialData.latitude)
      : ''
  );
  const [longitude, setLongitude] = useState<string>(
    initialData?.longitude !== undefined && initialData?.longitude !== null
      ? String(initialData.longitude)
      : ''
  );
  const [constructionYear, setConstructionYear] = useState<number>(
    initialData?.construction_year || new Date().getFullYear() - 5
  );
  const [estimatedCost, setEstimatedCost] = useState<number>(initialData?.estimated_cost || 50000000);
  const [condition, setCondition] = useState<AssetCondition>(initialData?.condition || 'Good');
  const [status, setStatus] = useState<AssetStatus>(initialData?.status || 'Active');
  const [responsibleDivision, setResponsibleDivision] = useState(
    initialData?.responsible_division || DEMO_DIVISIONS[0]
  );
  const [photoUrl, setPhotoUrl] = useState(initialData?.photo_url || '');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Auto-generate code helper
  const handleAutoGenerateCode = () => {
    const prefix = assetType.slice(0, 3).toUpperCase();
    const distPrefix = district.slice(0, 3).toUpperCase();
    const randomNum = Math.floor(100 + Math.random() * 900);
    setAssetCode(`${prefix}-${distPrefix}-${randomNum}`);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const url = await uploadAssetPhoto(file);
      setPhotoUrl(url);
    } catch (err) {
      console.error('Failed to upload photo', err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Form Validations
    if (!assetCode.trim()) {
      setErrorMsg('Asset Code is required.');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('Asset Name is required.');
      return;
    }
    if (!district.trim()) {
      setErrorMsg('District is required.');
      return;
    }

    const latNum = latitude.trim() ? parseFloat(latitude) : null;
    const lngNum = longitude.trim() ? parseFloat(longitude) : null;

    if (latitude.trim() && isNaN(latNum!)) {
      setErrorMsg('Latitude must be a valid number.');
      return;
    }
    if (longitude.trim() && isNaN(lngNum!)) {
      setErrorMsg('Longitude must be a valid number.');
      return;
    }
    if (constructionYear < 1900 || constructionYear > new Date().getFullYear() + 1) {
      setErrorMsg('Construction year must be between 1900 and present year.');
      return;
    }
    if (estimatedCost < 0) {
      setErrorMsg('Estimated cost cannot be negative.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        asset_code: assetCode.trim().toUpperCase(),
        name: name.trim(),
        asset_type: assetType,
        description: description.trim(),
        district,
        taluka: taluka.trim(),
        address: address.trim(),
        latitude: latNum,
        longitude: lngNum,
        construction_year: Number(constructionYear),
        estimated_cost: Number(estimatedCost),
        condition,
        status,
        responsible_division: responsibleDivision,
        photo_url: photoUrl.trim() || undefined,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save asset. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8 space-y-6">
      {/* Form Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {isEditing ? 'Edit Asset Profile' : 'Register New Infrastructure Asset'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Enter physical, geographic, and financial parameters for state audit tracking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Asset' : 'Save Asset Record'}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Section 1: Core Asset Information */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <Building className="w-4 h-4 text-blue-600" />
          1. Basic Asset Identification
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Asset Code <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={assetCode}
                onChange={(e) => setAssetCode(e.target.value)}
                placeholder="e.g. RD-AMD-001"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
                required
              />
              <button
                type="button"
                onClick={handleAutoGenerateCode}
                className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 whitespace-nowrap border border-slate-300"
              >
                Auto Code
              </button>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Asset Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sardar Patel Ring Road Extension Package 2"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Asset Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={assetType}
              onChange={(e) => setAssetType(e.target.value as AssetType)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
            >
              <option value="Road">Road</option>
              <option value="Bridge">Bridge</option>
              <option value="Building">Building</option>
              <option value="Culvert">Culvert</option>
              <option value="Flyover">Flyover</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Initial Condition <span className="text-rose-500">*</span>
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as AssetCondition)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
            >
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Operational Status <span className="text-rose-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AssetStatus)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
            >
              <option value="Active">Active</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 2: Location & Division */}
      <div className="pt-4 border-t border-slate-200">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600" />
          2. Geolocation & Responsible Administrative Body
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              District <span className="text-rose-500">*</span>
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
            >
              {DEMO_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Taluka / Sub-Division</label>
            <input
              type="text"
              value={taluka}
              onChange={(e) => setTaluka(e.target.value)}
              placeholder="e.g. Daskroi"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Responsible Division <span className="text-rose-500">*</span>
            </label>
            <select
              value={responsibleDivision}
              onChange={(e) => setResponsibleDivision(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
            >
              {DEMO_DIVISIONS.map((div) => (
                <option key={div} value={div}>
                  {div}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Physical Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. SP Ring Road Junction, Bopal to Science City, Ahmedabad"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Latitude (Decimal Degree)
            </label>
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="e.g. 23.0754"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Longitude (Decimal Degree)
            </label>
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="e.g. 72.5086"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                // Preset sample lat/lng for quick demo testing
                setLatitude('23.0225');
                setLongitude('72.5714');
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300"
            >
              Fill Sample Coordinates (Ahmedabad)
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Financial & Technical Details */}
      <div className="pt-4 border-t border-slate-200">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-purple-600" />
          3. Technical Valuation & Media
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Construction Year</label>
            <input
              type="number"
              value={constructionYear}
              onChange={(e) => setConstructionYear(parseInt(e.target.value) || 2020)}
              min="1900"
              max={new Date().getFullYear() + 1}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Estimated Cost (₹ INR)
            </label>
            <input
              type="number"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(parseFloat(e.target.value) || 0)}
              min="0"
              placeholder="e.g. 45000000"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Asset Image Upload</label>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer border border-slate-300 w-full justify-center">
                <Upload className="w-4 h-4 text-slate-500" />
                {uploadingPhoto ? 'Uploading...' : 'Choose Photo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Or Direct Photo Image URL
            </label>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {photoUrl && (
            <div className="md:col-span-3 mt-1">
              <span className="block text-[11px] font-semibold text-slate-500 mb-1">Image Preview:</span>
              <img
                src={photoUrl}
                alt="Asset preview"
                className="w-48 h-32 object-cover rounded-xl border border-slate-200 shadow-sm"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Technical Description & Structural Specs
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter details regarding engineering specs, lane width, foundation type, or capacity..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
