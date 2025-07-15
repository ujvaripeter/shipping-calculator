'use client';
import { useState } from 'react';

interface ShippingForm {
  destination: string;
  floors: number;
  extreme: boolean;
  transfer: boolean;
  removeOld: boolean;
  service: 'basic' | 'furniture' | 'furniture_assembly';
}

interface ShippingResult {
  km: number;
  breakdown: {
    shipCost: number;
    floorCost: number;
    extremeCost: number;
    transferCost: number;
    oldCost: number;
    total: number;
  };
}

export default function Home() {
  const [form, setForm] = useState<ShippingForm>({
    destination: '',
    floors: 0,
    extreme: false,
    transfer: false,
    removeOld: false,
    service: 'basic',
  });
  const [result, setResult] = useState<ShippingResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, type, value, checked } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/calculate-shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setResult(json);
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Ismeretlen hiba történt.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-bold mb-6">Szállítási díj kalkulátor</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          name="destination"
          value={form.destination}
          onChange={handleChange}
          placeholder="Célállomás"
          className="w-full rounded border p-2"
          required
        />

        <input
          type="number"
          name="floors"
          value={form.floors}
          onChange={handleChange}
          placeholder="Emeletek száma"
          className="w-full rounded border p-2"
          min={0}
        />

        <select
          name="service"
          value={form.service}
          onChange={handleChange}
          className="w-full rounded border p-2"
        >
          <option value="basic">Matrac / ágyrács</option>
          <option value="furniture">Matrac + ágyrács + bútor (szállítás)</option>
          <option value="furniture_assembly">Matrac + ágyrács + bútor (szállítás + szerelés)</option>
        </select>

        <label className="flex items-center gap-2">
          <input type="checkbox" name="extreme" checked={form.extreme} onChange={handleChange} />
          Extrém eset
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" name="transfer" checked={form.transfer} onChange={handleChange} />
          Átszállítás másik címre
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" name="removeOld" checked={form.removeOld} onChange={handleChange} />
          Régi matrac elszállítása
        </label>

        <button
          className="w-full rounded bg-black py-2 text-white disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Számol...' : 'Számítás'}
        </button>
      </form>

      {result && (
        <div className="mt-6 space-y-1 border-t pt-4 text-sm">
          <p><strong>Távolság:</strong> {result.km} km</p>
          <p>Szállítási díj: {result.breakdown.shipCost.toLocaleString()} Ft</p>
          <p>Emelet díj: {result.breakdown.floorCost.toLocaleString()} Ft</p>
          <p>Extrém felár: {result.breakdown.extremeCost.toLocaleString()} Ft</p>
          <p>Átszállítás: {result.breakdown.transferCost.toLocaleString()} Ft</p>
          <p>Régi matrac elszállítás: {result.breakdown.oldCost.toLocaleString()} Ft</p>
          <hr />
          <p className="font-bold">Összesen: {result.breakdown.total.toLocaleString()} Ft</p>
        </div>
      )}
    </main>
  );
}