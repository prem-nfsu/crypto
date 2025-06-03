import { useState, useRef, useEffect } from "react";
import { ethers } from "ethers";
import { useToast } from "@/hooks/use-toast";
import { TransactionSearchInput } from "@/components/TransactionSearchInput";
import { TransactionDetails } from "@/components/TransactionDetails";
import { BlockDetails } from "@/components/BlockDetails";
import WalletDetails from "@/components/WalletDetails";
import { Header } from "@/components/Header";
import { ApiKeyInput } from "@/components/ApiKeyInput";
import axios from "axios";
import { isValidEthereumAddress } from "@/utils/walletUtils";
import { setEtherscanApiKey, getEtherscanApiKey } from "@/utils/api/etherscanApi";
import { useNavigate } from "react-router-dom";

const INFURA_URL = "https://mainnet.infura.io/v3/84842078b09946638c03157f83405213";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [transaction, setTransaction] = useState<any>(null);
  const [blockData, setBlockData] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [currentBlockNumber, setCurrentBlockNumber] = useState<number | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const { toast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const provider = new ethers.JsonRpcProvider(INFURA_URL);

  const getBlockTimestamp = async (blockNumber: number) => {
    const apiKey = getEtherscanApiKey();
    const url = `https://api.etherscan.io/api?module=block&action=getblockreward&blockno=${blockNumber}&apikey=${apiKey}`;
    try {
      const response = await axios.get(url);
      if (response.data.status === "1") {
        return Number(response.data.result.timeStamp);
      }
      return null;
    } catch (error) {
      console.error("Error fetching block timestamp:", error);
      return null;
    }
  };

  const getBlockDetails = async (blockNumber: string) => {
    const apiKey = getEtherscanApiKey();
    const url = `https://api.etherscan.io/api?module=block&action=getblockreward&blockno=${blockNumber}&apikey=${apiKey}`;
    
    try {
      const response = await axios.get(url);
      
      if (response.data.status === "1") {
        return response.data.result;
      } else {
        throw new Error(response.data.message || "Failed to fetch block details");
      }
    } catch (error) {
      console.error("Error fetching block details:", error);
      throw error;
    }
  };

  const isValidTxHash = (hash: string): boolean => {
    const validHashPattern = /^0x[0-9a-fA-F]{64}$/;
    return validHashPattern.test(hash);
  };

  const handleSearch = async (searchValue: string, isBlockNumber: boolean) => {
    setIsLoading(true);
    setTransaction(null);
    setBlockData(null);
    setWalletAddress(null);

    try {
      if (isBlockNumber) {
        const blockDetails = await getBlockDetails(searchValue);
        setBlockData(blockDetails);
        
        const currentBlock = await provider.getBlockNumber();
        setCurrentBlockNumber(currentBlock);
      } else if (isValidEthereumAddress(searchValue)) {
        setWalletAddress(searchValue);
      } else if (isValidTxHash(searchValue)) {
        const [tx, currentBlock] = await Promise.all([
          provider.getTransaction(searchValue),
          provider.getBlockNumber()
        ]);

        if (!tx) {
          throw new Error("Transaction not found");
        }

        const receipt = await provider.getTransactionReceipt(searchValue);
        const timestamp = await getBlockTimestamp(tx.blockNumber);

        const txWithReceipt = {
          ...tx,
          status: receipt?.status,
          timestamp,
          gasUsed: receipt?.gasUsed || 0n,
        };

        setTransaction(txWithReceipt);
        setCurrentBlockNumber(currentBlock);
      } else {
        throw new Error("Invalid input format. Please enter a valid transaction hash, block number, or Ethereum address.");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message || "Failed to fetch details",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressSearch = (address: string) => {
    setSearchValue(address);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
    toast({
      description: `Address ${address.slice(0, 6)}...${address.slice(-4)} loaded into search`,
    });
  };

  const handleViewTransactionFlow = () => {
    const apiKey = getEtherscanApiKey();
    if (!apiKey || apiKey === "YourAPIKeyHere") {
      toast({
        variant: "destructive",
        title: "API Key Required",
        description: "Please set your Etherscan API key to view transaction graphs",
      });
      return;
    }
    
    if (walletAddress) {
      navigate(`/view/graph?address=${walletAddress}`);
    }
  };

  const handleApiKeySave = (apiKey: string) => {
    const success = setEtherscanApiKey(apiKey);
    if (success) {
      localStorage.setItem('etherscan_api_key', apiKey);
      toast({
        description: "Etherscan API key updated successfully.",
      });
    }
  };

  useEffect(() => {
    const savedApiKey = localStorage.getItem('etherscan_api_key');
    if (savedApiKey) {
      setEtherscanApiKey(savedApiKey);
    } else {
      // Set default API key if none exists
      setEtherscanApiKey('ZJGPNVKI9W7BQAD85BZC7PAATZGE33NQPE');
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Header />
      <div className="flex flex-col items-center px-4 py-16">
        <div className="w-full max-w-2xl text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold mb-4">Ethereum Explorer</h1>
          <p className="text-lg text-muted-foreground">
            Enter a transaction hash, block number, or wallet address to view detailed information
          </p>
        </div>

        <div className="w-full flex flex-col items-center gap-8">
          <ApiKeyInput 
            defaultKey={getEtherscanApiKey()} 
            onSave={handleApiKeySave} 
          />
          
          <TransactionSearchInput 
            onSearch={handleSearch} 
            isLoading={isLoading} 
            value={searchValue}
            onChange={setSearchValue}
            inputRef={searchInputRef}
          />
          
          {transaction && (
            <TransactionDetails 
              transaction={transaction} 
              currentBlockNumber={currentBlockNumber || undefined}
              onAddressSearch={handleAddressSearch}
            />
          )}
          
          {blockData && (
            <BlockDetails blockData={blockData} />
          )}

          {walletAddress && (
            <WalletDetails 
              address={walletAddress}
              onAddressClick={handleAddressSearch}
              onViewTransactionFlow={handleViewTransactionFlow}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
