import React, { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { teamService } from '@services/api';
import { Users, UserPlus, Shield, Trash2, Mail, Loader2, X, CheckCircle, AlertCircle } from 'lucide-react';

const TeamManagement = () => {
    const { user: currentUser } = useAuth();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteData, setInviteData] = useState({
        full_name: '',
        email: '',
        password: '',
        role: 'staff'
    });
    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        loadTeam();
    }, []);

    const loadTeam = async () => {
        setLoading(true);
        try {
            const { data, error } = await teamService.getTeamMembers();
            if (error) throw error;
            setMembers(data || []);
        } catch (error) {
            console.error('Error loading team:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            const { error } = await teamService.addMember(inviteData);
            if (error) throw error;

            setStatus({ type: 'success', message: 'Member added successfully!' });
            setShowInviteModal(false);
            setInviteData({ full_name: '', email: '', password: '', role: 'staff' });
            loadTeam();

            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } catch (error) {
            setStatus({ type: 'error', message: error.message });
        }
    };

    const handleRoleChange = async (id, newRole) => {
        try {
            const { error } = await teamService.updateMemberRole(id, newRole);
            if (error) throw error;
            loadTeam();
        } catch (error) {
            alert('Error updating role: ' + error.message);
        }
    };

    const handleRemove = async (id) => {
        if (!window.confirm('Are you sure you want to remove this member? They will lose access to the organization.')) return;
        try {
            const { error } = await teamService.removeMember(id);
            if (error) throw error;
            loadTeam();
        } catch (error) {
            alert('Error removing member: ' + error.message);
        }
    };

    const canManageMembers = currentUser?.role === 'owner';

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-emerald-950">Team Management</h1>
                    <p className="text-emerald-600 font-medium">Manage your organization's members and roles</p>
                </div>
                {canManageMembers && (
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="btn-premium flex items-center gap-2"
                    >
                        <UserPlus className="w-5 h-5" />
                        Add Member
                    </button>
                )}
            </div>

            {status.message && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 ${status.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="font-bold">{status.message}</span>
                </div>
            )}

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-emerald-50/50">
                                <th className="px-6 py-4 text-emerald-900 font-black uppercase text-xs tracking-wider">Member</th>
                                <th className="px-6 py-4 text-emerald-900 font-black uppercase text-xs tracking-wider">Role</th>
                                <th className="px-6 py-4 text-emerald-900 font-black uppercase text-xs tracking-wider">Joined</th>
                                {canManageMembers && <th className="px-6 py-4 text-emerald-900 font-black uppercase text-xs tracking-wider">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={canManageMembers ? 4 : 3} className="px-6 py-12 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
                                    </td>
                                </tr>
                            ) : members.length === 0 ? (
                                <tr>
                                    <td colSpan={canManageMembers ? 4 : 3} className="px-6 py-12 text-center text-emerald-900/40 font-medium">
                                        No team members found.
                                    </td>
                                </tr>
                            ) : (
                                members.map((member) => (
                                    <tr key={member.id} className="hover:bg-emerald-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                                                    {member.full_name?.charAt(0) || member.email.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-emerald-950">{member.full_name || 'Anonymous'}</p>
                                                    <p className="text-sm text-emerald-600 flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {member.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {canManageMembers && member.id !== currentUser.id ? (
                                                <select
                                                    value={member.role}
                                                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                                    className="bg-white border border-emerald-100 text-emerald-800 text-xs font-bold rounded-lg px-2 py-1 outline-none ring-2 ring-emerald-50 focus:ring-emerald-200 transition-all"
                                                >
                                                    <option value="owner">Owner</option>
                                                    <option value="manager">Manager</option>
                                                    <option value="staff">Staff</option>
                                                    <option value="viewer">Viewer</option>
                                                </select>
                                            ) : (
                                                <span className={`px-2 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${member.role === 'owner' ? 'bg-purple-100 text-purple-700' :
                                                        member.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-emerald-100 text-emerald-700'
                                                    }`}>
                                                    {member.role}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-emerald-900/70">
                                            {new Date(member.created_at).toLocaleDateString()}
                                        </td>
                                        {canManageMembers && (
                                            <td className="px-6 py-4">
                                                {member.id !== currentUser.id && (
                                                    <button
                                                        onClick={() => handleRemove(member.id)}
                                                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors group"
                                                        title="Remove Member"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-emerald-950">Add Team Member</h2>
                            <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-emerald-50 rounded-xl transition-colors">
                                <X className="w-6 h-6 text-emerald-900/40" />
                            </button>
                        </div>

                        <form onSubmit={handleInvite} className="space-y-4">
                            <div>
                                <label className="label">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="input-primary"
                                    placeholder="John Doe"
                                    value={inviteData.full_name}
                                    onChange={(e) => setInviteData({ ...inviteData, full_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="label">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="input-primary"
                                    placeholder="john@example.com"
                                    value={inviteData.email}
                                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="label">Initial Password</label>
                                <input
                                    type="password"
                                    required
                                    className="input-primary"
                                    placeholder="••••••••"
                                    value={inviteData.password}
                                    onChange={(e) => setInviteData({ ...inviteData, password: e.target.value })}
                                />
                                <p className="text-[10px] text-emerald-600 mt-1">Temporary password for the user to log in</p>
                            </div>
                            <div>
                                <label className="label">Role</label>
                                <select
                                    className="input-primary"
                                    value={inviteData.role}
                                    onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                                >
                                    <option value="manager">Manager</option>
                                    <option value="staff">Staff</option>
                                    <option value="viewer">Viewer</option>
                                </select>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowInviteModal(false)}
                                    className="btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-premium flex-1">
                                    Add Member
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamManagement;
