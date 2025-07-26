import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BusPass } from '@/contexts/BusPassContext';
import { Badge } from '@/components/ui/badge';
import { Bus } from 'lucide-react';

interface PassCardProps {
  pass: BusPass;
  isDetailed?: boolean;
}

const PassCard = ({ pass, isDetailed = false }: PassCardProps) => {
  const expiryDate = new Date(pass.expiresAt);
  const isExpired = expiryDate < new Date();
  
  return (
    <Card className={`bus-pass text-white overflow-hidden ${isExpired ? 'opacity-75' : ''}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <Bus className="h-6 w-6 mr-2" />
            <h3 className="text-lg font-bold">Campus Bus Pass</h3>
          </div>
          <div className="flex items-center gap-4">
            {pass.imageUrl && (
              <div className="w-16 h-16 overflow-hidden border-2 border-white">
                <img
                  src={pass.imageUrl}
                  alt={`${pass.firstName} ${pass.lastName}`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <Badge className={
              pass.status === 'active' ? 'bg-green-500' : 
              pass.status === 'waiting' ? 'bg-yellow-500' : 
              pass.status === 'expired' ? 'bg-red-500' : 'bg-gray-500'
            }>
              {pass.status.toUpperCase()}
            </Badge>
          </div>
        </div>
        
        <div className="pass-details p-4 text-black space-y-3">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-semibold">
                {pass.firstName} {pass.middleName ? pass.middleName + ' ' : ''}{pass.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Roll Number</p>
              <p className="font-semibold">{pass.rollNumber}</p>
            </div>
          </div>
          
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Route</p>
              <p className="font-semibold">{pass.routeNumber} - {pass.routeName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Branch & Year</p>
              <p className="font-semibold">{pass.branch}, {pass.studyYear}</p>
            </div>
          </div>
          
          {isDetailed && (
            <>
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-600">Father's Name</p>
                  <p className="font-semibold">{pass.fathersName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Blood Group</p>
                  <p className="font-semibold">{pass.bloodGroup}</p>
                </div>
              </div>
              
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-600">Student Mobile</p>
                  <p className="font-semibold">{pass.studentMobile}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Parent Mobile</p>
                  <p className="font-semibold">{pass.parentMobile}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Residential Address</p>
                <p className="font-semibold text-sm">{pass.residentialAddress}</p>
              </div>
            </>
          )}
          
          <div className="flex justify-between mt-4 pt-2 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600">Valid Until</p>
              <p className="font-semibold">{expiryDate.toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pass ID</p>
              <p className="font-semibold">{pass.id.toUpperCase()}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PassCard;
