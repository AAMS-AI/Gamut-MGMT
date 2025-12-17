import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';



export function useFirestoreTeams(user) {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setTeams([]);
            setLoading(false);
            return;
        }

        let q;

        // Filter teams based on user permissions
        // Filter teams based on user permissions
        if (user.role === 'owner' || user.role === 'admin') {
            // Can see all teams in their organization
            q = query(
                collection(db, 'teams'),
                where('organizationId', '==', user.organizationId)
            );
        } else if (user.teamId) {
            // Can only see their own team
            q = query(
                collection(db, 'teams'),
                where('__name__', '==', user.teamId)
            );
        } else {
            setTeams([]);
            setLoading(false);
            return;
        }

        // Real-time listener
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const teamsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setTeams(teamsData);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching teams:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    return { teams, loading };
}



export function useFirestoreUsers(user) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setUsers([]);
            setLoading(false);
            return;
        }

        let q;

        if (user.role === 'owner' || user.role === 'admin') {
            // Org owner/admin sees all users in organization
            q = query(
                collection(db, 'users'),
                where('organizationId', '==', user.organizationId)
            );
        } else if (user.teamId) {
            // Managers and Team Members see their team's users
            q = query(
                collection(db, 'users'),
                where('teamId', '==', user.teamId)
            );
        } else {
            setUsers([]);
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setUsers(usersData);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching users:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    return { users, loading };
}
