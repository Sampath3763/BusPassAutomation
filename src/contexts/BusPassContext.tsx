import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from "sonner";

export type BusRoute = {
  id: string;
  number: string;
  name: string;
  amount: number;
  capacity: number;
  currentCount: number;
};

export type BusPass = {
  id: string;
  studentId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fathersName: string;
  rollNumber: string;
  branch: string;
  studyYear: string;
  bloodGroup: string;
  routeId: string;
  routeNumber: string;
  routeName: string;
  amount: number;
  studentMobile: string;
  parentMobile: string;
  residentialAddress: string;
  permanentAddress: string;
  imageUrl?: string;
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'waiting' | 'cancelled';
};

type BusPassContextType = {
  routes: BusRoute[];
  busPass: BusPass | null;
  allPasses: BusPass[];
  waitingList: BusPass[];
  applyForPass: (passData: Omit<BusPass, 'id' | 'createdAt' | 'expiresAt' | 'status'>) => Promise<boolean>;
  renewPass: (passId: string, updatedData?: Partial<BusPass>) => Promise<boolean>;
  deletePass: (passId: string, confirmData: { rollNumber: string; routeNumber: string; mobile: string }) => Promise<boolean>;
  getPassByStudentId: (studentId: string) => BusPass | null;
  getPassesByRouteId: (routeId: string) => BusPass[];
  getWaitingListByRouteId: (routeId: string) => BusPass[];
  addRoute: (route: Omit<BusRoute, 'id' | 'currentCount'>) => void;
  updateRoute: (routeId: string, routeData: { number?: string; name?: string; amount?: number; capacity?: number }) => boolean;
  deleteRoute: (routeId: string) => boolean;
  removeStudent: (passId: string) => boolean;
  resetSeatCounts: () => void;
  isLoading: boolean;
};

const initialRoutes: BusRoute[] = [
  { id: '1', number: 'R001', name: 'North Campus Route', amount: 5000, capacity: 50, currentCount: 0 },
  { id: '2', number: 'R002', name: 'South Campus Route', amount: 4500, capacity: 50, currentCount: 0 },
  { id: '3', number: 'R003', name: 'East Campus Route', amount: 5500, capacity: 50, currentCount: 0 },
  { id: '4', number: 'R004', name: 'West Campus Route', amount: 4000, capacity: 50, currentCount: 0 },
];

const initialPasses: BusPass[] = [];

const BusPassContext = createContext<BusPassContextType | undefined>(undefined);

