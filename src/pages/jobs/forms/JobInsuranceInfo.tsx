import React from 'react';
import { Building, FileText } from 'lucide-react';

interface JobInsuranceInfoProps {
    lossDate: string;
    setLossDate: (val: string) => void;
    lossCategory: string;
    setLossCategory: (val: string) => void;
    carrier: string;
    setCarrier: (val: string) => void;
    claimNumber: string;
    setClaimNumber: (val: string) => void;
    lossDescription: string;
    setLossDescription: (val: string) => void;
    adjusterName: string;
    setAdjusterName: (val: string) => void;
    adjusterEmail: string;
    setAdjusterEmail: (val: string) => void;
}

export const JobInsuranceInfo: React.FC<JobInsuranceInfoProps> = ({
    lossDate, setLossDate,
    lossCategory, setLossCategory,
    carrier, setCarrier,
    claimNumber, setClaimNumber,
    lossDescription, setLossDescription,
    adjusterName, setAdjusterName,
    adjusterEmail, setAdjusterEmail
}) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-status-mitigation mb-4">
                <Building size={18} />
                <h3 className="text-sm font-black uppercase tracking-widest">Loss & Insurance</h3>
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-muted uppercase">Date of Loss</label>
                <input
                    type="date"
                    value={lossDate}
                    onChange={(e) => setLossDate(e.target.value)}
                    className="input-field"
                />
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-muted uppercase">Loss Type</label>
                <select
                    value={lossCategory}
                    onChange={(e) => setLossCategory(e.target.value)}
                    className="input-field appearance-none"
                >
                    <option value="" className="bg-bg-tertiary">Select Category...</option>
                    <option value="Water" className="bg-bg-tertiary">Water</option>
                    <option value="Fire" className="bg-bg-tertiary">Fire</option>
                    <option value="Mold" className="bg-bg-tertiary">Mold</option>
                    <option value="Storm" className="bg-bg-tertiary">Storm</option>
                    <option value="Biohazard" className="bg-bg-tertiary">Biohazard</option>
                </select>
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-muted uppercase">Insurance Carrier</label>
                <input
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="input-field"
                    placeholder="e.g. State Farm"
                />
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-muted uppercase">Claim Number</label>
                <input
                    value={claimNumber}
                    onChange={(e) => setClaimNumber(e.target.value)}
                    className="input-field"
                />
            </div>

            <div className="space-y-2 bg-white/5 p-4 rounded-xl border border-white/5">
                <label className="text-[10px] font-bold text-text-muted uppercase">Insurance Adjuster</label>
                <div className="flex flex-col gap-2">
                    <input
                        value={adjusterName}
                        onChange={(e) => setAdjusterName(e.target.value)}
                        className="input-field"
                        placeholder="Name (e.g. John Doe)"
                    />
                    <input
                        type="email"
                        value={adjusterEmail}
                        onChange={(e) => setAdjusterEmail(e.target.value)}
                        className="input-field"
                        placeholder="Email (e.g. john@insurance.com)"
                    />
                </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-accent-secondary mb-2">
                    <FileText size={18} />
                    <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">General Description of Loss</h3>
                </div>
                <textarea
                    value={lossDescription}
                    onChange={(e) => setLossDescription(e.target.value)}
                    className="input-field min-h-[150px] resize-y"
                    placeholder="Enter the FNOL description here..."
                />
            </div>
        </div>
    );
};
