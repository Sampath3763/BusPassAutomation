import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBusPass, BusPass } from '@/contexts/BusPassContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, RefreshCcw, Trash2, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PassCard from '@/components/PassCard';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getPassByStudentId } = useBusPass();
  const [activePass, setActivePass] = useState<BusPass | null>(null);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'student') {
      navigate('/admin');
      return;
    }
    
    // Load student's active pass
    if (user) {
      const pass = getPassByStudentId(user.id);
      setActivePass(pass);
    }
  }, [user, navigate, getPassByStudentId]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-college-primary" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center gap-4">
          <img 
            src="https://pbs.twimg.com/profile_images/1688442970587201536/dCewVE4I_400x400.jpg" 
            alt="College Logo" 
            className="w-16 h-16 rounded-full"
          />
          <div>
            <h1 className="text-3xl font-bold">Student Dashboard</h1>
            <p className="text-gray-600">Welcome, {user.name || user.email}</p>
          </div>
        </div>
        
        <Tabs defaultValue="pass">
          <TabsList className="mb-8">
            <TabsTrigger value="pass">Your Pass</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pass">
            {activePass ? (
              <div className="max-w-md mx-auto">
                <PassCard pass={activePass} isDetailed={true} />
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Active Bus Pass</CardTitle>
                  <CardDescription>
                    You don't have an active bus pass at the moment.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate('/student/apply')}
                    className="bg-college-primary hover:bg-blue-800"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Apply for a Bus Pass
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="actions">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Apply for Pass</CardTitle>
                  <CardDescription>
                    Apply for a new bus pass
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate('/student/apply')}
                    disabled={!!activePass}
                    className="w-full bg-college-primary hover:bg-blue-800"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Apply Now
                  </Button>
                  {activePass && (
                    <p className="text-sm text-amber-600 mt-2">
                      You already have an active pass
                    </p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Renew Pass</CardTitle>
                  <CardDescription>
                    Renew your existing bus pass
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate('/student/renew')}
                    disabled={!activePass}
                    className="w-full bg-college-primary hover:bg-blue-800"
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Renew Pass
                  </Button>
                  {!activePass && (
                    <p className="text-sm text-amber-600 mt-2">
                      No active pass to renew
                    </p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Delete Pass</CardTitle>
                  <CardDescription>
                    Cancel your current bus pass
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate('/student/delete')}
                    disabled={!activePass}
                    variant="destructive"
                    className="w-full"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Pass
                  </Button>
                  {!activePass && (
                    <p className="text-sm text-amber-600 mt-2">
                      No active pass to delete
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default StudentDashboard;
