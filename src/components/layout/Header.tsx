
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Bus } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-college-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
        <img src="https://pbs.twimg.com/profile_images/1688442970587201536/dCewVE4I_400x400.jpg" style={{width: '50px', height: '50px'}} alt="" />
          {/*<Bus className="h-6 w-6" />*/}
          <span className="font-bold text-xl">STUDENT BUS PASS</span>
        </Link>
        
        <nav>
          <ul className="flex space-x-6 items-center">
            {user ? (
              <>
                <li>
                  <Link to={user.role === 'admin' ? '/admin' : '/student'}>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Button variant="outline" size="sm" onClick={handleLogout} style={{backgroundColor: 'white', color: 'black'}} className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login">Login</Link>
                </li>
                <li>
                  <Link to="/signup">
                    <Button variant="outline" size="sm" style={{backgroundColor: 'white', color: 'black'}}>Sign Up</Button>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
