import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {  Users,  LogOut } from "lucide-react";
import { useAuth } from '@/context/AuthContext';

export function Navigation() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="flex items-center justify-between p-4 bg-gradient-card border-b border-border/50">
            <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-mystery-red">Vestigio</h1>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant={location.pathname.startsWith('/lobby') ? "default" : "ghost"}
                    size="sm"
                    asChild
                >
                    <Link to="/lobby">
                        <Users className="h-4 w-4 mr-2" />
                        Lobby
                    </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-mystery-red">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                </Button>
            </div>
        </nav>
    );
}