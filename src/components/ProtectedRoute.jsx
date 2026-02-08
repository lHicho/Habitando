import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/userContext';

export default function ProtectedRoute({ children, requiresPeriod = false }) {
    const { userInfo, activePeriod } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in
        if (!userInfo || !userInfo.id) {
            navigate('/signin');
            return;
        }
    }, [userInfo, navigate]);

    // Don't render children if user isn't logged in
    if (!userInfo || !userInfo.id) {
        return null;
    }

    // For period-required routes, let the page handle its own "no period" state
    // This prevents redirect loops and allows pages to show custom messages
    return children;
}
