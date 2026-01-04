import React, { useState } from 'react';
import { type ClaimData, type ClaimItem } from '@/types/jobs';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Search, BookOpen, Edit2, Check, X, History } from 'lucide-react';

interface JobScopeTabProps {
    data: ClaimData;
    readOnly?: boolean;
    onUpdate?: (items: ClaimItem[]) => void;
}

const UNITS = ['sf', 'lf', 'ea', 'hr', 'day', 'wk', 'mo', 'bag', 'box', 'roll'];

export const JobScopeTab: React.FC<JobScopeTabProps> = ({ data, readOnly, onUpdate }) => {
    const { profile } = useAuth();
    const [lineItemFilter, setLineItemFilter] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<Partial<ClaimItem>>({});
    const [showHistoryId, setShowHistoryId] = useState<string | null>(null);

    const filteredLineItems = data.lineItems.filter(item =>
        item.description.toLowerCase().includes(lineItemFilter.toLowerCase()) ||
        item.category.toLowerCase().includes(lineItemFilter.toLowerCase())
    );

    const totalValue = data.lineItems.reduce((acc, item) => acc + item.total, 0);
    const standards = data?.aiAnalysis?.referencedStandards || [];

    const handleEditStart = (item: ClaimItem) => {
        if (readOnly) return;
        setEditingId(item.id);
        setEditValues({
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            description: item.description,
            category: item.category,
            unit: item.unit
        });
        setShowHistoryId(null);
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditValues({});
    };

    const handleEditSave = async (originalItem: ClaimItem) => {
        if (!onUpdate || !profile) return;

        const changes = [];
        const updates: Partial<ClaimItem> = {};

        if (editValues.quantity !== undefined && editValues.quantity !== originalItem.quantity) {
            changes.push({ field: 'quantity' as const, oldValue: originalItem.quantity, newValue: editValues.quantity });
            updates.quantity = editValues.quantity;
        }
        if (editValues.unitPrice !== undefined && editValues.unitPrice !== originalItem.unitPrice) {
            changes.push({ field: 'unitPrice' as const, oldValue: originalItem.unitPrice, newValue: editValues.unitPrice });
            updates.unitPrice = editValues.unitPrice;
        }
        if (editValues.description !== undefined && editValues.description !== originalItem.description) {
            changes.push({ field: 'description' as const, oldValue: originalItem.description, newValue: editValues.description });
            updates.description = editValues.description;
        }
        if (editValues.category !== undefined && editValues.category !== originalItem.category) {
            changes.push({ field: 'category' as const, oldValue: originalItem.category, newValue: editValues.category });
            updates.category = editValues.category;
        }
        if (editValues.unit !== undefined && editValues.unit !== originalItem.unit) {
            changes.push({ field: 'unit' as const, oldValue: originalItem.unit, newValue: editValues.unit });
            updates.unit = editValues.unit;
        }

        if (changes.length === 0) {
            handleEditCancel();
            return;
        }

        // Calculate new total
        const newQty = updates.quantity ?? originalItem.quantity;
        const newPrice = updates.unitPrice ?? originalItem.unitPrice;
        updates.total = newQty * newPrice;

        const revision = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            editedBy: {
                uid: profile.uid,
                displayName: profile.displayName || 'Unknown User',
                photoURL: profile.photoURL || null
            },
            changes,
            previousState: {
                id: originalItem.id,
                description: originalItem.description,
                quantity: originalItem.quantity,
                unit: originalItem.unit,
                unitPrice: originalItem.unitPrice,
                total: originalItem.total,
                category: originalItem.category,
                notes: originalItem.notes || null, // Ensure not undefined for Firestore
            }
        };

        const updatedItem = {
            ...originalItem,
            ...updates,
            revisions: [revision, ...(originalItem.revisions || [])]
        };

        const newItems = data.lineItems.map(item => item.id === originalItem.id ? updatedItem : item);
        onUpdate(newItems);
        handleEditCancel();
    };

    return (
        <div className="glass rounded-2xl border border-white/5 flex flex-col h-[calc(100vh-300px)] min-h-[500px] animate-in slide-in-from-bottom-4 fade-in duration-500 overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 flex items-center justify-between shrink-0 border-b border-white/5">
                <div className="flex items-center gap-2 text-accent-primary">
                    <FileText size={20} />
                    <h3 className="text-sm font-black uppercase tracking-widest">Scope of Work</h3>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-xs font-mono text-text-muted">
                        Total Est: <span className="text-accent-electric font-bold text-sm ml-1">${totalValue.toFixed(2)}</span>
                    </div>
                    <div className="h-6 w-px bg-white/10 mx-2"></div>
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Filter items..."
                            value={lineItemFilter}
                            onChange={(e) => setLineItemFilter(e.target.value)}
                            className="bg-black/30 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:border-accent-electric outline-none w-64 transition-all focus:w-72"
                        />
                    </div>
                </div>
            </div>

            {/* Main Split View */}
            <div className="flex-1 flex min-h-0">
                {/* Left: Line Items Table */}
                <div className="flex-1 overflow-hidden relative bg-black/20">
                    <div className="absolute inset-0 overflow-auto custom-scrollbar">
                        <table className="w-full text-sm text-left relative">
                            <thead className="sticky top-0 bg-[#151515] z-20 shadow-lg shadow-black/50">
                                <tr className="text-text-muted border-b border-white/10">
                                    <th className="py-3 pl-4 font-bold uppercase text-[10px] tracking-wider w-32">Category</th>
                                    <th className="py-3 font-bold uppercase text-[10px] tracking-wider">Description</th>
                                    <th className="py-3 text-right font-bold uppercase text-[10px] tracking-wider w-20">Qty</th>
                                    <th className="py-3 text-right font-bold uppercase text-[10px] tracking-wider w-16">Unit</th>
                                    <th className="py-3 text-right font-bold uppercase text-[10px] tracking-wider w-24">Price</th>
                                    <th className="py-3 pr-4 text-right font-bold uppercase text-[10px] tracking-wider w-24">Total</th>
                                    {!readOnly && <th className="py-3 w-10"></th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredLineItems.map((item) => {
                                    const isEditing = editingId === item.id;
                                    const hasRevisions = item.revisions && item.revisions.length > 0;

                                    return (
                                        <React.Fragment key={item.id}>
                                            <tr className={`group hover:bg-white/5 transition-colors ${isEditing ? 'bg-white/5' : ''}`}>
                                                {/* Category */}
                                                <td className="py-2 pl-4 text-text-muted text-xs font-mono">
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={editValues.category}
                                                            onChange={e => setEditValues(prev => ({ ...prev, category: e.target.value }))}
                                                            className="w-full bg-black/30 text-white rounded px-2 py-1 outline-none focus:ring-1 focus:ring-accent-electric border border-white/10"
                                                        />
                                                    ) : item.category}
                                                </td>

                                                {/* Description */}
                                                <td className="py-2 font-medium text-white relative">
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={editValues.description}
                                                            onChange={e => setEditValues(prev => ({ ...prev, description: e.target.value }))}
                                                            className="w-full bg-black/30 text-white rounded px-2 py-1 outline-none focus:ring-1 focus:ring-accent-electric border border-white/10"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <span>{item.description}</span>
                                                            {hasRevisions && !isEditing && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setShowHistoryId(showHistoryId === item.id ? null : item.id); }}
                                                                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full border transition-all ${showHistoryId === item.id ? 'bg-accent-electric/10 border-accent-electric text-accent-electric' : 'bg-white/5 border-white/10 text-text-muted hover:border-white/20'}`}
                                                                    title="View Revision History"
                                                                >
                                                                    <History size={10} />
                                                                    <span className="text-[10px] font-mono">{item.revisions?.length}</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Quantity */}
                                                <td className="py-2 text-right font-mono text-text-secondary">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            value={editValues.quantity}
                                                            onChange={e => setEditValues(prev => ({ ...prev, quantity: parseFloat(e.target.value) }))}
                                                            className="w-full text-right bg-black/30 text-white rounded px-2 py-1 outline-none focus:ring-1 focus:ring-accent-electric border border-white/10"
                                                        />
                                                    ) : item.quantity}
                                                </td>

                                                {/* Unit */}
                                                <td className="py-2 text-right text-xs text-text-muted">
                                                    {isEditing ? (
                                                        <select
                                                            value={editValues.unit}
                                                            onChange={e => setEditValues(prev => ({ ...prev, unit: e.target.value }))}
                                                            className="w-full bg-black/30 text-white rounded px-1 py-1 outline-none focus:ring-1 focus:ring-accent-electric border border-white/10 text-xs appearance-none"
                                                        >
                                                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                                        </select>
                                                    ) : item.unit}
                                                </td>

                                                {/* Price */}
                                                <td className="py-2 text-right font-mono text-text-secondary">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            value={editValues.unitPrice}
                                                            onChange={e => setEditValues(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) }))}
                                                            className="w-full text-right bg-black/30 text-white rounded px-2 py-1 outline-none focus:ring-1 focus:ring-accent-electric border border-white/10"
                                                        />
                                                    ) : `$${item.unitPrice.toFixed(2)}`}
                                                </td>

                                                {/* Total */}
                                                <td className="py-2 pr-4 text-right font-mono font-bold text-accent-electric">
                                                    {/* Total is calculated automatically */}
                                                    ${(isEditing ? ((editValues.quantity || 0) * (editValues.unitPrice || 0)) : item.total).toFixed(2)}
                                                </td>

                                                {/* Actions */}
                                                {!readOnly && (
                                                    <td className="py-2 text-center w-10">
                                                        {isEditing ? (
                                                            <div className="flex items-center justify-center gap-1">
                                                                <button onClick={() => handleEditSave(item)} className="p-1 text-green-400 hover:bg-green-400/10 rounded"><Check size={14} /></button>
                                                                <button onClick={handleEditCancel} className="p-1 text-red-400 hover:bg-red-400/10 rounded"><X size={14} /></button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleEditStart(item)}
                                                                className="p-1 text-text-muted hover:text-white transition-colors"
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>

                                            {/* Revision History Dropdown */}
                                            {showHistoryId === item.id && hasRevisions && (
                                                <tr>
                                                    <td colSpan={7} className="bg-[#111] border-b border-white/5 p-0">
                                                        <div className="p-4 pl-12 space-y-3 relative">
                                                            <div className="absolute left-6 top-6 bottom-6 w-px bg-white/10"></div>
                                                            <h4 className="text-xs font-bold uppercase text-text-muted mb-2">Revision History</h4>
                                                            {item.revisions?.map((rev, idx) => (
                                                                <div key={rev.id || idx} className="relative pl-6 text-sm">
                                                                    <div className="absolute left-[-16.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-accent-electric"></div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="font-bold text-white text-xs">{rev.editedBy.displayName}</span>
                                                                        <span className="text-text-muted text-[10px]">{new Date(rev.timestamp).toLocaleString()}</span>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        {rev.changes.map((change, cIdx) => (
                                                                            <div key={cIdx} className="text-xs text-text-secondary font-mono flex items-center gap-2">
                                                                                <span className="px-1.5 py-0.5 rounded bg-white/5 uppercase text-[10px] tracking-wider text-text-muted w-20 text-center">{change.field}</span>
                                                                                <span className="line-through opacity-50">{String(change.oldValue)}</span>
                                                                                <span className="text-accent-electric">→</span>
                                                                                <span className="text-white">{String(change.newValue)}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                                {filteredLineItems.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-10 text-center text-text-muted italic">
                                            No line items found matching "{lineItemFilter}"
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right: Applied Standards Sidebar */}
                <div className="w-80 border-l border-white/5 bg-surface-elevation-1 flex flex-col shrink-0">
                    <div className="p-4 border-b border-white/5 flex items-center gap-2 text-accent-primary bg-[#151515]">
                        <BookOpen size={16} />
                        <h3 className="text-xs font-black uppercase tracking-widest">Applied Standards</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
                        {standards.length > 0 ? (
                            standards.map((std, idx) => (
                                <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/5 group hover:border-accent-electric/30 transition-colors">
                                    <div className="font-bold text-accent-electric text-xs mb-1 font-mono">{std.code}</div>
                                    <div className="text-xs text-text-secondary leading-relaxed">{std.description}</div>
                                </div>
                            ))
                        ) : (
                            <div className="py-10 text-center text-text-muted italic flex flex-col items-center gap-2">
                                <BookOpen size={24} className="opacity-20" />
                                <span className="text-xs">No standards referenced</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
