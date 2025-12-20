import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface Props {
    onFinish: () => void;
}

export const CompletionStep: React.FC<Props> = ({ onFinish }) => {
    return (
        <div className="animate-in fade-in slide-in-from-right duration-500 text-center">
            <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-accent-electric/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-accent-electric" />
                </div>
            </div>

            <h2 className="text-3xl font-bold mb-4">You're All Set!</h2>
            <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                Your organization has been configured. You can now access your dashboard and start managing your operations.
            </p>

            <button
                onClick={onFinish}
                className="w-full bg-accent-electric hover:bg-accent-electric-hover text-black font-bold py-3 rounded-lg transition-all transform active:scale-95"
            >
                Go to Dashboard
            </button>
        </div>
    );
};
