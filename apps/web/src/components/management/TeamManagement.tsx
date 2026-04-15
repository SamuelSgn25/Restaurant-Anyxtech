import { useState, useMemo } from 'react';
import { 
  Plus, Trash2, Edit2, Search, Shield, User, Mail, 
  Phone, Lock, CheckCircle, X, Eye, EyeOff, AlertCircle,
  Crown, Briefcase, Users, Utensils
} from 'lucide-react';
import { AuthUser, UserRole } from '../../types/management';

interface TeamManagementProps {
  staff: AuthUser[];
  currentUser: AuthUser;
  onCreateStaff: (data: { name: string; email: string; password: string; phone?: string; address?: string; role: UserRole }) => Promise<void>;
  onUpdateStaff: (id: string, data: { name?: string; phone?: string; address?: string; role?: UserRole; active?: boolean }) => Promise<void>;
  onDeleteStaff: (id: string) => Promise<void>;
  onResetPassword: (id: string, newPassword: string) => Promise<void>;
}

const ROLES_INFO: { [key in UserRole]: { label: string; icon: any; color: string; description: string } } = {
  super_admin: { label: 'Super Admin', icon: Crown, color: 'text-forest bg-forest/5', description: 'Contrôle total du système' },
  admin: { label: 'Admin', icon: Shield, color: 'text-forest/80 bg-forest/3', description: 'Gestion du restaurant' },
  server: { label: 'Serveur', icon: Briefcase, color: 'text-clay bg-clay/10', description: 'Service et réservations' },
  chef: { label: 'Chef', icon: Utensils, color: 'text-clay/80 bg-clay/5', description: 'Cuisine et menu' },
  cashier: { label: 'Caissier', icon: User, color: 'text-gold bg-gold/10', description: 'Paiements et facturation' }
};

