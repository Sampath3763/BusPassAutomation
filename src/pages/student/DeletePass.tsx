
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBusPass, BusPass } from '@/contexts/BusPassContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, AlertTriangle, Trash2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PassCard from '@/components/PassCard';

const DeletePass = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getPassByStudentId, deletePass, isLoading } = useBusPass();
  
  const [currentPass, setCurrentPass] = useState<BusPass | null>(null);
  const [rollNumber, setRollNumber] = useState('');
  const [routeNumber, setRouteNumber] = useState('');
  const [mobile, setMobile] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeletingPass, setIsDeletingPass] = useState(false);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'student') {
      navigate('/admin');
      return;
    }
    
    const pass = getPassByStudentId(user.id);
    if (!pass) {
      navigate('/student');
      return;
    }
    
    setCurrentPass(pass);
  }, [user, navigate, getPassByStudentId]);
  
  const validateForm = () => {
    if (!currentPass) return false;
    return rollNumber.trim() !== '' && routeNumber.trim() !== '' && mobile.trim() !== '';
  };
  
  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsConfirmOpen(true);
    }
  };
  
  const handleDelete = async () => {
    if (!currentPass) return;
    
    setIsDeletingPass(true);
    
    try {
      const success = await deletePass(currentPass.id, {
        rollNumber,
        routeNumber,
        mobile
      });
      
      if (success) {
        navigate('/student');
      }
    } finally {
      setIsDeletingPass(false);
      setIsConfirmOpen(false);
    }
  };
  
  if (isLoading || !currentPass) {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Delete Bus Pass</h1>
          <p className="text-gray-600">Permanently delete your active bus pass</p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <PassCard pass={currentPass} isDetailed={true} />
          </div>
          
          <Card className="mb-8 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Warning: Deletion is Permanent
              </CardTitle>
              <CardDescription>
                After deletion, you will need to reapply for a new pass. 
                If your route is at capacity, you may be placed on a waiting list.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOpenConfirm} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rollNumber">Confirm College Roll Number *</Label>
                  <Input 
                    id="rollNumber" 
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="routeNumber">Confirm Route Number *</Label>
                  <Input 
                    id="routeNumber" 
                    value={routeNumber}
                    onChange={(e) => setRouteNumber(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mobile">Confirm Mobile Number *</Label>
                  <Input 
                    id="mobile" 
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                  />
                </div>
                
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    variant="destructive"
                    className="w-full"
                    disabled={!validateForm()}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Bus Pass
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your bus pass
                and you will need to reapply if you need a pass in the future.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeletingPass}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                disabled={isDeletingPass}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeletingPass ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : 'Yes, delete pass'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
      
      <Footer />
    </div>
  );
};

export default DeletePass;
