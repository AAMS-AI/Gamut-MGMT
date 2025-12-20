import React, { useState } from 'react';

interface Props {
    onNext: () => void;
}

export const TeamInviteStep: React.FC<Props> = ({ onNext }) => {
    // Ideally this would add to a list and send invites via a cloud function
    // For now, it's UI only or we can just skip it.
    const [emails, setEmails] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement invite logic
        onNext();
    };

    return (
        <div className="animate-in fade-in slide-in-from-right duration-500">
            <h2 className="text-3xl font-bold mb-2">Invite Your Team</h2>
            <p className="text-gray-400 mb-8">Get your key staff on board (optional).</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Email Addresses (Comma separated)</label>
                    <textarea
                        value={emails}
                        onChange={(e) => setEmails(e.target.value)}
                        className="w-full bg-[#1A1A1A] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-accent-electric transition-colors h-32"
                        placeholder="john@example.com, jane@example.com"
                    />
                </div>

                <div className="flex space-x-4">
                    <button
                        type="button"
                        onClick={onNext}
                        className="w-full bg-transparent border border-gray-700 hover:bg-gray-800 text-white font-bold py-3 rounded-lg transition-all"
                    >
                        Skip
                    </button>
                    <button
                        type="submit"
                        className="w-full bg-accent-electric hover:bg-accent-electric-hover text-black font-bold py-3 rounded-lg transition-all transform active:scale-95"
                    >
                        Send Invites
                    </button>
                </div>
            </form>
        </div>
    );
};
