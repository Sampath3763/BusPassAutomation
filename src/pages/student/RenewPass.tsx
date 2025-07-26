import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBusPass, BusPass, BusRoute } from '@/contexts/BusPassContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CreditCard, CheckCircle2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PassCard from '@/components/PassCard';
import PaymentForm from '@/components/payment/PaymentForm';

const RenewPass = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getPassByStudentId, renewPass, routes, isLoading } = useBusPass();
  
  const [currentPass, setCurrentPass] = useState<BusPass | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  // Form fields for editing
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fathersName, setFathersName] = useState('');
  const [branch, setBranch] = useState('');
  const [studyYear, setStudyYear] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [studentMobile, setStudentMobile] = useState('');
  const [parentMobile, setParentMobile] = useState('');
  const [residentialAddress, setResidentialAddress] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  
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
    
    // Pre-fill form fields
    setFirstName(pass.firstName);
    setMiddleName(pass.middleName || '');
    setLastName(pass.lastName);
    setFathersName(pass.fathersName);
    setBranch(pass.branch);
    setStudyYear(pass.studyYear);
    setBloodGroup(pass.bloodGroup);
    setSelectedRouteId(pass.routeId);
    setStudentMobile(pass.studentMobile);
    setParentMobile(pass.parentMobile);
    setResidentialAddress(pass.residentialAddress);
    setPermanentAddress(pass.permanentAddress);
    
  }, [user, navigate, getPassByStudentId]);
  
  const handleProceedToPayment = () => {
    setShowPaymentForm(true);
  };
  
  const handleCancelPayment = () => {
    setShowPaymentForm(false);
  };
  
  const handlePaymentComplete = async () => {
    if (!currentPass) return;
    
    try {
      // Get updated route info if changed
      let routeNumber = currentPass.routeNumber;
      let routeName = currentPass.routeName;
      let amount = currentPass.amount;
      
      if (isEditMode && selectedRouteId !== currentPass.routeId) {
        const newRoute = routes.find(r => r.id === selectedRouteId);
        if (newRoute) {
          routeNumber = newRoute.number;
          routeName = newRoute.name;
          amount = newRoute.amount;
        }
      }
      
      const success = await renewPass(currentPass.id, isEditMode ? {
        firstName,
        middleName: middleName || undefined,
        lastName,
        fathersName,
        branch,
        studyYear,
        bloodGroup,
        routeId: selectedRouteId,
        routeNumber,
        routeName,
        amount,
        studentMobile,
        parentMobile,
        residentialAddress,
        permanentAddress,
      } : undefined);
      
      if (success) {
        navigate('/student');
      }
    } finally {
      setIsProcessingPayment(false);
      setShowPaymentForm(false);
    }
  };
  
  const handleRenewWithoutChangesBtn = (e: React.FormEvent) => {
    e.preventDefault();
    handleProceedToPayment();
  };
  
  const handleRenewWithChangesBtn = (e: React.FormEvent) => {
    e.preventDefault();
    handleProceedToPayment();
  };
  
  const handleCopyAddress = () => {
    setPermanentAddress(residentialAddress);
  };
  
  const getPaymentAmount = () => {
    if (!currentPass) return 0;
    
    if (isEditMode && selectedRouteId !== currentPass.routeId) {
      const newRoute = routes.find(r => r.id === selectedRouteId);
      return newRoute ? newRoute.amount : currentPass.amount;
    }
    
    return currentPass.amount;
  };
  
  if (isLoading || !currentPass) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-college-primary" />
      </div>
    );
  }
  
  if (showPaymentForm) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Complete Payment</h1>
            <p className="text-gray-600">Pay to renew your bus pass</p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <PaymentForm 
              amount={getPaymentAmount()}
              onPaymentComplete={handlePaymentComplete}
              onPaymentCancel={handleCancelPayment}
              isProcessing={isProcessingPayment}
              setIsProcessing={setIsProcessingPayment}
            />
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Renew Bus Pass</h1>
          <p className="text-gray-600">Renew your bus pass for the next academic year</p>
        </div>
        
        <Tabs defaultValue="current-pass" className="max-w-3xl mx-auto">
          <TabsList className="mb-6">
            <TabsTrigger value="current-pass">Current Pass</TabsTrigger>
            <TabsTrigger value="renewal-options">Renewal Options</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current-pass">
            <div className="max-w-md mx-auto">
              <PassCard pass={currentPass} isDetailed={true} />
            </div>
          </TabsContent>
          
          <TabsContent value="renewal-options">
            <Card>
              <CardHeader>
                <CardTitle>Choose Renewal Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <Button 
                    onClick={() => setIsEditMode(false)}
                    variant={isEditMode ? "outline" : "default"}
                    className={`flex-1 ${!isEditMode ? 'bg-college-primary hover:bg-blue-800' : ''}`}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Renew with Same Details
                  </Button>
                  
                  <Button 
                    onClick={() => setIsEditMode(true)}
                    variant={isEditMode ? "default" : "outline"}
                    className={`flex-1 ${isEditMode ? 'bg-college-primary hover:bg-blue-800' : ''}`}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Update Details & Renew
                  </Button>
                </div>
                
                {!isEditMode ? (
                  <div className="mt-8">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="mb-4">
                          You are about to renew your bus pass with the same details for the next academic year.
                          The payment amount will be ₹{currentPass.amount}.
                        </p>
                        <Button 
                          onClick={handleRenewWithoutChangesBtn}
                          className="w-full bg-college-accent hover:bg-amber-600"
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          Proceed to Payment (₹{currentPass.amount})
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <form onSubmit={handleRenewWithChangesBtn} className="mt-8 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input 
                              id="firstName" 
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="middleName">Middle Name</Label>
                            <Input 
                              id="middleName" 
                              value={middleName}
                              onChange={(e) => setMiddleName(e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input 
                              id="lastName" 
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="fathersName">Father's Name *</Label>
                          <Input 
                            id="fathersName" 
                            value={fathersName}
                            onChange={(e) => setFathersName(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="branch">Branch *</Label>
                            <Select value={branch} onValueChange={setBranch} required>
                              <SelectTrigger>
                                <SelectValue placeholder="Select branch" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Computer Science">Computer Science</SelectItem>
                                <SelectItem value="Information Technology">Information Technology</SelectItem>
                                <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                                <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                                <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                                <SelectItem value="Electronics">Electronics</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="studyYear">Study Year *</Label>
                            <Select value={studyYear} onValueChange={setStudyYear} required>
                              <SelectTrigger>
                                <SelectValue placeholder="Select year" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="First Year">First Year</SelectItem>
                                <SelectItem value="Second Year">Second Year</SelectItem>
                                <SelectItem value="Third Year">Third Year</SelectItem>
                                <SelectItem value="Fourth Year">Fourth Year</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="bloodGroup">Blood Group *</Label>
                            <Select value={bloodGroup} onValueChange={setBloodGroup} required>
                              <SelectTrigger>
                                <SelectValue placeholder="Select blood group" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="A+">A+</SelectItem>
                                <SelectItem value="A-">A-</SelectItem>
                                <SelectItem value="B+">B+</SelectItem>
                                <SelectItem value="B-">B-</SelectItem>
                                <SelectItem value="AB+">AB+</SelectItem>
                                <SelectItem value="AB-">AB-</SelectItem>
                                <SelectItem value="O+">O+</SelectItem>
                                <SelectItem value="O-">O-</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="studentMobile">Student Mobile Number *</Label>
                            <Input 
                              id="studentMobile" 
                              value={studentMobile}
                              onChange={(e) => setStudentMobile(e.target.value)}
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="parentMobile">Parent Mobile Number *</Label>
                            <Input 
                              id="parentMobile" 
                              value={parentMobile}
                              onChange={(e) => setParentMobile(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="residentialAddress">Residential Address *</Label>
                          <Textarea 
                            id="residentialAddress" 
                            value={residentialAddress}
                            onChange={(e) => setResidentialAddress(e.target.value)}
                            rows={3}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor="permanentAddress">Permanent Address *</Label>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              onClick={handleCopyAddress}
                            >
                              Same as residential
                            </Button>
                          </div>
                          <Textarea 
                            id="permanentAddress" 
                            value={permanentAddress}
                            onChange={(e) => setPermanentAddress(e.target.value)}
                            rows={3}
                            required
                          />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Bus Route Selection</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="route">Select Route *</Label>
                          <Select value={selectedRouteId} onValueChange={setSelectedRouteId} required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a bus route" />
                            </SelectTrigger>
                            <SelectContent>
                              {routes.map((route) => (
                                <SelectItem key={route.id} value={route.id}>
                                  {route.number} - {route.name} (₹{route.amount})
                                  {route.currentCount >= route.capacity && route.id !== currentPass.routeId && " - FULL"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          {selectedRouteId && selectedRouteId !== currentPass.routeId && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-md">
                              {(() => {
                                const selectedRoute = routes.find(r => r.id === selectedRouteId);
                                if (!selectedRoute) return null;
                                
                                return (
                                  <>
                                    <div className="flex justify-between mb-2">
                                      <span className="font-medium">New Route:</span>
                                      <span>{selectedRoute.number} - {selectedRoute.name}</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                      <span className="font-medium">Amount:</span>
                                      <span>₹{selectedRoute.amount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="font-medium">Availability:</span>
                                      <span className={
                                        selectedRoute.currentCount >= selectedRoute.capacity ? 
                                        'text-red-500' : 'text-green-500'
                                      }>
                                        {selectedRoute.capacity - selectedRoute.currentCount} seats available
                                      </span>
                                    </div>
                                    
                                    {selectedRoute.currentCount >= selectedRoute.capacity && (
                                      <p className="mt-2 text-sm text-amber-600">
                                        This route is currently full. Your application will be added to the waiting list.
                                      </p>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                        
                        <div className="pt-4">
                          <Button 
                            type="submit" 
                            className="w-full bg-college-accent hover:bg-amber-600"
                          >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Proceed to Payment (₹{
                              selectedRouteId !== currentPass.routeId 
                                ? routes.find(r => r.id === selectedRouteId)?.amount || currentPass.amount
                                : currentPass.amount
                            })
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default RenewPass;
