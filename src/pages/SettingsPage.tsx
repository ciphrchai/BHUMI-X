import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  MapPin,
  Bell,
  Ruler,
  Save,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import PageHeader from '../components/layout/PageHeader';

export function SettingsPage() {
  const navigate = useNavigate();

  const savedSettings = JSON.parse(
    localStorage.getItem('bhumiX_settings') || '{}'
  );

  const [name, setName] = useState(
    savedSettings.name || 'Chaitanya Thakur'
  );

  const [designation, setDesignation] = useState(
    savedSettings.designation || 'Land Intelligence Analyst'
  );

  const [region, setRegion] = useState(
    savedSettings.region || 'Yelahanka'
  );

  const [units, setUnits] = useState(
    savedSettings.units || 'km'
  );

  const [notifications, setNotifications] = useState(
    savedSettings.notifications ?? true
  );

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const settings = {
      name,
      designation,
      region,
      units,
      notifications,
    };

    localStorage.setItem(
      'bhumiX_settings',
      JSON.stringify(settings)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const handleReset = () => {
    setName('Chaitanya Thakur');
    setDesignation('Land Intelligence Analyst');
    setRegion('Yelahanka');
    setUnits('km');
    setNotifications(true);

    localStorage.removeItem('bhumiX_settings');
  };

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
          title="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <PageHeader
          title="Settings"
          description="Manage your BHUMI-X profile and application preferences."
        />

      </div>

      {/* Success Message */}
      {saved && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Settings saved successfully.
        </div>
      )}

      {/* Profile Settings */}
      <Card className="p-6">

        <div className="flex items-center gap-3 mb-6">

          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Profile
            </h2>

            <p className="text-sm text-gray-500">
              Update your BHUMI-X profile information.
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-3 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Designation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Designation
            </label>

            <input
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full h-11 px-3 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

        </div>

      </Card>

      {/* Planning Preferences */}
      <Card className="p-6">

        <div className="flex items-center gap-3 mb-6">

          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Planning Preferences
            </h2>

            <p className="text-sm text-gray-500">
              Configure your default planning environment.
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Region */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Study Region
            </label>

            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full h-11 px-3 border border-gray-300 rounded-md text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Yelahanka">Yelahanka</option>
              <option value="Bangalore North">Bangalore North</option>
              <option value="Bangalore East">Bangalore East</option>
              <option value="Bangalore South">Bangalore South</option>
              <option value="Bangalore West">Bangalore West</option>
            </select>
          </div>

          {/* Units */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Distance Units
            </label>

            <div className="relative">

              <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

              <select
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="w-full h-11 pl-10 pr-3 border border-gray-300 rounded-md text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="km">Kilometres (km)</option>
                <option value="m">Metres (m)</option>
                <option value="miles">Miles (mi)</option>
              </select>

            </div>
          </div>

        </div>

      </Card>

      {/* Notifications */}
      <Card className="p-6">

        <div className="flex items-center gap-3 mb-6">

          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Notifications
            </h2>

            <p className="text-sm text-gray-500">
              Manage application notifications.
            </p>
          </div>

        </div>

        <div className="flex items-center justify-between">

          <div>
            <p className="font-medium text-gray-900">
              Analysis & Report Notifications
            </p>

            <p className="text-sm text-gray-500 mt-1">
              Receive notifications when analysis or reports are ready.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setNotifications(!notifications)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              notifications
                ? 'bg-blue-600'
                : 'bg-gray-300'
            }`}
            aria-label="Toggle notifications"
          >

            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                notifications
                  ? 'translate-x-7'
                  : 'translate-x-1'
              }`}
            />

          </button>

        </div>

      </Card>

      {/* Account Information */}
      <Card className="p-6">

        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Account Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Role
            </p>

            <p className="mt-1 font-medium text-gray-900">
              Planning Analyst
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Joined
            </p>

            <p className="mt-1 font-medium text-gray-900">
              2026
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Access Level
            </p>

            <p className="mt-1 font-medium text-green-600">
              Standard
            </p>
          </div>

        </div>

      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pb-6">

        <Button
          type="button"
          variant="secondary"
          onClick={handleReset}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>

        <Button
          type="button"
          variant="primary"
          onClick={handleSave}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>

      </div>

    </div>
  );
}