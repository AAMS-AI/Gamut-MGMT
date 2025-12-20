import React, { useState } from 'react';
import { CheckSquare, Square, Calendar } from 'lucide-react';
import { type Task } from '@/types/jobs';

interface TasksWidgetProps {
    tasks: Task[];
}

export const TasksWidget: React.FC<TasksWidgetProps> = ({ tasks }) => {
    // Simple improved local toggle state mock
    // In real app, this would trigger a prop function or API call
    const [localTasks, setLocalTasks] = useState(tasks);

    const toggleTask = (id: string) => {
        setLocalTasks(prev => prev.map(t =>
            t.id === id ? { ...t, completed: !t.completed } : t
        ));
    };

    const pendingCount = localTasks.filter(t => !t.completed).length;

    return (
        <div className="glass p-6 h-full flex flex-col w-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CheckSquare size={20} className="text-status-reconstruction" />
                    My Tasks
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-white/5 text-xs text-text-muted border border-white/5">
                    {pendingCount} Pending
                </span>
            </div>

            {localTasks.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-text-muted text-sm italic">
                    All caught up! No pending tasks.
                </div>
            ) : (
                <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
                    {localTasks.map(task => (
                        <div
                            key={task.id}
                            className={`
                                flex items-start gap-3 p-3 rounded-xl border transition-all duration-300 group cursor-pointer
                                ${task.completed
                                    ? 'bg-transparent border-transparent opacity-50'
                                    : 'bg-white/5 border-white/5 hover:border-accent-electric/30 hover:bg-white/10'
                                }
                            `}
                            onClick={() => toggleTask(task.id)}
                        >
                            <div className={`mt-0.5 ${task.completed ? 'text-status-success' : 'text-text-muted group-hover:text-accent-electric'}`}>
                                {task.completed ? <CheckSquare size={18} /> : <Square size={18} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className={`text-sm font-medium transition-all ${task.completed ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                                    {task.title}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-text-muted">
                                    <Calendar size={10} />
                                    <span>Today</span> {/* Mocked due date logic for now */}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
