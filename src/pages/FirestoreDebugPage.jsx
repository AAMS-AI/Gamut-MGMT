import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function FirestoreDebugPage() {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAllData() {
            const collections = ['users', 'organizations', 'teams'];
            const result = {};

            for (const collectionName of collections) {
                try {
                    const snapshot = await getDocs(collection(db, collectionName));
                    result[collectionName] = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                } catch (error) {
                    result[collectionName] = { error: error.message };
                }
            }

            setData(result);
            setLoading(false);
        }

        fetchAllData();
    }, []);

    if (loading) {
        return <div className="p-8">Loading Firestore data...</div>;
    }

    return (
        <div className="p-8 space-y-6 bg-slate-950 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-100">Firestore Data Viewer</h1>
            <p className="text-gray-400">Direct view of all Firestore collections</p>

            {Object.entries(data).map(([collectionName, docs]) => (
                <div key={collectionName} className="card">
                    <h2 className="text-xl font-semibold text-primary-400 mb-4">
                        {collectionName} ({Array.isArray(docs) ? docs.length : 0} documents)
                    </h2>
                    <pre className="bg-slate-900 p-4 rounded-lg overflow-auto text-sm text-gray-300">
                        {JSON.stringify(docs, null, 2)}
                    </pre>
                </div>
            ))}
        </div>
    );
}
