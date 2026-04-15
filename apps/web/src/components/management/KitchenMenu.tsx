import { useState, useMemo } from 'react';
import { 
  Plus, Trash2, Edit2, Search, Check, X, Clock, AlertCircle,
  UtensilsCrossed, ChefHat, Flame, Package, Eye, EyeOff
} from 'lucide-react';
import { Order, MenuItem, MenuCategory } from '../../types/management';

interface KitchenMenuProps {
  kitchenTickets: Order[];
  menu: MenuCategory[];
  onUpdateOrderStatus: (id: string, status: string) => void;
  onCreateMenuItem: (data: { category: string; name: string; description: string; price: number; available: boolean; tags: string[] }) => void;
  onUpdateMenuItemAvailability: (id: string, available: boolean) => void;
  onDeleteMenuItem: (id: string) => void;
}

const ORDER_STATUSES = [
  { status: 'draft', label: '📝 Brouillon', color: 'bg-forest/5 text-forest/50' },
  { status: 'sent_to_kitchen', label: '👨‍🍳 Envoyée', color: 'bg-forest/10 text-forest/60' },
  { status: 'in_preparation', label: '🍳 En Préparation', color: 'bg-clay/10 text-clay/80' },
  { status: 'ready', label: '✓ Prête', color: 'bg-gold/10 text-gold' },
  { status: 'served', label: '🍽️ Servée', color: 'bg-forest/5 text-forest/40' },
  { status: 'closed', label: '✓ Fermée', color: 'bg-forest/3 text-forest/30' }
];

