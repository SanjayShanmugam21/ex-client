import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, roles }) => {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!auth.loading) {
            if (!auth.isAuthenticated) {
                navigate("/login");
            } else if (roles && !roles.includes(auth.user?.role)) {
                // If role is not allowed, redirect to generic dashboard or unauthorized
                if (auth.user?.role === 'ADMIN') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/dashboard');
                }
            } else {
                setIsAuthorized(true);
            }
        }
    }, [auth, navigate, roles]);

    if (auth.loading) return <div className="flex justify-center items-center h-screen"><div className="loading-spinner"></div></div>;

    return isAuthorized ? children : null;
};

export default ProtectedRoute;
