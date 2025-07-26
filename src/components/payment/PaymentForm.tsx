
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from "sonner";

interface PaymentFormProps {
  amount: number;
  onPaymentComplete: () => void;
  onPaymentCancel: () => void;
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  onPaymentComplete,
  onPaymentCancel,
  isProcessing,
  setIsProcessing
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add space after every 4 digits
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.slice(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Format as MM/YY
    if (digits.length > 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }
    return digits;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cardNumber.length < 19) {
      toast.error("Please enter a valid card number");
      return;
    }
    
    if (expiryDate.length < 5) {
      toast.error("Please enter a valid expiry date");
      return;
    }
    
    if (cvv.length < 3) {
      toast.error("Please enter a valid CVV");
      return;
    }
    
    if (nameOnCard.length < 3) {
      toast.error("Please enter the name on card");
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful payment (in a real app, this would be a call to a payment gateway)
      setPaymentCompleted(true);
      toast.success("Payment successful!");
      
      // Wait for success animation to show
      setTimeout(() => {
        onPaymentComplete();
      }, 1500);
    } catch (error) {
      toast.error("Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };
  
  if (paymentCompleted) {
    return (
      <Card className="w-full max-w-md mx-auto mt-4">
        <CardContent className="pt-6 flex flex-col items-center justify-center py-10">
          <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          <CardTitle className="text-xl mb-2">Payment Successful!</CardTitle>
          <CardDescription className="text-center mb-6">
            Your payment of ₹{amount} has been processed successfully.
          </CardDescription>
          <p className="text-sm text-center text-muted-foreground">
            Redirecting to your dashboard...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>Enter your card details to complete payment</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="border rounded-md p-3 bg-muted/50">
              ₹{amount.toLocaleString()}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nameOnCard">Name on Card</Label>
            <Input
              id="nameOnCard"
              value={nameOnCard}
              onChange={(e) => setNameOnCard(e.target.value)}
              placeholder="John Doe"
              disabled={isProcessing}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                disabled={isProcessing}
                required
              />
              <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                value={expiryDate}
                onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                placeholder="MM/YY"
                maxLength={5}
                disabled={isProcessing}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                placeholder="123"
                maxLength={3}
                disabled={isProcessing}
                required
              />
            </div>
          </div>
          
          <div className="pt-4 flex flex-col md:flex-row gap-2">
            <Button 
              type="submit"
              className="flex-1 bg-college-accent hover:bg-amber-600"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay ₹{amount}
                </>
              )}
            </Button>
            
            <Button 
              type="button"
              variant="outline"
              onClick={onPaymentCancel}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
          
          <div className="text-xs text-center text-gray-500 mt-4">
            <p>This is a demo payment form. No real payments will be processed.</p>
            <p>Use any valid-looking card details for testing.</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;
