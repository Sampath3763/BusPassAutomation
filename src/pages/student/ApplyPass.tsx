import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBusPass, BusRoute } from '@/contexts/BusPassContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CreditCard, Upload } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PaymentForm from '@/components/payment/PaymentForm';
import { toast } from "sonner";

const ApplyPass = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { routes, applyForPass, isLoading } = useBusPass();
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fathersName, setFathersName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [branch, setBranch] = useState('');
  const [studyYear, setStudyYear] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [studentMobile, setStudentMobile] = useState('');
  const [parentMobile, setParentMobile] = useState('');
  const [residentialAddress, setResidentialAddress] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'student') {
      navigate('/admin');
    }
  }, [user, navigate]);
  
  useEffect(() => {
    if (selectedRouteId) {
      const route = routes.find(r => r.id === selectedRouteId) || null;
      setSelectedRoute(route);
    } else {
      setSelectedRoute(null);
    }
  }, [selectedRouteId, routes]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error("Please upload your photo");
      return;
    }
    if (selectedRoute) {
      setShowPaymentForm(true);
    }
  };
  
  const handleCancelPayment = () => {
    setShowPaymentForm(false);
  };
  
  const handlePaymentComplete = async () => {
    try {
      if (!selectedRoute || !imageFile) return;
      
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        
        const success = await applyForPass({
          studentId: user!.id,
          firstName,
          middleName: middleName || undefined,
          lastName,
          fathersName,
          rollNumber,
          branch,
          studyYear,
          bloodGroup,
          routeId: selectedRoute.id,
          routeNumber: selectedRoute.number,
          routeName: selectedRoute.name,
          amount: selectedRoute.amount,
          studentMobile,
          parentMobile,
          residentialAddress,
          permanentAddress,
          imageUrl: base64Image,
        });
        
        if (success) {
          navigate('/student');
        }
      };
    } finally {
      setIsProcessingPayment(false);
      setShowPaymentForm(false);
    }
  };
  
  const handleCopyAddress = () => {
    setPermanentAddress(residentialAddress);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-college-primary" />
      </div>
    );
  }
  
  if (showPaymentForm && selectedRoute) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Complete Payment</h1>
            <p className="text-gray-600">Pay for your bus pass to complete the application</p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <PaymentForm 
              amount={selectedRoute.amount}
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
          <h1 className="text-3xl font-bold">Apply for Bus Pass</h1>
          <p className="text-gray-600">Fill in the form to apply for a new bus pass</p>
        </div>
        
        <form onSubmit={handleProceedToPayment} className="max-w-3xl mx-auto">
          <Card className="mb-6">
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fathersName">Father's Name *</Label>
                  <Input 
                    id="fathersName" 
                    value={fathersName}
                    onChange={(e) => setFathersName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rollNumber">College Roll Number *</Label>
                  <Input 
                    id="rollNumber" 
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    required
                  />
                </div>
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

              <div className="space-y-2">
                <Label htmlFor="photo">Photo *</Label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      required
                    />
                    <Label
                      htmlFor="photo"
                      className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-50"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Upload Photo</span>
                    </Label>
                  </div>
                  {imagePreview && (
                    <div className="relative w-20 h-20">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500">Upload a clear photo (max 5MB)</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-6">
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
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Bus Route and Payment</CardTitle>
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
                        {route.currentCount >= route.capacity && " - FULL"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedRoute && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Route:</span>
                      <span>{selectedRoute.number} - {selectedRoute.name}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Amount:</span>
                      <span>₹{selectedRoute.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Availability:</span>
                      <span className={selectedRoute.currentCount >= selectedRoute.capacity ? 'text-red-500' : 'text-green-500'}>
                        {selectedRoute.capacity - selectedRoute.currentCount} seats available
                      </span>
                    </div>
                    
                    {selectedRoute.currentCount >= selectedRoute.capacity && (
                      <p className="mt-2 text-sm text-amber-600">
                        This route is currently full. Your application will be added to the waiting list.
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-college-accent hover:bg-amber-600"
                  disabled={!selectedRouteId}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Proceed to Payment (₹{selectedRoute?.amount || 0})
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
      
      <Footer />
    </div>
  );
};

export default ApplyPass;
