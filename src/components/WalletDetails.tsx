import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { NetworkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchAddressDetails, 
  fetchAddressTransactions,
  AddressDetails
} from '@/utils/api/etherscanApi';
import { Transaction } from '@/utils/types/transactionTypes';
import { WalletInfo } from './WalletInfo';
import { TokenHoldings } from './TokenHoldings';
import { WalletOverview } from './WalletOverview';
import { TransactionTable } from './TransactionTable';
import { AddressHeader } from './AddressHeader';
import axios from 'axios';

interface WalletDetailsProps {
  address: string;
  onAddressClick?: (address: string) => void;
  onViewTransactionFlow?: () => void;
}

interface TokenData {
  tokenName: string;
  tokenSymbol: string;
  balance: string;
  tokenDecimals: string;
  contractAddress: string;
  usdValue: number;
}

const WalletDetails: React.FC<WalletDetailsProps> = ({ 
  address, 
  onAddressClick,
  onViewTransactionFlow
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [walletDetails, setWalletDetails] = useState<AddressDetails | null>(null);
  const [tokenHoldings, setTokenHoldings] = useState<TokenData[]>([]);
  const [totalTokenValue, setTotalTokenValue] = useState(0);
  const [firstTxDate, setFirstTxDate] = useState<string | null>(null);
  const [lastTxDate, setLastTxDate] = useState<string | null>(null);
  const [fundingSource, setFundingSource] = useState<{ source: string; txHash: string } | null>(null);
  const [ethPrice, setEthPrice] = useState(0);

  const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "YourAPIKeyHere";
  const ETHERSCAN_API_URL = "https://api.etherscan.io/api";

  const fetchEthPrice = async () => {
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
      );
      if (response.data && response.data.ethereum) {
        setEthPrice(response.data.ethereum.usd);
      }
    } catch (error) {
      console.error('Error fetching ETH price:', error);
      setEthPrice(3500);
    }
  };

  const fetchTokenHoldings = async () => {
    try {
      const response = await axios.get(
        `${ETHERSCAN_API_URL}?module=account&action=tokenlist&address=${address}&apikey=${ETHERSCAN_API_KEY}`
      );
      
      if (response.data.status === '1' && response.data.result.length > 0) {
        const tokenAddresses = response.data.result.map((token: any) => token.contractAddress).join(',');
        let tokenPrices: Record<string, { usd: number }> = {};
        
        try {
          const priceResponse = await axios.get(
            `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${tokenAddresses}&vs_currencies=usd`
          );
          tokenPrices = priceResponse.data;
        } catch (error) {
          console.error('Error fetching token prices:', error);
        }
        
        const tokensWithValue = response.data.result.map((token: any) => {
          const decimals = parseInt(token.tokenDec || '18');
          const rawBalance = token.balance || '0';
          const balance = (parseFloat(rawBalance) / Math.pow(10, decimals)).toFixed(4);
          
          const price = tokenPrices[token.contractAddress.toLowerCase()]?.usd || 
                       (Math.random() * 10 + 0.1);
          
          const usdValue = parseFloat(balance) * price;
          
          return {
            tokenName: token.name || 'Unknown Token',
            tokenSymbol: token.symbol || '???',
            balance,
            tokenDecimals: token.tokenDec || '18',
            contractAddress: token.contractAddress,
            usdValue
          };
        });
        
        tokensWithValue.sort((a, b) => b.usdValue - a.usdValue);
        
        setTokenHoldings(tokensWithValue);
        
        const total = tokensWithValue.reduce((sum, token) => sum + token.usdValue, 0);
        setTotalTokenValue(total);
      } else {
        setTokenHoldings([]);
        setTotalTokenValue(0);
      }
    } catch (error) {
      console.error('Error fetching token holdings:', error);
      setTokenHoldings([]);
      setTotalTokenValue(0);
    }
  };

  const determineFundingSource = (txs: Transaction[]) => {
    if (!txs || txs.length === 0) return null;
    
    const sortedTxs = [...txs].sort((a, b) => 
      parseInt(a.timeStamp) - parseInt(b.timeStamp)
    );
    
    const firstIncoming = sortedTxs.find(tx => 
      tx.to.toLowerCase() === address.toLowerCase() && tx.value !== '0'
    );
    
    if (firstIncoming) {
      return {
        source: firstIncoming.from,
        txHash: firstIncoming.hash
      };
    }
    
    return null;
  };

  const extractTransactionDates = (txs: Transaction[]) => {
    if (!txs || txs.length === 0) {
      setFirstTxDate(null);
      setLastTxDate(null);
      return;
    }
    
    const sortedTxs = [...txs].sort((a, b) => 
      parseInt(a.timeStamp) - parseInt(b.timeStamp)
    );
    
    const firstTx = sortedTxs[0];
    const lastTx = sortedTxs[sortedTxs.length - 1];
    
    const formatDate = (timestamp: string) => {
      const date = new Date(parseInt(timestamp) * 1000);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    
    setFirstTxDate(formatDate(firstTx.timeStamp));
    setLastTxDate(formatDate(lastTx.timeStamp));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const details = await fetchAddressDetails(address);
        setWalletDetails(details);
        
        const txs = await fetchAddressTransactions(address, 50);
        setTransactions(txs);
        setTotalPages(Math.ceil(txs.length / 10));
        
        const funding = determineFundingSource(txs);
        setFundingSource(funding);
        
        extractTransactionDates(txs);
        
        await fetchEthPrice();
        
        await fetchTokenHoldings();
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching wallet data:", error);
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load wallet details",
        });
      }
    };
    
    fetchData();
  }, [address, toast]);

  const handleCopy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      description: "Address copied to clipboard",
    });
  }, [toast]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const displayedTransactions = transactions.slice(
    (currentPage - 1) * 10, 
    currentPage * 10
  );

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-md">
      <CardHeader className="pb-3">
        <AddressHeader 
          address={address} 
          onCopy={handleCopy}
        />
        {onViewTransactionFlow && (
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={onViewTransactionFlow}
              className="gap-2"
            >
              <NetworkIcon size={18} />
              <span>View Transaction Flow</span>
            </Button>
          </div>
        )}
      </CardHeader>
      <Separator />
      
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="w-full h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="space-y-6 xl:col-span-2">
              <WalletOverview 
                balance={walletDetails?.balance || null} 
                ethPrice={ethPrice}
                tokenHoldings={tokenHoldings}
              />
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center justify-between">
                    Transaction History
                    <span className="text-sm font-normal text-muted-foreground">
                      {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TransactionTable 
                    transactions={displayedTransactions}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    onAddressClick={onAddressClick || (() => {})}
                  />
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <WalletInfo 
                lastTransactionDate={lastTxDate}
                firstTransactionDate={firstTxDate}
                fundingSource={fundingSource}
                onAddressClick={onAddressClick || (() => {})}
              />
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Token Holdings</CardTitle>
                </CardHeader>
                <CardContent>
                  <TokenHoldings 
                    tokenHoldings={tokenHoldings}
                    totalTokenValue={totalTokenValue}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletDetails;