export function KitchenMenu({
  kitchenTickets,
  menu,
  onUpdateOrderStatus,
  onCreateMenuItem,
  onUpdateMenuItemAvailability,
  onDeleteMenuItem
}: KitchenMenuProps) {
  const [activeTab, setActiveTab] = useState<'kitchen' | 'menu'>('kitchen');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | 'all'>('all');
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);

  const [menuForm, setMenuForm] = useState({
    category: 'Plats',
    name: '',
    description: '',
    price: 0,
    available: true,
    tags: ''
  });

  const pendingTickets = useMemo(() => {
    const filtered = kitchenTickets.filter(order => {
      const matchesSearch = order.tableId?.includes(searchTerm) || '';
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      return !searchTerm || (matchesSearch && matchesStatus);
    });
    return filtered.sort((a, b) => {
      const statusOrder = ['draft', 'sent_to_kitchen', 'in_preparation', 'ready', 'served', 'closed'];
      return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
    });
  }, [kitchenTickets, searchTerm, filterStatus]);

  const allItems = useMemo(() => {
    return menu.flatMap(cat => cat.items.map(item => ({ ...item, categoryName: cat.category })));
  }, [menu]);

  const filteredItems = useMemo(() => {
    return allItems.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allItems, searchTerm]);

  const getStatusInfo = (status: string) => {
    return ORDER_STATUSES.find(s => s.status === status) || ORDER_STATUSES[0];
  };

  const getNextStatus = (current: string) => {
    const workflow: { [key: string]: string } = {
      'draft': 'sent_to_kitchen',
      'sent_to_kitchen': 'in_preparation',
      'in_preparation': 'ready',
      'ready': 'served',
      'served': 'closed',
      'closed': 'closed'
    };
    return workflow[current] || current;
  };

  const formatElapsedTime = (startIso: string) => {
    const start = new Date(startIso).getTime();
    const now = new Date().getTime();
    const diff = Math.floor((now - start) / (1000 * 60));
    if (diff < 1) return '< 1 min';
    return `${diff} min`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-display text-forest flex items-center gap-3 mb-2">
            <ChefHat size={32} className="text-gold" />
            Cuisine & Menu
          </h2>
          <p className="text-forest/40">Gérez les tickets cuisine et la carte</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-forest/5">
          <button
            onClick={() => setActiveTab('kitchen')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === 'kitchen'
                ? 'bg-forest text-white shadow-lg'
                : 'text-forest/40 hover:text-forest'
            }`}
          >
            👨‍🍳 Cuisine ({pendingTickets.length})
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === 'menu'
                ? 'bg-forest text-white shadow-lg'
                : 'text-forest/40 hover:text-forest'
            }`}
          >
            📋 Menu ({allItems.length})
          </button>
        </div>
      </div>

      {/* Kitchen Tab */}
      {activeTab === 'kitchen' && (
        <div className="space-y-6">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-forest/40" />
              <input
                type="text"
                placeholder="Rechercher par table..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-forest/10 focus:ring-2 ring-gold transition-all font-bold text-sm outline-none"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-6 py-3 rounded-xl bg-white border border-forest/10 font-bold text-sm outline-none focus:ring-2 ring-gold transition-all"
            >
              <option value="all">Tous les statuts</option>
              {ORDER_STATUSES.map(s => (
                <option key={s.status} value={s.status}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Tickets Grid */}
          {pendingTickets.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-[2rem] border border-forest/5">
              <AlertCircle size={40} className="mx-auto text-forest/10 mb-4" />
              <p className="text-forest/40">Aucun ticket en cuisine</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingTickets.map(ticket => {
                const statusInfo = getStatusInfo(ticket.status);
                return (
                  <div key={ticket.id} className="bg-white rounded-[2rem] border-2 border-forest/5 p-6 space-y-4 hover:border-forest/10 transition-all">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-display text-2xl text-forest">Table {ticket.tableId}</h3>
                        <p className="text-xs font-bold text-forest/40 uppercase tracking-widest">Ticket #{ticket.id.substring(0, 6)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-forest/40">⏱️</p>
                        <p className="text-sm font-bold text-clay">{formatElapsedTime(ticket.createdAt || new Date().toISOString())}</p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className={`px-4 py-3 rounded-lg text-sm font-bold text-center ${statusInfo.color}`}>
                      {statusInfo.label}
                    </div>

                    {/* Items */}
                    <div className="bg-forest/5 rounded-lg p-4 space-y-2 max-h-[200px] overflow-y-auto">
                      <p className="text-[10px] font-bold text-forest/40 uppercase tracking-widest mb-3">Articles</p>
                      {ticket.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start gap-2 p-2 bg-white rounded-lg text-sm">
                          <div className="flex-1">
                            <p className="font-bold text-forest">{item.name}</p>
                            <p className="text-xs text-forest/60">×{item.quantity}</p>
                          </div>
                          <div className="text-right font-bold text-forest/70">
                            {(item.unitPrice * item.quantity).toLocaleString('fr-FR')} FCFA
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Notes */}
                    {ticket.notes && (
                      <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-[10px] font-bold text-orange-700 uppercase mb-1">📝 Notes</p>
                        <p className="text-xs text-orange-700">{ticket.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    {ticket.status !== 'closed' && (
                      <button
                        onClick={() => onUpdateOrderStatus(ticket.id, getNextStatus(ticket.status))}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-gold to-clay text-forest font-bold uppercase tracking-widest text-xs shadow-lg shadow-gold/20 hover:scale-105 transition-all"
                      >
                        {ticket.status === 'draft' && '→ Envoyer à la Cuisine'}
                        {ticket.status === 'sent_to_kitchen' && '→ Commencer Préparation'}
                        {ticket.status === 'in_preparation' && '→ Marquer Prête'}
                        {ticket.status === 'ready' && '→ Servie'}
                        {ticket.status === 'served' && '→ Fermer Ticket'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Menu Tab */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          {/* Create Button */}
          <div className="flex justify-between items-center">
            <div className="relative w-96">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-forest/40" />
              <input
                type="text"
                placeholder="Rechercher article..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-forest/10 focus:ring-2 ring-gold transition-all font-bold text-sm outline-none"
              />
            </div>
            <button
              onClick={() => setIsCreatingItem(!isCreatingItem)}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-gold to-clay text-forest font-black uppercase tracking-widest shadow-lg shadow-gold/20 hover:scale-105 transition-all"
            >
              <Plus size={18} />
              Ajouter Article
            </button>
          </div>

          {/* Create Form */}
          {isCreatingItem && (
            <div className="bg-white rounded-[2rem] p-8 border border-forest/5 space-y-4">
              <h3 className="font-display text-lg text-forest mb-4">Créer un nouvel article</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onCreateMenuItem({
                    ...menuForm,
                    tags: menuForm.tags.split(',').map(t => t.trim()).filter(Boolean)
                  });
                  setMenuForm({ category: 'Plats', name: '', description: '', price: 0, available: true, tags: '' });
                  setIsCreatingItem(false);
                }}
                className="space-y-4"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-forest/40 mb-2 block">Catégorie</label>
                    <select
                      value={menuForm.category}
                      onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-forest/10 font-bold text-sm outline-none focus:ring-2 ring-gold"
                    >
                      {menu.map(cat => (
                        <option key={cat.category} value={cat.category}>{cat.category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-forest/40 mb-2 block">Prix (FCFA)</label>
                    <input
                      type="number"
                      value={menuForm.price}
                      onChange={(e) => setMenuForm({ ...menuForm, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 rounded-xl border border-forest/10 font-bold text-sm outline-none focus:ring-2 ring-gold"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-forest/40 mb-2 block">Nom</label>
                  <input
                    type="text"
                    value={menuForm.name}
                    onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-forest/10 font-bold text-sm outline-none focus:ring-2 ring-gold"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-forest/40 mb-2 block">Description</label>
                  <textarea
                    value={menuForm.description}
                    onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-forest/10 font-bold text-sm outline-none focus:ring-2 ring-gold resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-forest/40 mb-2 block">Tags (séparés par des virgules)</label>
                  <input
                    type="text"
                    value={menuForm.tags}
                    onChange={(e) => setMenuForm({ ...menuForm, tags: e.target.value })}
                    placeholder="végétarien, épicé, sans gluten"
                    className="w-full px-4 py-3 rounded-xl border border-forest/10 font-bold text-sm outline-none focus:ring-2 ring-gold"
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold uppercase tracking-widest hover:scale-105 transition-all">✓ Créer</button>
                  <button type="button" onClick={() => setIsCreatingItem(false)} className="flex-1 py-3 rounded-xl border-2 border-forest/20 font-bold uppercase tracking-widest hover:bg-forest/5">Annuler</button>
                </div>
              </form>
            </div>
          )}

          {/* Items Grid */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-[2rem] border border-forest/5">
              <Package size={40} className="mx-auto text-forest/10 mb-4" />
              <p className="text-forest/40">Aucun article</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <div key={item.id} className="bg-white rounded-[2rem] border border-forest/5 p-6 space-y-3 hover:border-forest/10 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-forest text-sm">{item.name}</h3>
                      <p className="text-[10px] font-bold text-forest/40 uppercase tracking-widest">{item.categoryName}</p>
                    </div>
                    <button
                      onClick={() => onUpdateMenuItemAvailability(item.id, !item.available)}
                      className={`p-2 rounded-lg transition-all ${item.available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}
                    >
                      {item.available ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>

                  <p className="text-xs text-forest/70 line-clamp-2">{item.description}</p>

                  <div className="flex items-end justify-between gap-2">
                    <p className="text-2xl font-display text-clay">{item.price.toLocaleString('fr-FR')}</p>
                    <p className="text-[10px] font-bold text-forest/40">FCFA</p>
                  </div>

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 rounded text-[8px] font-bold bg-gold/10 text-gold">#{tag}</span>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (confirm('Supprimer cet article ?')) {
                        onDeleteMenuItem(item.id);
                      }
                    }}
                    className="w-full py-2 rounded-lg bg-rose-500/10 text-rose-600 font-bold text-xs hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 size={12} /> Supprimer
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
