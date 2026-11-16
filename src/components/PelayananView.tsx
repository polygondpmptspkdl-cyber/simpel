import { Plus, Search, Users } from 'lucide-react';
import { useState } from 'react';
import { TODAY_ISO } from '../data/initialData';
import { InstansiItem, PelayananHarian } from '../types/mpp';

interface PelayananViewProps {
  instansi: InstansiItem[];
  pelayanan: PelayananHarian[];
  onSavePelayanan: (
    payload: Omit<PelayananHarian, 'id' | 'diperbaruiPada'>,
    existingId?: string
  ) => void;
}

export function PelayananView({
  instansi,
  pelayanan,
  onSavePelayanan,
}: PelayananViewProps) {
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(TODAY_ISO);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [instansiId, setInstansiId] = useState(instansi[0]?.id || '');
  const [loket, setLoket] = useState(instansi[0]?.loket[0] || '');
  const [jenisLayanan, setJenisLayanan] = useState(instansi[0]?.contohLayanan || '');
  const [jumlahPemohon, setJumlahPemohon] = useState(25);
  const [pelayananSelesai, setPelayananSelesai] = useState(22);
  const [pelayananProses, setPelayananProses] = useState(2);
  const [pelayananTertunda, setPelayananTertunda] = useState(1);
  const [nomorAntreanTerakhir, setNomorAntreanTerakhir] = useState('A-025');
  const [rataRataWaktuTungguMenit, setRataRataWaktuTungguMenit] = useState(15);

  const openNewForm = () => {
    const first = instansi[0];
    setEditingId(undefined);
    setInstansiId(first?.id || '');
    setLoket(first?.loket[0] || '');
    setJenisLayanan(first?.contohLayanan || '');
    setJumlahPemohon(20);
    setPelayananSelesai(18);
    setPelayananProses(2);
    setPelayananTertunda(0);
    setNomorAntreanTerakhir('A-020');
    setRataRataWaktuTungguMenit(15);
    setShowForm(true);
  };

  const openEditForm = (item: PelayananHarian) => {
    setEditingId(item.id);
    setInstansiId(item.instansiId);
    setLoket(item.loket);
    setJenisLayanan(item.jenisLayanan);
    setJumlahPemohon(item.jumlahPemohon);
    setPelayananSelesai(item.pelayananSelesai);
    setPelayananProses(item.pelayananProses);
    setPelayananTertunda(item.pelayananTertunda);
    setNomorAntreanTerakhir(item.nomorAntreanTerakhir);
    setRataRataWaktuTungguMenit(item.rataRataWaktuTungguMenit);
    setShowForm(true);
  };

  const handleInstansiChange = (newId: string) => {
    setInstansiId(newId);
    const found = instansi.find((i) => i.id === newId);
    if (found) {
      setLoket(found.loket[0] || '');
      setJenisLayanan(found.contohLayanan);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePelayanan(
      {
        tanggal: selectedDate,
        instansiId,
        loket,
        jenisLayanan,
        jumlahPemohon: Number(jumlahPemohon),
        pelayananSelesai: Number(pelayananSelesai),
        pelayananProses: Number(pelayananProses),
        pelayananTertunda: Number(pelayananTertunda),
        nomorAntreanTerakhir,
        rataRataWaktuTungguMenit: Number(rataRataWaktuTungguMenit),
      },
      editingId
    );
    setShowForm(false);
  };

  const filtered = pelayanan.filter((p) => {
    if (selectedDate && p.tanggal !== selectedDate) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const inst = instansi.find((i) => i.id === p.instansiId);
    return (
      (inst?.nama.toLowerCase().includes(q) ?? false) ||
      (inst?.singkatan.toLowerCase().includes(q) ?? false) ||
      p.loket.toLowerCase().includes(q) ||
      p.jenisLayanan.toLowerCase().includes(q)
    );
  });

  const totals = filtered.reduce(
    (acc, cur) => ({
      pemohon: acc.pemohon + cur.jumlahPemohon,
      selesai: acc.selesai + cur.pelayananSelesai,
      proses: acc.proses + cur.pelayananProses,
      tertunda: acc.tertunda + cur.pelayananTertunda,
    }),
    { pemohon: 0, selesai: 0, proses: 0, tertunda: 0 }
  );

  const selectedInstObj = instansi.find((i) => i.id === instansiId);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari instansi, loket, atau layanan..."
              className="pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg w-64 focus:outline-none focus:border-blue-600"
            />
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-blue-600"
          />
        </div>

        <button
          type="button"
          onClick={openNewForm}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Aktivitas Pelayanan</span>
        </button>
      </div>

      {/* Ringkasan Cepat */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Total Pemohon</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {totals.pemohon}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Pelayanan Selesai</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
            {totals.selesai}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Dalam Proses</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-blue-700 mt-1">
            {totals.proses}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500">Tertunda</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-700 mt-1">
            {totals.tertunda}
          </div>
        </div>
      </div>

      {/* Form Input Modal / Panel */}
      {showForm && (
        <div className="bg-white border border-blue-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">
              {editingId ? 'Perbarui Data Pelayanan & Antrean' : 'Input Aktivitas Pelayanan Harian'}
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Tutup
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Instansi Pelayanan
              </label>
              <select
                value={instansiId}
                onChange={(e) => handleInstansiChange(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
              >
                {instansi.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.singkatan} — {i.kelompokLayanan}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Loket Pelayanan
              </label>
              <select
                value={loket}
                onChange={(e) => setLoket(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
              >
                {(selectedInstObj?.loket || [loket]).map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Jenis Layanan
              </label>
              <input
                type="text"
                required
                value={jenisLayanan}
                onChange={(e) => setJenisLayanan(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Jumlah Pemohon
              </label>
              <input
                type="number"
                min={0}
                required
                value={jumlahPemohon}
                onChange={(e) => setJumlahPemohon(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Pelayanan Selesai
              </label>
              <input
                type="number"
                min={0}
                required
                value={pelayananSelesai}
                onChange={(e) => setPelayananSelesai(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Dalam Proses / Tertunda
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={0}
                  value={pelayananProses}
                  onChange={(e) => setPelayananProses(Number(e.target.value))}
                  placeholder="Proses"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono"
                />
                <input
                  type="number"
                  min={0}
                  value={pelayananTertunda}
                  onChange={(e) => setPelayananTertunda(Number(e.target.value))}
                  placeholder="Tertunda"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nomor Antrean Terakhir
              </label>
              <input
                type="text"
                value={nomorAntreanTerakhir}
                onChange={(e) => setNomorAntreanTerakhir(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Rata-rata Waktu Tunggu (Menit)
              </label>
              <input
                type="number"
                min={1}
                value={rataRataWaktuTungguMenit}
                onChange={(e) => setRataRataWaktuTungguMenit(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
              >
                Simpan Data Pelayanan
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Data Pelayanan & Antrean */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Rekapitulasi Pelayanan & Monitoring Antrean Loket
            </h3>
            <p className="text-xs text-slate-500">
              Klik "Perbarui" pada baris mana saja untuk memperbarui jumlah pemohon dan antrean secara langsung
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {filtered.length} loket tercatat
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-sm font-medium text-slate-700">
              Belum ada data pelayanan pada tanggal {selectedDate}
            </div>
            <button
              type="button"
              onClick={openNewForm}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
            >
              Catat Pelayanan Pertama
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                  <th className="py-3 px-4">Instansi & Loket</th>
                  <th className="py-3 px-4">Jenis Layanan</th>
                  <th className="py-3 px-3 text-right">Pemohon</th>
                  <th className="py-3 px-3 text-right">Selesai</th>
                  <th className="py-3 px-3 text-right">Proses</th>
                  <th className="py-3 px-3 text-right">Tertunda</th>
                  <th className="py-3 px-3 text-center">Antrean Akhir</th>
                  <th className="py-3 px-3 text-right">Waktu Tunggu</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map((item) => {
                  const inst = instansi.find((i) => i.id === item.instansiId);
                  const overStandard =
                    inst && item.rataRataWaktuTungguMenit > inst.standarWaktuMenit;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {inst?.singkatan || item.instansiId}
                        </div>
                        <div className="text-[11px] text-slate-500">{item.loket}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-xs truncate">
                        {item.jenisLayanan}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                        {item.jumlahPemohon}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-700 font-semibold">
                        {item.pelayananSelesai}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-blue-700">
                        {item.pelayananProses}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-amber-700">
                        {item.pelayananTertunda}
                      </td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums text-slate-800 font-medium">
                        {item.nomorAntreanTerakhir}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums">
                        <span
                          className={
                            overStandard ? 'text-rose-700 font-semibold' : 'text-slate-700'
                          }
                        >
                          {item.rataRataWaktuTungguMenit} mnt
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => openEditForm(item)}
                          className="text-xs font-medium text-blue-700 hover:text-blue-800 cursor-pointer whitespace-nowrap"
                        >
                          Perbarui
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
