
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TransactionFlow from '@/components/TransactionFlow';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getEtherscanApiKey } from '@/utils/transactionFlowUtils';
import { useToast } from '@/hooks/use-toast';

const GraphView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [address, setAddress] = useState<string>('');

  useEffect(() => {
    // Extract address from URL search params
    const searchParams = new URLSearchParams(location.search);
    const addressParam = searchParams.get('address');
    
    if (!addressParam) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No Ethereum address provided",
      });
      navigate('/');
      return;
    }

    // Check if API key is set
    const apiKey = getEtherscanApiKey();
    if (!apiKey || apiKey === "YourAPIKeyHere") {
      toast({
        variant: "destructive",
        title: "API Key Required",
        description: "Please set your Etherscan API key to view transaction graphs",
      });
      navigate('/');
      return;
    }

    setAddress(addressParam);
  }, [location, navigate, toast]);

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="px-4 py-2 bg-background border-b border-border">
        <div className="container mx-auto flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClose}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Explorer
          </Button>
          <h2 className="text-lg font-medium">
            Transaction Flow: <span className="font-mono">{address ? `${address.slice(0, 8)}...${address.slice(-6)}` : ''}</span>
          </h2>
        </div>
      </div>
      
      <div className="flex-1 w-full">
        {address && (
          <TransactionFlow 
            address={address}
            onClose={handleClose}
          />
        )}
      </div>
    </div>
  );
};

export default GraphView;
