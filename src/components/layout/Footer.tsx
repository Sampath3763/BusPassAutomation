
import React from 'react';
import { Bus } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-college-primary text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Bus className="h-6 w-6 mr-2" />
            <span className="font-bold text-lg">STUDENT BUS PASS</span>
          </div>
          
          <div className="text-sm">
            &copy; {new Date().getFullYear()} VNR BUS PASS
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
