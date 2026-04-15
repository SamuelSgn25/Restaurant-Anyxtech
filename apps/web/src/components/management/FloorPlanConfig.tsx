import { useState } from 'react';
import { Plus, Trash2, Edit2, ChevronDown, LayoutGrid, Users, Check, Loader } from 'lucide-react';
import { api } from '../../lib/api';

interface Zone {
  id: string;
  name: string;
  description: string;
  tableCount: number;
  defaultSeats: number;
  color: string;
}

const DEFAULT_ZONES: Zone[] = [
  { id: 'main-hall', name: 'Salle Principale', description: 'Zone de service principale', tableCount: 12, defaultSeats: 4, color: 'bg-emerald-500' },
  { id: 'terrace', name: 'Terrasse', description: 'Zone extérieure', tableCount: 8, defaultSeats: 4, color: 'bg-sky-500' },
  { id: 'vip', name: 'VIP', description: 'Espace privé', tableCount: 4, defaultSeats: 6, color: 'bg-gold' }
];

export function FloorPlanConfig({ onSave, token }: { onSave?: () => void; token?: string }) {
  const [zones, setZones] = useState<Zone[]>(DEFAULT_ZONES);
  const [expandedZone, setExpandedZone] = useState<string | null>('main-hall');
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const addZone = () => {
    const newZone: Zone = {
      id: `zone-${Date.now()}`,
      name: 'Nouvelle Zone',
      description: 'Description de la zone',
      tableCount: 6,
      defaultSeats: 4,
      color: 'bg-purple-500'
    };
    setZones([...zones, newZone]);
    setExpandedZone(newZone.id);
  };

  const deleteZone = (id: string) => {
    setZones(zones.filter(z => z.id !== id));
    if (expandedZone === id) setExpandedZone(null);
  };

  const updateZone = (id: string, updates: Partial<Zone>) => {
    setZones(zones.map(z => z.id === id ? { ...z, ...updates } : z));
  };

  const handleSaveConfiguration = async () => {
    if (!token) return;
    setIsSaving(true);
    try {
      // Generate and create tables for each zone
      for (const zone of zones) {
        for (let i = 0; i < zone.tableCount; i++) {
          // Generate random positions within the zone area
          const posX = Math.random() * 70 + 10; // Between 10-80%
          const posY = Math.random() * 70 + 10;
          const tableLabel = `${zone.name.substring(0, 1)}${i + 1}`;
          
          await api.createTable({
            label: tableLabel,
            zone: zone.name,
            seats: zone.defaultSeats,
            shape: 'round' as const,
            posX,
            posY,
            width: 6,
            height: 6,
            status: 'available' as const
          }, token);
        }
      }
      onSave?.();
    } catch (error) {
      console.error('Failed to save configuration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-display text-forest flex items-center gap-3 mb-2">
            <LayoutGrid size={32} className="text-gold" />
            Configuration du Plan de Salle
          </h2>
          <p className="text-forest/40">Organisez vos zones et tables pour votre établissement</p>
        </div>
        <button
          onClick={addZone}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-gold to-clay text-forest font-black uppercase tracking-widest shadow-lg shadow-gold/20 hover:scale-105 transition-all"
        >
          <Plus size={18} />
          Nouvelle Zone
        </button>
      </div>

      {/* Zones List */}
      <div className="grid gap-4">
        {zones.map(zone => (
          <div key={zone.id} className="bg-white rounded-[2rem] border border-forest/5 overflow-hidden shadow-sm">
            
            {/* Zone Header */}
            <button
              onClick={() => setExpandedZone(expandedZone === zone.id ? null : zone.id)}
              className="w-full px-8 py-6 flex items-center justify-between hover:bg-forest/2transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`${zone.color} w-8 h-8 rounded-lg`} />
                <div className="text-left">
                  <h3 className="font-display text-lg text-forest">{zone.name}</h3>
                  <p className="text-sm text-forest/40">{zone.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-2xl font-display text-clay">{zone.tableCount}</p>
                  <p className="text-[10px] font-bold text-forest/30 uppercase">Tables</p>
                </div>
                <ChevronDown 
                  size={20} 
                  className={`text-forest/40 transition-transform ${expandedZone === zone.id ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            {/* Zone Details */}
            {expandedZone === zone.id && (
              <div className="border-t border-forest/5 px-8 py-6 space-y-6 bg-sand/10">
                
                {/* Edit Mode */}
                {editingZone === zone.id ? (
                  <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setEditingZone(null); }}>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-forest/40">Nom de la Zone</label>
                        <input
                          type="text"
                          value={zone.name}
                          onChange={(e) => updateZone(zone.id, { name: e.target.value })}
                          className="w-full bg-white border border-forest/5 rounded-xl p-3 font-bold text-sm outline-none focus:ring-2 ring-gold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-forest/40">Nombre de Tables</label>
                        <input
                          type="number"
                          value={zone.tableCount}
                          onChange={(e) => updateZone(zone.id, { tableCount: Math.max(1, parseInt(e.target.value) || 1) })}
                          min="1"
                          max="50"
                          className="w-full bg-white border border-forest/5 rounded-xl p-3 font-bold text-sm outline-none focus:ring-2 ring-gold"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-forest/40">Description</label>
                      <textarea
                        value={zone.description}
                        onChange={(e) => updateZone(zone.id, { description: e.target.value })}
                        rows={3}
                        className="w-full bg-white border border-forest/5 rounded-xl p-3 font-medium text-sm outline-none focus:ring-2 ring-gold resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-forest/40">Couverts par Défaut</label>
                      <select
                        value={zone.defaultSeats}
                        onChange={(e) => updateZone(zone.id, { defaultSeats: parseInt(e.target.value) })}
                        className="w-full bg-white border border-forest/5 rounded-xl p-3 font-bold text-sm outline-none focus:ring-2 ring-gold"
                      >
                        {[2, 4, 6, 8, 10, 12].map(n => <option key={n} value={n}>{n} couverts</option>)}
                      </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 text-white font-bold uppercase tracking-widest hover:scale-105 transition-all"
                      >
                        <Check size={16} />
                        Terminer
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingZone(null)}
                        className="flex-1 py-3 rounded-xl border-2 border-forest/20 text-forest font-bold uppercase tracking-widest hover:bg-forest/5 transition-all"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-white rounded-xl border border-forest/5">
                        <p className="text-[10px] font-bold text-forest/40 uppercase tracking-widest mb-2">Nombre de Tables</p>
                        <p className="text-3xl font-display text-clay">{zone.tableCount}</p>
                      </div>
                      <div className="p-4 bg-white rounded-xl border border-forest/5">
                        <p className="text-[10px] font-bold text-forest/40 uppercase tracking-widest mb-2">Couverts par Défaut</p>
                        <div className="flex items-center gap-2">
                          <Users size={20} className="text-formula" />
                          <p className="text-3xl font-display text-forest">{zone.defaultSeats}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-forest/5">
                      <p className="text-[10px] font-bold text-forest/40 uppercase tracking-widest mb-2">Description</p>
                      <p className="text-sm text-forest">{zone.description}</p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setEditingZone(zone.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-forest text-white font-bold uppercase tracking-widest hover:scale-105 transition-all"
                      >
                        <Edit2 size={16} />
                        Modifier
                      </button>
                      <button
                        onClick={() => deleteZone(zone.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-500/10 text-rose-600 font-bold uppercase tracking-widest hover:bg-rose-500/20 transition-all"
                      >
                        <Trash2 size={16} />
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-gold/10 to-clay/10 rounded-[2rem] p-8 border border-gold/20">
        <h3 className="font-display text-lg text-forest mb-4">📊 Résumé</h3>
        <div className="grid sm:grid-cols-3 gap-6">
          <div>
            <p className="text-[10px] font-bold text-forest/40 uppercase tracking-widest">Zones Configurées</p>
            <p className="text-4xl font-display text-forest mt-2">{zones.length}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-forest/40 uppercase tracking-widest">Nombre Total de Tables</p>
            <p className="text-4xl font-display text-clay mt-2">{zones.reduce((acc, z) => acc + z.tableCount, 0)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-forest/40 uppercase tracking-widest">Capacité Totale</p>
            <p className="text-4xl font-display text-forest mt-2">{zones.reduce((acc, z) => acc + (z.tableCount * z.defaultSeats), 0)}</p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-4">
        <button 
          onClick={handleSaveConfiguration}
          disabled={isSaving}
          className="flex-1 py-4 rounded-full bg-gradient-to-r from-forest to-forest/90 text-white font-black uppercase tracking-widest shadow-lg shadow-forest/20 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader size={18} className="animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <Check size={18} />
              Enregistrer & Générer Tables
            </>
          )}
        </button>
      </div>
    </div>
  );
}