export function TeamManagement({
  staff,
  currentUser,
  onCreateStaff,
  onUpdateStaff,
  onDeleteStaff,
  onResetPassword
}: TeamManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'server' as UserRole
  });

  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    address: '',
    role: 'server' as UserRole,
    active: true
  });

  const filteredStaff = useMemo(() => {
    return staff.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || member.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [staff, searchTerm, filterRole]);

  const canManageRole = (targetRole: UserRole) => {
    if (currentUser.role === 'super_admin') return true;
    if (currentUser.role === 'admin' && targetRole !== 'super_admin') return true;
    return false;
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) return;
    try {
      await onCreateStaff(formData);
      setFormData({ name: '', email: '', password: '', phone: '', address: '', role: 'server' });
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create staff:', error);
    }
  };

  const handleUpdateStaff = async (memberId: string) => {
    try {
      await onUpdateStaff(memberId, editForm);
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update staff:', error);
    }
  };

  const handleResetPassword = async (memberId: string) => {
    const newPassword = prompt('Nouveau mot de passe pour ce membre:');
    if (!newPassword) return;
    try {
      await onResetPassword(memberId, newPassword);
      alert('Mot de passe réinitialisé avec succès');
    } catch (error) {
      console.error('Failed to reset password:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-display text-forest flex items-center gap-3 mb-2">
            <Users size={32} className="text-gold" />
            Gestion d'Équipe
          </h2>
          <p className="text-forest/40">Créez, modifiez et gérez les comptes de l'équipe</p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-gold to-clay text-forest font-black uppercase tracking-widest shadow-lg shadow-gold/20 hover:scale-105 transition-all"
        >
          <Plus size={18} />
          Ajouter Membre
        </button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="bg-white rounded-[2rem] p-8 border border-forest/5 space-y-6">
          <h3 className="font-display text-xl text-forest mb-6">Créer un nouveau membre</h3>
          
          <form onSubmit={handleCreateStaff} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-forest/40 mb-2 block">Nom</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-forest/10 font-bold text-sm outline-none focus:ring-2 ring-gold"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-forest/40 mb-2 block">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-forest/10 font-bold text-sm outline-none focus:ring-2 ring-gold"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-forest/40 mb-2 block">Mot de passe</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-forest/10 font-bold text-sm outline-none focus:ring-2 ring-gold"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-forest/40 mb-2 block">Rôle</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-4 py-3 rounded-xl border border-forest/10 font-bold text-sm outline-none focus:ring-2 ring-gold"
                >
                  {Object.entries(ROLES_INFO).map(([role, info]) => (
                    <option key={role} value={role}>{info.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-forest/40 mb-2 block">Téléphone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-forest/10 font-bold text-sm outline-none focus:ring-2 ring-gold"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-forest/40 mb-2 block">Adresse</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-forest/10 font-bold text-sm outline-none focus:ring-2 ring-gold"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-clay text-white font-bold uppercase tracking-widest hover:scale-105 transition-all"
              >
                ✓ Créer
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 py-3 rounded-xl border-2 border-forest/20 text-forest font-bold uppercase tracking-widest hover:bg-forest/5 transition-all"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-forest/40" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-forest/10 focus:ring-2 ring-gold transition-all font-bold text-sm outline-none"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value as UserRole | 'all')}
          className="px-6 py-3 rounded-xl bg-white border border-forest/10 font-bold text-sm outline-none focus:ring-2 ring-gold transition-all"
        >
          <option value="all">Tous les rôles</option>
          {Object.entries(ROLES_INFO).map(([role, info]) => (
            <option key={role} value={role}>{info.label}</option>
          ))}
        </select>
      </div>

      {/* Staff Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-[2rem] border border-forest/5">
            <AlertCircle size={40} className="mx-auto text-forest/10 mb-4" />
            <p className="text-forest/40">Aucun membre trouvé</p>
          </div>
        ) : (
          filteredStaff.map(member => {
            const roleInfo = ROLES_INFO[member.role];
            const Icon = roleInfo.icon;
            
            return (
              <div
                key={member.id}
                className="bg-white rounded-[2rem] border border-forest/5 p-6 space-y-4 hover:border-forest/10 transition-all"
              >
                {editingId === member.id ? (
                  // Edit Mode
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdateStaff(member.id);
                    }}
                    className="space-y-3"
                  >
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-forest/10 font-bold text-sm outline-none focus:ring-2 ring-gold"
                    />
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="Téléphone"
                      className="w-full px-3 py-2 rounded-lg border border-forest/10 font-bold text-sm outline-none focus:ring-2 ring-gold"
                    />
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      placeholder="Adresse"
                      className="w-full px-3 py-2 rounded-lg border border-forest/10 font-bold text-sm outline-none focus:ring-2 ring-gold"
                    />
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                      className="w-full px-3 py-2 rounded-lg border border-forest/10 font-bold text-sm outline-none focus:ring-2 ring-gold"
                      disabled={!canManageRole(editForm.role)}
                    >
                      {Object.entries(ROLES_INFO).map(([role, info]) => (
                        <option key={role} value={role}>{info.label}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 py-2 rounded-lg bg-clay text-white font-bold text-xs">✓</button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="flex-1 py-2 rounded-lg border border-forest/10 font-bold text-xs"
                      >
                        ✗
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className={`p-3 rounded-xl ${roleInfo.color}`}>
                        <Icon size={20} />
                      </div>
                      <div className={`px-2 py-1 rounded-full text-[10px] font-bold ${member.active ? 'bg-gold/20 text-gold' : 'bg-forest/10 text-forest/40'}`}>
                        {member.active ? '● Actif' : '● Inactif'}
                      </div>
                    </div>

                    {/* Info */}
                    <div>
                      <h3 className="font-bold text-forest text-sm line-clamp-1">{member.name}</h3>
                      <p className="text-[10px] font-bold text-forest/40 uppercase tracking-widest">{roleInfo.label}</p>
                      <p className="text-xs text-forest/50 mt-1 line-clamp-1">{member.email}</p>
                    </div>

                    {/* Contact */}
                    {(member.phone || member.address) && (
                      <div className="border-t border-forest/5 pt-3 space-y-1 text-[10px] text-forest/60">
                        {member.phone && <p>📱 {member.phone}</p>}
                        {member.address && <p className="line-clamp-1">📍 {member.address}</p>}
                      </div>
                    )}

                    {/* Actions */}
                    {member.id !== currentUser.id && canManageRole(member.role) && (
                      <div className="border-t border-forest/5 pt-3 space-y-2">
                        <button
                          onClick={() => {
                            setEditingId(member.id);
                            setEditForm({
                              name: member.name,
                              phone: member.phone || '',
                              address: member.address || '',
                              role: member.role,
                              active: member.active
                            });
                          }}
                          className="w-full py-2 rounded-lg border border-forest/10 text-forest font-bold text-xs hover:bg-forest/5 transition-all flex items-center justify-center gap-2"
                        >
                          <Edit2 size={12} /> Modifier
                        </button>
                        <button
                          onClick={() => handleResetPassword(member.id)}
                          className="w-full py-2 rounded-lg border border-orange-200 text-orange-600 font-bold text-xs hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
                        >
                          <Lock size={12} /> Réinitialiser Mot de Passe
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Êtes-vous sûr de vouloir supprimer ${member.name} ?`)) {
                              onDeleteStaff(member.id);
                            }
                          }}
                          className="w-full py-2 rounded-lg bg-forest/10 text-forest/50 font-bold text-xs hover:bg-forest/20 transition-all flex items-center justify-center gap-2"
                        >
                          <Trash2 size={12} /> Supprimer
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-gold/10 to-clay/10 rounded-[2rem] p-8 border border-gold/20">
        <h3 className="font-display text-lg text-forest mb-6">👥 Résumé</h3>
        <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <p className="text-[10px] font-bold text-forest/40 uppercase tracking-widest">Total</p>
            <p className="text-3xl font-display text-forest mt-2">{staff.length}</p>
          </div>
          {Object.entries(ROLES_INFO).map(([role, info]) => (
            <div key={role}>
              <p className="text-[10px] font-bold text-forest/40 uppercase tracking-widest">{info.label}</p>
              <p className="text-2xl font-display mt-2 flex items-center gap-2">
                <span className="text-lg">{staff.filter(s => s.role === role).length}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
