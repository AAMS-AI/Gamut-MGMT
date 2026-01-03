import React from 'react';
import {
    X,
    Image as ImageIcon,
    FileText,
    BrainCircuit,
    CheckCircle2,
    User,
    Clock
} from 'lucide-react';

export interface SmartFindingLineItem {
    id: string;
    description: string;
    quantity: number;
    unit: string;
    total: number;
}

export interface SmartFindingPhoto {
    url: string;
    aiAnalysis: string;
    humanNote: string;
    timestamp: string;
}

export interface SmartFinding {
    id: number;
    phase: 'Mitigation' | 'Restoration';
    icon: any;
    color: string;
    bg: string;
    border: string;
    text: string;
    user: string;
    time: string;
    // Enhanced Data
    aiReasoning?: string;
    relatedPhotos?: SmartFindingPhoto[];
    relatedLineItems?: SmartFindingLineItem[];
}

interface FindingDetailModalProps {
    finding: SmartFinding;
    onClose: () => void;
}

export const FindingDetailModal: React.FC<FindingDetailModalProps> = ({ finding, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                {/* HEADER */}
                <div className="p-6 border-b border-white/5 flex items-start justify-between gap-4 shrink-0 bg-[#0a0a0a] z-10">
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl ${finding.bg} border ${finding.border} flex items-center justify-center shrink-0`}>
                            <finding.icon size={24} className={finding.color} />
                        </div>
                        <div>
                            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border uppercase mb-2 ${finding.phase === 'Mitigation' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                'bg-green-500/10 text-green-400 border-green-500/20'
                                }`}>
                                {finding.phase} Finding
                            </div>
                            <h2 className="text-xl font-bold text-white leading-tight">{finding.text}</h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar">

                    {/* MAIN AI REASONING */}
                    {finding.aiReasoning && (
                        <div className="bg-accent-electric/5 border border-accent-electric/10 rounded-xl p-5 flex gap-4">
                            <BrainCircuit size={24} className="text-accent-electric shrink-0 mt-1" />
                            <div>
                                <h4 className="text-xs font-bold text-accent-electric uppercase tracking-widest mb-1">Primary AI Analysis</h4>
                                <p className="text-sm text-white leading-relaxed">{finding.aiReasoning}</p>
                            </div>
                        </div>
                    )}

                    {/* EVIDENCE FEED (Photos + Notes) */}
                    {finding.relatedPhotos && finding.relatedPhotos.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider pb-2 border-b border-white/5">
                                <ImageIcon size={14} />
                                Multi-Modal Evidence Feed
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {finding.relatedPhotos.map((photo, idx) => (
                                    <div key={idx} className="bg-white/2 border border-white/5 rounded-2xl overflow-hidden flex flex-col md:flex-row group hover:border-white/10 transition-colors">
                                        {/* PHOTO COLUMN */}
                                        <div className="w-full md:w-1/2 aspect-video md:aspect-auto relative bg-black/50 border-b md:border-b-0 md:border-r border-white/5">
                                            <img
                                                src={photo.url}
                                                alt="Evidence"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-mono text-white flex items-center gap-1.5 border border-white/10">
                                                <Clock size={10} /> {photo.timestamp}
                                            </div>
                                        </div>

                                        {/* INTELLIGENCE COLUMN */}
                                        <div className="w-full md:w-1/2 p-5 flex flex-col gap-4">
                                            {/* AI VISION NOTE */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-accent-electric uppercase">
                                                    <BrainCircuit size={12} />
                                                    AI Vision Analysis
                                                </div>
                                                <p className="text-sm text-gray-300 bg-accent-electric/5 p-3 rounded-lg border border-accent-electric/10 leading-relaxed">
                                                    {photo.aiAnalysis}
                                                </p>
                                            </div>

                                            {/* HUMAN FIELD NOTE */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase">
                                                    <User size={12} />
                                                    Field Technician Note
                                                </div>
                                                <p className="text-sm text-gray-400 italic pl-3 border-l-2 border-blue-500/30">
                                                    "{photo.humanNote}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* RELATED ESTIMATE ITEMS */}
                    {finding.relatedLineItems && finding.relatedLineItems.length > 0 && (
                        <div className="space-y-3 pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider">
                                    <FileText size={14} />
                                    Scope Generation ({finding.relatedLineItems.length} Items)
                                </div>
                                <div className="text-[10px] text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                    <CheckCircle2 size={10} />
                                    Verified
                                </div>
                            </div>

                            <div className="border border-white/5 rounded-xl overflow-hidden bg-white/2">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-white/5 text-text-muted text-xs uppercase font-medium">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Description</th>
                                            <th className="px-4 py-3 font-medium text-right">Qty</th>
                                            <th className="px-4 py-3 font-medium text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {finding.relatedLineItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3 text-gray-300">{item.description}</td>
                                                <td className="px-4 py-3 text-right text-text-muted font-mono">{item.quantity} {item.unit}</td>
                                                <td className="px-4 py-3 text-right text-emerald-400 font-mono font-medium">${item.total.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>

                {/* FOOTER */}
                <div className="p-4 border-t border-white/5 bg-white/2 flex justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-text-muted hover:text-white hover:bg-white/5 transition-all"
                    >
                        Close
                    </button>
                    <button className="px-4 py-2 rounded-xl bg-accent-electric text-black text-xs font-bold hover:bg-accent-electric/90 transition-all flex items-center gap-2 shadow-lg shadow-accent-electric/20">
                        <CheckCircle2 size={14} />
                        Confirm All Findings
                    </button>
                </div>

            </div>
        </div>
    );
};
