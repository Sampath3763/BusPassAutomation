import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBusPass, BusRoute, BusPass } from '@/contexts/BusPassContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, Download, PlusCircle, Search, AlertTriangle, Bus, Users, Edit, Loader2, Trash, UserMinus } from 'lucide-react';
import { toast } from "sonner";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    routes, 
    allPasses, 
    getPassesByRouteId, 
    getWaitingListByRouteId, 
    addRoute, 
    updateRoute,
    deleteRoute,
    removeStudent,
    resetSeatCounts 
  } = useBusPass();
  
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddRouteOpen, setIsAddRouteOpen] = useState(false);
  const [isEditRouteOpen, setIsEditRouteOpen] = useState(false);
  const [isDeleteRouteOpen, setIsDeleteRouteOpen] = useState(false);
  const [isRemoveStudentOpen, setIsRemoveStudentOpen] = useState(false);
  const [routeToEdit, setRouteToEdit] = useState<BusRoute | null>(null);
  const [routeToDelete, setRouteToDelete] = useState<BusRoute | null>(null);
  const [studentToRemove, setStudentToRemove] = useState<BusPass | null>(null);
  
  // New route form state
  const [newRouteNumber, setNewRouteNumber] = useState('');
  const [newRouteName, setNewRouteName] = useState('');
  const [newRouteAmount, setNewRouteAmount] = useState('');
  const [newRouteCapacity, setNewRouteCapacity] = useState('50');
  
  // Edit route form state
  const [editRouteNumber, setEditRouteNumber] = useState('');
  const [editRouteName, setEditRouteName] = useState('');
  const [editRouteAmount, setEditRouteAmount] = useState('');
  const [editRouteCapacity, setEditRouteCapacity] = useState('');
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'admin') {
      navigate('/student');
    }
  }, [user, navigate]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality will be handled in the filtered data
  };
  
  const handleExportToExcel = () => {
    // In a real app, this would generate and download an Excel file
    toast.info('Export functionality would download an Excel file in a production environment');
  };
  
  const handleAddRoute = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newRouteNumber || !newRouteName || !newRouteAmount || !newRouteCapacity) {
      return;
    }
    
    addRoute({
      number: newRouteNumber,
      name: newRouteName,
      amount: Number(newRouteAmount),
      capacity: Number(newRouteCapacity)
    });
    
    // Reset form and close dialog
    setNewRouteNumber('');
    setNewRouteName('');
    setNewRouteAmount('');
    setNewRouteCapacity('50');
    setIsAddRouteOpen(false);
  };

  const handleEditRouteClick = (route: BusRoute) => {
    setRouteToEdit(route);
    setEditRouteNumber(route.number);
    setEditRouteName(route.name);
    setEditRouteAmount(route.amount.toString());
    setEditRouteCapacity(route.capacity.toString());
    setIsEditRouteOpen(true);
  };
  
  const handleUpdateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!routeToEdit || !editRouteNumber || !editRouteName || !editRouteAmount || !editRouteCapacity) {
      return;
    }
    
    const success = updateRoute(routeToEdit.id, {
      number: editRouteNumber,
      name: editRouteName,
      amount: Number(editRouteAmount),
      capacity: Number(editRouteCapacity)
    });
    
    if (success) {
      setIsEditRouteOpen(false);
      setRouteToEdit(null);
    }
  };

  const handleDeleteRouteClick = (route: BusRoute) => {
    setRouteToDelete(route);
    setIsDeleteRouteOpen(true);
  };
  
  const handleDeleteRoute = () => {
    if (!routeToDelete) return;
    
    const success = deleteRoute(routeToDelete.id);
    if (success) {
      setIsDeleteRouteOpen(false);
      setRouteToDelete(null);
      if (selectedRoute?.id === routeToDelete.id) {
        setSelectedRoute(null);
      }
    }
  };

  const handleRemoveStudentClick = (pass: BusPass) => {
    setStudentToRemove(pass);
    setIsRemoveStudentOpen(true);
  };
  
  const handleRemoveStudent = () => {
    if (!studentToRemove) return;
    
    const success = removeStudent(studentToRemove.id);
    if (success) {
      setIsRemoveStudentOpen(false);
      setStudentToRemove(null);
    }
  };
  
  const filteredPasses = allPasses.filter(pass => {
    const searchLower = searchQuery.toLowerCase();
    return (
      pass.firstName.toLowerCase().includes(searchLower) ||
      pass.lastName.toLowerCase().includes(searchLower) ||
      pass.rollNumber.toLowerCase().includes(searchLower) ||
      pass.routeNumber.toLowerCase().includes(searchLower)
    );
  });
  
  const routesWithWaitingLists = routes.filter(route => {
    const waitingList = getWaitingListByRouteId(route.id);
    return waitingList.length > 0;
  });
  
  const routesAtCapacity = routes.filter(route => 
    route.currentCount >= route.capacity
  );
  
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600">Manage bus routes and student passes</p>
          </div>
          <Button 
            onClick={resetSeatCounts}
            variant="outline"
            className="bg-white hover:bg-gray-100"
          >
            Reset All Seat Counts
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Total Routes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Bus className="h-8 w-8 text-college-primary mr-4" />
                <span className="text-3xl font-bold">{routes.length}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Total Passes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-8 w-8 text-college-primary mr-4" />
                <span className="text-3xl font-bold">
                  {allPasses.filter(pass => pass.status === 'active').length}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card className={routesWithWaitingLists.length > 0 ? "border-amber-300 bg-amber-50" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-lg font-medium ${routesWithWaitingLists.length > 0 ? "text-amber-800" : ""}`}>
                Routes with Waiting Lists
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <AlertCircle className={`h-8 w-8 mr-4 ${routesWithWaitingLists.length > 0 ? "text-amber-500" : "text-gray-400"}`} />
                <span className="text-3xl font-bold">
                  {routesWithWaitingLists.length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="routes">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <TabsList>
              <TabsTrigger value="routes">Bus Routes</TabsTrigger>
              <TabsTrigger value="students">Student Passes</TabsTrigger>
              <TabsTrigger value="waiting">Waiting Lists</TabsTrigger>
            </TabsList>
            
            <div className="flex mt-4 md:mt-0">
              <form onSubmit={handleSearch} className="flex space-x-2">
                <Input 
                  placeholder="Search students or routes..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-64"
                />
                <Button type="submit" variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
              
              <Button 
                variant="outline" 
                onClick={handleExportToExcel}
                className="ml-2"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          <TabsContent value="routes" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">All Bus Routes</h2>
              
              <Dialog open={isAddRouteOpen} onOpenChange={setIsAddRouteOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-college-primary hover:bg-blue-800">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add New Route
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Bus Route</DialogTitle>
                    <DialogDescription>
                      Create a new bus route for student transportation.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleAddRoute} className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="routeNumber">Route Number *</Label>
                        <Input 
                          id="routeNumber" 
                          value={newRouteNumber}
                          onChange={(e) => setNewRouteNumber(e.target.value)}
                          placeholder="e.g. R005"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="routeName">Route Name *</Label>
                        <Input 
                          id="routeName" 
                          value={newRouteName}
                          onChange={(e) => setNewRouteName(e.target.value)}
                          placeholder="e.g. North Campus"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="routeAmount">Pass Amount (₹) *</Label>
                        <Input 
                          id="routeAmount" 
                          type="number"
                          value={newRouteAmount}
                          onChange={(e) => setNewRouteAmount(e.target.value)}
                          placeholder="e.g. 5000"
                          min="1"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="routeCapacity">Capacity *</Label>
                        <Input 
                          id="routeCapacity" 
                          type="number"
                          value={newRouteCapacity}
                          onChange={(e) => setNewRouteCapacity(e.target.value)}
                          min="1"
                          max="100"
                          required
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button type="submit" className="bg-college-primary hover:bg-blue-800">
                        Add Route
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
            {routesAtCapacity.length > 0 && (
              <Card className="border-amber-300 bg-amber-50 mb-4">
                <CardContent className="p-4 flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Routes at capacity</p>
                    <p className="text-sm text-amber-700">
                      {routesAtCapacity.map(route => route.number).join(', ')} {routesAtCapacity.length === 1 ? 'is' : 'are'} at full capacity.
                      {routesWithWaitingLists.length > 0 && ' Some routes have students on waiting lists.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Route Number</TableHead>
                      <TableHead>Route Name</TableHead>
                      <TableHead>Amount (₹)</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Current Count</TableHead>
                      <TableHead>Waiting List</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routes.map((route) => {
                      const waitingCount = getWaitingListByRouteId(route.id).length;
                      const isFull = route.currentCount >= route.capacity;
                      
                      return (
                        <TableRow key={route.id}>
                          <TableCell className="font-medium">{route.number}</TableCell>
                          <TableCell>{route.name}</TableCell>
                          <TableCell>₹{route.amount}</TableCell>
                          <TableCell>{route.capacity}</TableCell>
                          <TableCell>{route.currentCount}</TableCell>
                          <TableCell>{waitingCount}</TableCell>
                          <TableCell>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium
                              ${isFull 
                                ? 'bg-red-100 text-red-800' 
                                : route.currentCount > (route.capacity * 0.8) 
                                  ? 'bg-amber-100 text-amber-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {isFull ? 'Full' : route.currentCount > (route.capacity * 0.8) ? 'Near Full' : 'Available'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedRoute(route)}
                              >
                                View Students
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditRouteClick(route)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteRouteClick(route)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                disabled={route.currentCount > 0 || waitingCount > 0}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            {/* Edit Route Dialog */}
            <Dialog open={isEditRouteOpen} onOpenChange={setIsEditRouteOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Bus Route</DialogTitle>
                  <DialogDescription>
                    Update route details.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleUpdateRoute} className="space-y-4 pt-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="editRouteNumber">Route Number *</Label>
                      <Input 
                        id="editRouteNumber" 
                        value={editRouteNumber}
                        onChange={(e) => setEditRouteNumber(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="editRouteName">Route Name *</Label>
                      <Input 
                        id="editRouteName" 
                        value={editRouteName}
                        onChange={(e) => setEditRouteName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="editRouteAmount">Pass Amount (₹) *</Label>
                      <Input 
                        id="editRouteAmount" 
                        type="number"
                        value={editRouteAmount}
                        onChange={(e) => setEditRouteAmount(e.target.value)}
                        min="1"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="editRouteCapacity">Capacity *</Label>
                      <Input 
                        id="editRouteCapacity" 
                        type="number"
                        value={editRouteCapacity}
                        onChange={(e) => setEditRouteCapacity(e.target.value)}
                        min="1"
                        max="100"
                        required
                      />
                      {routeToEdit && (
                        <p className="text-xs text-muted-foreground">
                          Current student count: {routeToEdit.currentCount}. Capacity cannot be lower than current count.
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit" className="bg-college-primary hover:bg-blue-800">
                      Save Changes
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Delete Route Dialog */}
            <Dialog open={isDeleteRouteOpen} onOpenChange={setIsDeleteRouteOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Route</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this route? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                
                {routeToDelete && (
                  <div className="py-4">
                    <p className="font-medium">Route details:</p>
                    <p>Number: {routeToDelete.number}</p>
                    <p>Name: {routeToDelete.name}</p>
                    
                    {(routeToDelete.currentCount > 0 || getWaitingListByRouteId(routeToDelete.id).length > 0) && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
                        <p className="font-medium flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Cannot delete this route
                        </p>
                        <p className="text-sm mt-1">
                          This route has {routeToDelete.currentCount} active students
                          {getWaitingListByRouteId(routeToDelete.id).length > 0 && 
                            ` and ${getWaitingListByRouteId(routeToDelete.id).length} students on the waiting list`}.
                          Remove all students from this route before deleting.
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteRouteOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteRoute}
                    disabled={routeToDelete ? routeToDelete.currentCount > 0 || getWaitingListByRouteId(routeToDelete.id).length > 0 : true}
                  >
                    Delete Route
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {selectedRoute && (
              <Card>
                <CardHeader>
                  <CardTitle>Students on Route {selectedRoute.number} - {selectedRoute.name}</CardTitle>
                  <CardDescription>
                    {getPassesByRouteId(selectedRoute.id).length} active students on this route
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Roll Number</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getPassesByRouteId(selectedRoute.id).map((pass) => (
                        <TableRow key={pass.id}>
                          <TableCell>
                            {pass.firstName} {pass.middleName ? pass.middleName + ' ' : ''}{pass.lastName}
                          </TableCell>
                          <TableCell>{pass.rollNumber}</TableCell>
                          <TableCell>{pass.branch}</TableCell>
                          <TableCell>{pass.studyYear}</TableCell>
                          <TableCell>{pass.studentMobile}</TableCell>
                          <TableCell>{new Date(pass.expiresAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleRemoveStudentClick(pass)}
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>All Student Passes</CardTitle>
                <CardDescription>
                  {filteredPasses.filter(pass => pass.status === 'active').length} active passes
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPasses
                      .filter(pass => pass.status !== 'cancelled')
                      .map((pass) => (
                        <TableRow key={pass.id}>
                          <TableCell>
                            {pass.firstName} {pass.middleName ? pass.middleName + ' ' : ''}{pass.lastName}
                          </TableCell>
                          <TableCell>{pass.rollNumber}</TableCell>
                          <TableCell>{pass.routeNumber}</TableCell>
                          <TableCell>{pass.branch}</TableCell>
                          <TableCell>{pass.studyYear}</TableCell>
                          <TableCell>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium
                              ${pass.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : pass.status === 'waiting' 
                                  ? 'bg-amber-100 text-amber-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {pass.status.charAt(0).toUpperCase() + pass.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell>{new Date(pass.expiresAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleRemoveStudentClick(pass)}
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="waiting">
            <Card>
              <CardHeader>
                <CardTitle>Waiting Lists by Route</CardTitle>
                <CardDescription>
                  Students waiting for bus passes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {routesWithWaitingLists.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No waiting lists at the moment.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {routesWithWaitingLists.map(route => {
                      const waitingList = getWaitingListByRouteId(route.id);
                      return (
                        <div key={route.id} className="space-y-2">
                          <h3 className="text-lg font-medium flex items-center">
                            {route.number} - {route.name}
                            <span className="ml-2 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs">
                              {waitingList.length} waiting
                            </span>
                          </h3>
                          
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Roll Number</TableHead>
                                <TableHead>Branch</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Applied Date</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {waitingList.map((pass) => (
                                <TableRow key={pass.id}>
                                  <TableCell>
                                    {pass.firstName} {pass.middleName ? pass.middleName + ' ' : ''}{pass.lastName}
                                  </TableCell>
                                  <TableCell>{pass.rollNumber}</TableCell>
                                  <TableCell>{pass.branch}</TableCell>
                                  <TableCell>{pass.studentMobile}</TableCell>
                                  <TableCell>{new Date(pass.createdAt).toLocaleDateString()}</TableCell>
                                  <TableCell>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleRemoveStudentClick(pass)}
                                    >
                                      <UserMinus className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Remove Student Dialog */}
        <Dialog open={isRemoveStudentOpen} onOpenChange={setIsRemoveStudentOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove Student</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove this student's bus pass? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            {studentToRemove && (
              <div className="py-4">
                <p className="font-medium">Student details:</p>
                <p>Name: {studentToRemove.firstName} {studentToRemove.middleName ? studentToRemove.middleName + ' ' : ''}{studentToRemove.lastName}</p>
                <p>Roll Number: {studentToRemove.rollNumber}</p>
                <p>Route: {studentToRemove.routeNumber} - {studentToRemove.routeName}</p>
                <p>Status: {studentToRemove.status.charAt(0).toUpperCase() + studentToRemove.status.slice(1)}</p>
              </div>
            )}
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsRemoveStudentOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRemoveStudent}
              >
                Remove Student
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