export const BusPassProvider = ({ children }: { children: ReactNode }) => {
  const [routes, setRoutes] = useState<BusRoute[]>(() => {
    const savedRoutes = localStorage.getItem('busRoutes');
    return savedRoutes ? JSON.parse(savedRoutes) : initialRoutes;
  });
  
  const [allPasses, setAllPasses] = useState<BusPass[]>(() => {
    const savedPasses = localStorage.getItem('busPasses');
    return savedPasses ? JSON.parse(savedPasses) : initialPasses;
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('busRoutes', JSON.stringify(routes));
  }, [routes]);

  useEffect(() => {
    localStorage.setItem('busPasses', JSON.stringify(allPasses));
  }, [allPasses]);

  const getPassByStudentId = (studentId: string): BusPass | null => {
    return allPasses.find(pass => pass.studentId === studentId && pass.status === 'active') || null;
  };

  const getPassesByRouteId = (routeId: string): BusPass[] => {
    return allPasses.filter(pass => pass.routeId === routeId && pass.status === 'active');
  };

  const getWaitingListByRouteId = (routeId: string): BusPass[] => {
    return allPasses.filter(pass => pass.routeId === routeId && pass.status === 'waiting');
  };

  const applyForPass = async (passData: Omit<BusPass, 'id' | 'createdAt' | 'expiresAt' | 'status'>): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const existingPass = allPasses.find(
        pass => pass.studentId === passData.studentId && (pass.status === 'active' || pass.status === 'waiting')
      );

      if (existingPass) {
        toast.error("You already have an active or waiting bus pass.");
        return false;
      }

      const route = routes.find(route => route.id === passData.routeId);
      if (!route) {
        toast.error("Selected route not found.");
        return false;
      }

      await new Promise(resolve => setTimeout(resolve, 1500));

      const now = new Date();
      const expiryDate = new Date();
      expiryDate.setMonth(4);
      expiryDate.setDate(31);
      if (now.getMonth() > 4 || (now.getMonth() === 4 && now.getDate() > 31)) {
        expiryDate.setFullYear(now.getFullYear() + 1);
      }

      const status = route.currentCount < route.capacity ? 'active' : 'waiting';
      
      const newPass: BusPass = {
        ...passData,
        id: Math.random().toString(36).substring(2, 9),
        createdAt: now.toISOString(),
        expiresAt: expiryDate.toISOString(),
        status
      };

      if (status === 'active') {
        setRoutes(currentRoutes => 
          currentRoutes.map(r => 
            r.id === passData.routeId 
              ? { ...r, currentCount: r.currentCount + 1 } 
              : r
          )
        );
      }

      setAllPasses(current => [...current, newPass]);
      
      if (status === 'waiting') {
        toast.info("Route is at capacity. Your pass has been added to the waiting list.");
        
        const waitingCount = getWaitingListByRouteId(passData.routeId).length;
        if (waitingCount > 10) {
          toast.warning("Admin notification: More than 10 students waiting for route " + route.number);
        }
      } else {
        toast.success("Bus pass has been issued successfully!");
      }
      
      return true;
    } catch (error) {
      toast.error("Failed to process payment. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const renewPass = async (passId: string, updatedData?: Partial<BusPass>): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const passIndex = allPasses.findIndex(pass => pass.id === passId);
      if (passIndex === -1) {
        toast.error("Pass not found.");
        return false;
      }

      await new Promise(resolve => setTimeout(resolve, 1500));

      const currentPass = allPasses[passIndex];
      
      const expiryDate = new Date();
      expiryDate.setMonth(4);
      expiryDate.setDate(31);
      
      const now = new Date();
      if (now.getMonth() > 4 || (now.getMonth() === 4 && now.getDate() > 31)) {
        expiryDate.setFullYear(now.getFullYear() + 1);
      }

      let newPass: BusPass;
      
      if (updatedData?.routeId && updatedData.routeId !== currentPass.routeId) {
        const newRoute = routes.find(route => route.id === updatedData.routeId);
        if (!newRoute) {
          toast.error("Selected route not found.");
          return false;
        }
        
        const status = newRoute.currentCount < newRoute.capacity ? 'active' : 'waiting';
        
        setRoutes(currentRoutes => 
          currentRoutes.map(r => {
            if (r.id === currentPass.routeId && currentPass.status === 'active') {
              return { ...r, currentCount: r.currentCount - 1 };
            } else if (r.id === updatedData.routeId && status === 'active') {
              return { ...r, currentCount: r.currentCount + 1 };
            }
            return r;
          })
        );
        
        newPass = {
          ...currentPass,
          ...updatedData,
          routeNumber: newRoute.number,
          routeName: newRoute.name,
          amount: newRoute.amount,
          expiresAt: expiryDate.toISOString(),
          status
        };
      } else {
        newPass = {
          ...currentPass,
          ...updatedData,
          expiresAt: expiryDate.toISOString(),
          status: 'active'
        };
      }

      const updatedPasses = [...allPasses];
      updatedPasses[passIndex] = newPass;
      setAllPasses(updatedPasses);
      
      toast.success("Bus pass has been renewed successfully!");
      return true;
    } catch (error) {
      toast.error("Failed to renew pass. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePass = async (passId: string, confirmData: { 
    rollNumber: string; 
    routeNumber: string; 
    mobile: string 
  }): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const passIndex = allPasses.findIndex(pass => pass.id === passId);
      if (passIndex === -1) {
        toast.error("Pass not found.");
        return false;
      }

      const pass = allPasses[passIndex];
      
      if (
        pass.rollNumber !== confirmData.rollNumber ||
        pass.routeNumber !== confirmData.routeNumber ||
        pass.studentMobile !== confirmData.mobile
      ) {
        toast.error("Confirmation details do not match. Deletion cancelled.");
        return false;
      }

      if (pass.status === 'active') {
        setRoutes(currentRoutes => 
          currentRoutes.map(r => 
            r.id === pass.routeId 
              ? { ...r, currentCount: r.currentCount - 1 } 
              : r
          )
        );

        const waitingPasses = allPasses.filter(
          p => p.routeId === pass.routeId && p.status === 'waiting'
        ).sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        if (waitingPasses.length > 0) {
          const passToActivate = waitingPasses[0];
          setAllPasses(current => 
            current.map(p => 
              p.id === passToActivate.id 
                ? { ...p, status: 'active' } 
                : p
            )
          );
          
          setRoutes(currentRoutes => 
            currentRoutes.map(r => 
              r.id === pass.routeId 
                ? { ...r, currentCount: r.currentCount + 1 } 
                : r
            )
          );
          
          toast.info(`Pass for ${passToActivate.firstName} ${passToActivate.lastName} has been activated from the waiting list.`);
        }
      }

      setAllPasses(current => 
        current.map(p => 
          p.id === passId 
            ? { ...p, status: 'cancelled' } 
            : p
        )
      );
      
      toast.success("Bus pass has been deleted successfully!");
      return true;
    } catch (error) {
      toast.error("Failed to delete pass. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const addRoute = (route: Omit<BusRoute, 'id' | 'currentCount'>) => {
    const newRoute: BusRoute = {
      ...route,
      id: Math.random().toString(36).substring(2, 9),
      currentCount: 0
    };
    
    setRoutes(current => [...current, newRoute]);
    toast.success(`Route ${route.number} - ${route.name} added successfully!`);
  };

  const updateRoute = (routeId: string, routeData: { 
    number?: string; 
    name?: string;
    amount?: number;
    capacity?: number;
  }): boolean => {
    const routeIndex = routes.findIndex(r => r.id === routeId);
    if (routeIndex === -1) {
      toast.error("Route not found");
      return false;
    }

    if (routeData.number) {
      const isNumberTaken = routes.some(r => 
        r.id !== routeId && r.number.toLowerCase() === routeData.number?.toLowerCase()
      );
      
      if (isNumberTaken) {
        toast.error(`Route number ${routeData.number} is already in use`);
        return false;
      }
    }

    if (routeData.capacity !== undefined) {
      const oldCapacity = routes[routeIndex].capacity;
      const newCapacity = routeData.capacity;
      
      if (newCapacity < routes[routeIndex].currentCount) {
        toast.error(`Cannot reduce capacity below current student count (${routes[routeIndex].currentCount})`);
        return false;
      }
    }

    const updatedRoutes = [...routes];
    const oldRoute = updatedRoutes[routeIndex];
    
    updatedRoutes[routeIndex] = {
      ...oldRoute,
      ...(routeData.number && { number: routeData.number }),
      ...(routeData.name && { name: routeData.name }),
      ...(routeData.amount !== undefined && { amount: routeData.amount }),
      ...(routeData.capacity !== undefined && { capacity: routeData.capacity })
    };
    
    // Update route information in passes
    if (routeData.number && routeData.number !== oldRoute.number) {
      setAllPasses(passes => 
        passes.map(pass => 
          pass.routeId === routeId 
            ? { ...pass, routeNumber: routeData.number! } 
            : pass
        )
      );
    }
    
    if (routeData.name && routeData.name !== oldRoute.name) {
      setAllPasses(passes => 
        passes.map(pass => 
          pass.routeId === routeId 
            ? { ...pass, routeName: routeData.name! } 
            : pass
        )
      );
    }

    // Update amount in passes for future payments (doesn't affect existing paid passes)
    if (routeData.amount !== undefined && routeData.amount !== oldRoute.amount) {
      setAllPasses(passes => 
        passes.map(pass => 
          pass.routeId === routeId && pass.status === 'waiting'
            ? { ...pass, amount: routeData.amount! } 
            : pass
        )
      );
    }
    
    setRoutes(updatedRoutes);
    toast.success("Route updated successfully");
    return true;
  };

  const deleteRoute = (routeId: string): boolean => {
    const routeIndex = routes.findIndex(r => r.id === routeId);
    if (routeIndex === -1) {
      toast.error("Route not found");
      return false;
    }

    const route = routes[routeIndex];
    const activeStudents = getPassesByRouteId(routeId).length;
    const waitingStudents = getWaitingListByRouteId(routeId).length;

    if (activeStudents > 0 || waitingStudents > 0) {
      toast.error(`Cannot delete route with ${activeStudents} active and ${waitingStudents} waiting students`);
      return false;
    }

    setRoutes(current => current.filter(r => r.id !== routeId));
    toast.success(`Route ${route.number} - ${route.name} deleted successfully`);
    return true;
  };

  const removeStudent = (passId: string): boolean => {
    const passIndex = allPasses.findIndex(pass => pass.id === passId);
    if (passIndex === -1) {
      toast.error("Student pass not found");
      return false;
    }

    const pass = allPasses[passIndex];
    
    if (pass.status === 'active') {
      // Decrease route count
      setRoutes(currentRoutes => 
        currentRoutes.map(r => 
          r.id === pass.routeId 
            ? { ...r, currentCount: r.currentCount - 1 } 
            : r
        )
      );

      // Activate next student from waiting list if any
      const waitingPasses = allPasses.filter(
        p => p.routeId === pass.routeId && p.status === 'waiting'
      ).sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      if (waitingPasses.length > 0) {
        const passToActivate = waitingPasses[0];
        setAllPasses(current => 
          current.map(p => 
            p.id === passToActivate.id 
              ? { ...p, status: 'active' } 
              : p
          )
        );
        
        setRoutes(currentRoutes => 
          currentRoutes.map(r => 
            r.id === pass.routeId 
              ? { ...r, currentCount: r.currentCount + 1 } 
              : r
          )
        );
        
        toast.info(`Pass for ${passToActivate.firstName} ${passToActivate.lastName} has been activated from the waiting list.`);
      }
    }

    // Mark the pass as cancelled
    setAllPasses(current => 
      current.map(p => 
        p.id === passId 
          ? { ...p, status: 'cancelled' } 
          : p
      )
    );
    
    toast.success(`Student ${pass.firstName} ${pass.lastName} removed successfully`);
    return true;
  };

  const resetSeatCounts = () => {
    setRoutes(currentRoutes => 
      currentRoutes.map(route => ({
        ...route,
        currentCount: 0
      }))
    );
    toast.success("All route seat counts have been reset to 0");
  };

  return (
    <BusPassContext.Provider 
      value={{ 
        routes, 
        busPass: null, 
        allPasses, 
        waitingList: allPasses.filter(pass => pass.status === 'waiting'),
        applyForPass, 
        renewPass, 
        deletePass, 
        getPassByStudentId, 
        getPassesByRouteId,
        getWaitingListByRouteId,
        addRoute,
        updateRoute,
        deleteRoute,
        removeStudent,
        resetSeatCounts,
        isLoading
      }}
    >
      {children}
    </BusPassContext.Provider>
  );
};

export const useBusPass = () => {
  const context = useContext(BusPassContext);
  if (context === undefined) {
    throw new Error('useBusPass must be used within a BusPassProvider');
  }
  return context;
};
