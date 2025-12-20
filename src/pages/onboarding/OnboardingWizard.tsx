import React, { useState } from 'react';
import { OnboardingLayout } from './OnboardingLayout';
import { OrgInfoStep } from './steps/OrgInfoStep';
import { FirstOfficeStep } from './steps/FirstOfficeStep';
import { TeamInviteStep } from './steps/TeamInviteStep';
import { CompletionStep } from './steps/CompletionStep';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

type Step = 'ORG_INFO' | 'FIRST_OFFICE' | 'TEAM_INVITE' | 'COMPLETION';

export const OnboardingWizard: React.FC = () => {
    const [currentStep, setCurrentStep] = useState<Step>('ORG_INFO');
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleComplete = async () => {
        if (!user) return;
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                onboardingCompleted: true,
                updatedAt: new Date()
            });
            // Force reload or state update might be needed, but for now navigate to root
            // The AuthContext listener should pick up the change, or we might need to manually refresh the profile in context
            // But usually onSnapshot handles it.
            navigate('/');
        } catch (error) {
            console.error("Error completing onboarding:", error);
        }
    };

    const nextStep = (step: Step) => setCurrentStep(step);

    const renderStep = () => {
        switch (currentStep) {
            case 'ORG_INFO':
                return <OrgInfoStep onNext={() => nextStep('FIRST_OFFICE')} />;
            case 'FIRST_OFFICE':
                return <FirstOfficeStep onNext={() => nextStep('TEAM_INVITE')} />;
            case 'TEAM_INVITE':
                return <TeamInviteStep onNext={() => nextStep('COMPLETION')} />;
            case 'COMPLETION':
                return <CompletionStep onFinish={handleComplete} />;
            default:
                return null;
        }
    };

    return (
        <OnboardingLayout>
            <div className="space-y-6">
                {/* Progress Indicators could go here */}
                {renderStep()}
            </div>
        </OnboardingLayout>
    );
};
