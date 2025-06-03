import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import {
  getTransactionMethod,
  formatTimeSince,
  formatWeiToEth,
  calculateTxnFee,
  truncateAddress,
} from "@/utils/walletUtils";
import { Transaction } from "@/utils/types/transactionTypes";

interface TransactionTableProps {
  transactions: Transaction[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onAddressClick: (address: string) => void;
}

export const TransactionTable = ({
  transactions,
  currentPage,
  totalPages,
  onPageChange,
  onAddressClick
}: TransactionTableProps) => {
  const renderPagination = () => {
    // Only show pagination if there are transactions
    if (transactions.length === 0) return null;
    
    // Calculate range of page numbers to display
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // Adjust startPage if endPage is at the maximum
    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - 4);
    }
    
    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => onPageChange(currentPage - 1)}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {pageNumbers.map(page => (
            <PaginationItem key={page}>
              <PaginationLink 
                isActive={page === currentPage}
                onClick={() => onPageChange(page)}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => onPageChange(currentPage + 1)}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <>
      {transactions.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>
                Showing {transactions.length} transactions for this wallet
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Txn Hash</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Block</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Amount (ETH)</TableHead>
                  <TableHead>Txn Fee (ETH)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.hash}>
                    <TableCell className="font-medium">
                      <Button 
                        variant="link" 
                        className="p-0 h-auto font-mono text-primary"
                        onClick={() => onAddressClick(tx.hash)}
                      >
                        {tx.hash.slice(0, 10)}...
                      </Button>
                    </TableCell>
                    <TableCell>{getTransactionMethod(tx.input, tx.functionName)}</TableCell>
                    <TableCell>{tx.blockNumber}</TableCell>
                    <TableCell>{formatTimeSince(parseInt(tx.timeStamp))}</TableCell>
                    <TableCell>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto font-mono"
                        onClick={() => onAddressClick(tx.from)}
                      >
                        {truncateAddress(tx.from)}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto font-mono"
                        onClick={() => onAddressClick(tx.to)}
                      >
                        {truncateAddress(tx.to)}
                      </Button>
                    </TableCell>
                    <TableCell className="font-mono">
                      {formatWeiToEth(tx.value)}
                    </TableCell>
                    <TableCell className="font-mono">
                      {calculateTxnFee(tx.gasUsed, tx.gasPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {renderPagination()}
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No transactions found for this address</p>
        </div>
      )}
    </>
  );
};
