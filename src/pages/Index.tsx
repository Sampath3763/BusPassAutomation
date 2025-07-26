
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Bus, User, ShieldCheck } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero section */}
        <section className="bg-college-secondary py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-college-primary">
              Bus Pass
            </h1>
            <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-gray-700">
              Apply, renew, and manage your college bus passes through our easy-to-use platform.
            </p>
            
            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/login">
                  <Button size="lg" className="bg-college-primary hover:bg-blue-800">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="lg" variant="outline" className="border-college-primary text-college-primary hover:bg-college-primary hover:text-white">
                    Create Account
                  </Button>
                </Link>
              </div>
            )}
            
            {user && (
              <Link to={user.role === 'admin' ? '/admin' : '/student'}>
                <Button size="lg" className="bg-college-primary hover:bg-blue-800">
                  Go to Dashboard
                </Button>
              </Link>
            )}
          </div>
        </section>
        
        {/* Features section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Choose Your Path</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-college-secondary text-college-primary mb-4">
                  <User className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-4">Student Access</h3>
                <p className="text-gray-600 mb-6">
                  Apply for a new bus pass, renew your existing pass, or manage your pass details
                  through your student dashboard.
                </p>
                <Link to="/login?role=student">
                  <Button className="bg-college-primary hover:bg-blue-800">
                    Student Portal
                  </Button>
                </Link>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-college-secondary text-college-primary mb-4">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-4">Administrator Access</h3>
                <p className="text-gray-600 mb-6">
                  Manage bus routes, view student details, download data, and monitor capacities
                  through the admin dashboard.
                </p>
                <Link to="/login?role=admin">
                  <Button className="bg-college-primary hover:bg-blue-800">
                    Admin Portal
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* How it works section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-college-primary text-white mb-4">1</div>
                <h3 className="text-xl font-bold mb-2">Create an Account</h3>
                <p className="text-gray-600">Sign up as a student using your college email address.</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-college-primary text-white mb-4">2</div>
                <h3 className="text-xl font-bold mb-2">Apply for a Pass</h3>
                <p className="text-gray-600">Fill in your details, select a route, and submit payment.</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-college-primary text-white mb-4">3</div>
                <h3 className="text-xl font-bold mb-2">Get Your Digital Pass</h3>
                <p className="text-gray-600">Receive your digital bus pass instantly after approval.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
