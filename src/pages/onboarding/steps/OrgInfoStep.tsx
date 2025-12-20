import React, { useState } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Props {
    onNext: () => void;
}

export const OrgInfoStep: React.FC<Props> = ({ onNext }) => {
    const { organization: org } = useOrganization();
    const [orgName, setOrgName] = useState(org?.name || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!org?.id) return;

        setLoading(true);
        try {
            const orgRef = doc(db, 'organizations', org.id);
            await updateDoc(orgRef, {
                name: orgName,
                updatedAt: new Date()
            });
            onNext();
        } catch (error) {
            console.error("Error updating org:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-right duration-500">
            <h2 className="text-3xl font-bold mb-2">Welcome to Gamut</h2>
            <p className="text-gray-400 mb-8">Let's set up your organization profile.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Organization Name</label>
                    <input
                        type="text"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        className="w-full bg-[#1A1A1A] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-accent-electric transition-colors"
                        placeholder="e.g. Acme Solar"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-accent-electric hover:bg-accent-electric-hover text-black font-bold py-3 rounded-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Saving...' : 'Continue'}
                </button>
            </form>
        </div>
    );
};
