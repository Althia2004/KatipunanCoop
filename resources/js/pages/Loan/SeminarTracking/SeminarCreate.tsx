import { Head, useForm } from '@inertiajs/react';

export default function SeminarCreate() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        location: '',
        scheduled_at: '',
        capacity: 0,
        speaker_name: '', // New field
        description: '',  // New field
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/loan/seminar-tracking'); 
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <Head title="Create Seminar" />
            
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#2d4734]">New Seminar</h1>
                <p className="text-zinc-500 font-medium">Schedule a new seminar session for the cooperative.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
                
                {/* Title */}
                <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-1">Seminar Title</label>
                    <input 
                        type="text" 
                        value={data.title}
                        placeholder="e.g. Cooperative Principles & Practices"
                        onChange={e => setData('title', e.target.value)}
                        className={`w-full text-zinc-900 bg-zinc-50 rounded-xl border-zinc-300 p-3 focus:ring-[#4c9f5f] focus:border-[#4c9f5f] transition-all ${
                            errors.title ? 'border-red-500 ring-1 ring-red-500' : ''
                        }`}
                    />
                    {errors.title && <p className="text-red-500 text-xs mt-1 font-medium">{errors.title}</p>}
                </div>

                {/* Speaker Name (The New Simple Text Input) */}
                <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-1">Speaker / Facilitator</label>
                    <input 
                        type="text" 
                        value={data.speaker_name}
                        placeholder="Full name of the speaker"
                        onChange={e => setData('speaker_name', e.target.value)}
                        className="w-full text-zinc-900 bg-zinc-50 rounded-xl border-zinc-300 p-3 focus:ring-[#4c9f5f] focus:border-[#4c9f5f] transition-all"
                    />
                    {errors.speaker_name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.speaker_name}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-1">Location</label>
                        <input 
                            type="text" 
                            value={data.location}
                            placeholder="Main Office or Zoom"
                            onChange={e => setData('location', e.target.value)}
                            className="w-full text-zinc-900 bg-zinc-50 rounded-xl border-zinc-300 p-3 focus:ring-[#4c9f5f] focus:border-[#4c9f5f] transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-1">Max Capacity</label>
                        <input 
                            type="number" 
                            value={data.capacity}
                            onChange={e => setData('capacity', parseInt(e.target.value))}
                            className="w-full text-zinc-900 bg-zinc-50 rounded-xl border-zinc-300 p-3 focus:ring-[#4c9f5f] focus:border-[#4c9f5f] transition-all"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-1">Scheduled Date & Time</label>
                    <input 
                        type="datetime-local" 
                        value={data.scheduled_at}
                        onChange={e => setData('scheduled_at', e.target.value)}
                        className="w-full text-zinc-900 bg-zinc-50 rounded-xl border-zinc-300 p-3 focus:ring-[#4c9f5f] focus:border-[#4c9f5f] transition-all"
                    />
                </div>

                {/* Description Textarea */}
                <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-1">Description</label>
                    <textarea 
                        value={data.description}
                        placeholder="Brief overview of the seminar topics..."
                        onChange={e => setData('description', e.target.value)}
                        rows={3}
                        className="w-full text-zinc-900 bg-zinc-50 rounded-xl border-zinc-300 p-3 focus:ring-[#4c9f5f] focus:border-[#4c9f5f] transition-all"
                    />
                </div>

                <div className="flex items-center justify-end gap-4 pt-4">
                    <button 
                        type="button"
                        onClick={() => window.history.back()}
                        className="px-6 py-3 text-zinc-600 font-bold hover:bg-zinc-100 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        disabled={processing}
                        className="px-8 py-3 bg-[#2d4734] text-white rounded-xl font-bold hover:bg-[#1e3023] disabled:opacity-50 shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
                    >
                        {processing ? 'Creating...' : 'Create Seminar'}
                    </button>
                </div>
            </form>
        </div>
    );
}