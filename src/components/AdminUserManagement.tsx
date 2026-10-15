import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserProfile, UserRole } from '../types';
import { Search, UserPlus, Edit2, Key, Check, X, Shield, Users } from 'lucide-react';

export const AdminUserManagement: React.FC = () => {
  const { users, updateUserRoleOrShift } = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isNewUserModal, setIsNewUserModal] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  // New user form state
  const [newNik, setNewNik] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newGender, setNewGender] = useState<'Pria' | 'Wanita'>('Pria');
  const [newShift, setNewShift] = useState<number>(1);
  const [newRole, setNewRole] = useState<UserRole>('AGENT');
  const [newDivision, setNewDivision] = useState<string>('Inbound');
  const [newSupervisor, setNewSupervisor] = useState<string>('Pustaka Adam');

  // Filter users
  const filteredUsers = users.filter((u) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        u.name.toLowerCase().includes(q) ||
        u.nik.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedRole !== 'ALL' && u.role !== selectedRole) return false;
    if (selectedDivision !== 'ALL' && u.division !== selectedDivision) return false;
    return true;
  });

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    await updateUserRoleOrShift(editingUser);
    setFeedbackMsg(`Data untuk ${editingUser.name} berhasil diperbarui.`);
    setEditingUser(null);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleResetPassword = async (user: UserProfile) => {
    const updated = { ...user, password: 'sagi 127' };
    await updateUserRoleOrShift(updated);
    setFeedbackMsg(`Password untuk ${user.name} berhasil direset ke "sagi 127".`);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNik.trim() || !newName.trim()) return;

    const firstWord = newName.trim().split(/\s+/)[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const username = `${firstWord}127`;

    const newUser: UserProfile = {
      id: newNik.trim(),
      nik: newNik.trim(),
      name: newName.trim(),
      username,
      password: 'sagi 127',
      gender: newGender,
      shiftNumber: Number(newShift),
      role: newRole,
      division: newDivision.trim(),
      supervisorName: newSupervisor.trim(),
      status: 'active',
      updatedAt: new Date().toISOString(),
    };

    await updateUserRoleOrShift(newUser);
    setFeedbackMsg(`User baru ${newUser.name} (${newUser.username}) berhasil ditambahkan.`);
    setIsNewUserModal(false);
    // Reset form
    setNewNik('');
    setNewName('');
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-1">
            <span className="font-semibold text-slate-700">Admin Roster Management</span>
            <span aria-hidden="true">·</span>
            <span>Total {users.length} Akun Terdaftar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Kelola User & Konfigurasi Tim SAGI 127
          </h1>
        </div>

        <button
          onClick={() => setIsNewUserModal(true)}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Anggota Tim
        </button>
      </div>

      {feedbackMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Filters and search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari berdasarkan nama, NIK, atau username..."
              className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-all"
            />
          </div>

          <div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="ALL">Semua Peran (Role)</option>
              <option value="ADMIN">Admin</option>
              <option value="SPV">Supervisor (SPV)</option>
              <option value="OIC">Officer In Charge (OIC)</option>
              <option value="AGENT">Agent</option>
            </select>
          </div>

          <div>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="ALL">Semua Divisi</option>
              <option value="Inbound">Inbound</option>
              <option value="Outbound">Outbound</option>
              <option value="Non Voice">Non Voice</option>
              <option value="PPID">PPID</option>
              <option value="QA">QA</option>
              <option value="SME">SME</option>
              <option value="IT">IT</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Manager">Manager</option>
            </select>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">Nama Lengkap</th>
                <th className="py-3 px-4 font-bold">NIK</th>
                <th className="py-3 px-4 font-bold">Username</th>
                <th className="py-3 px-4 font-bold">Role</th>
                <th className="py-3 px-4 font-bold">Divisi</th>
                <th className="py-3 px-4 font-bold">Supervisor / OIC</th>
                <th className="py-3 px-4 text-right font-bold">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-sans font-bold text-slate-900">
                    {u.name}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{u.nik}</td>
                  <td className="py-3 px-4 text-emerald-700 font-semibold">{u.username}</td>
                  <td className="py-3 px-4 font-sans">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      u.role === 'ADMIN'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : u.role === 'SPV'
                        ? 'bg-sky-50 text-sky-700 border border-sky-200'
                        : u.role === 'OIC'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-600">{u.division}</td>
                  <td className="py-3 px-4 font-sans text-slate-500">{u.supervisorName}</td>
                  <td className="py-3 px-4 text-right font-sans">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setEditingUser(u)}
                        title="Edit User"
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleResetPassword(u)}
                        title="Reset Password ke sagi 127"
                        className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-amber-200"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Edit Profil: {editingUser.name}</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Peran Akun (Role)</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  <option value="AGENT">Agent</option>
                  <option value="SPV">Supervisor (SPV)</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Shift Kerja</label>
                <input
                  type="number"
                  min="1"
                  max="16"
                  value={editingUser.shiftNumber}
                  onChange={(e) => setEditingUser({ ...editingUser, shiftNumber: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Divisi / Posisi</label>
                <input
                  type="text"
                  value={editingUser.division}
                  onChange={(e) => setEditingUser({ ...editingUser, division: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Supervisor</label>
                <input
                  type="text"
                  value={editingUser.supervisorName}
                  onChange={(e) => setEditingUser({ ...editingUser, supervisorName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingUser(null)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-md"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New User Modal */}
      {isNewUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateUser}
            className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Tambah Anggota Tim Baru</h3>
              <button
                type="button"
                onClick={() => setIsNewUserModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">NIK Karyawan *</label>
                <input
                  type="text"
                  required
                  value={newNik}
                  onChange={(e) => setNewNik(e.target.value)}
                  placeholder="202601200"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nama Lengkap"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Jenis Kelamin</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as 'Pria' | 'Wanita')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Pria">Pria</option>
                    <option value="Wanita">Wanita</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Shift</label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={newShift}
                    onChange={(e) => setNewShift(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Peran (Role)</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="AGENT">Agent</option>
                    <option value="SPV">Supervisor (SPV)</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Divisi</label>
                  <input
                    type="text"
                    value={newDivision}
                    onChange={(e) => setNewDivision(e.target.value)}
                    placeholder="Inbound / Outbound"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Supervisor</label>
                <input
                  type="text"
                  value={newSupervisor}
                  onChange={(e) => setNewSupervisor(e.target.value)}
                  placeholder="Pustaka Adam"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNewUserModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-md"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
              >
                Tambahkan User
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
