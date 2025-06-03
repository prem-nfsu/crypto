
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { MaxLevelControl } from "./transaction-flow/MaxLevelControl";
import { useLocation } from "react-router-dom";
import { UserCircle, History } from "lucide-react";

export function Header() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  
  // Check if we're on the graph view page
  const isGraphView = location.pathname === "/view/graph";

  return (
    <header className="bg-background/90 backdrop-blur-sm sticky top-0 z-50 w-full border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-bold text-xl">
            Ethereum Explorer
          </Link>
          
          {isGraphView && <MaxLevelControl />}
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="text-sm mr-2">
                {user.email}
              </div>
              <Link to="/profile">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4" />
                  Profile
                </Button>
              </Link>
              <Link to="/history">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  History
                </Button>
              </Link>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/auth/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
