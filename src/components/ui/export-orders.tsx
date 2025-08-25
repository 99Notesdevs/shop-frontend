import { Button } from "./button";
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export interface Order {
  id: number;
  orderDate: string;
  totalAmount: number;
  status: string;
  shippingAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phoneNumber: string;
  } | string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
}

interface ExportOrdersProps {
  orders: Order[];
  className?: string;
}

export function ExportOrders({ orders, className }: ExportOrdersProps) {
  const exportToExcel = () => {
    const data = orders.map(order => {
      // Handle shipping address and phone number
      let address = 'No shipping address';
      let phoneNumber = order.user?.phone || 'N/A';
      
      if (order.shippingAddress && typeof order.shippingAddress === 'object') {
        address = [
          order.shippingAddress.addressLine1,
          order.shippingAddress.addressLine2,
          `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`,
          order.shippingAddress.country
        ].filter(Boolean).join(', ');
        
        phoneNumber = order.shippingAddress.phoneNumber || phoneNumber;
      } else if (typeof order.shippingAddress === 'string') {
        address = order.shippingAddress;
      }

      return {
        'Order ID': `#${order.id}`,
        'Date': new Date(order.orderDate).toLocaleDateString(),
        'Customer Name': `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || 'N/A',
        'Email': order.user?.email || 'N/A',
        'Phone': phoneNumber,
        'Total': `₹${order.totalAmount.toFixed(2)}`,
        'Payment Status': order.status,
        'Shipping Address': address
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    XLSX.writeFile(workbook, `orders_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className={`flex space-x-2 ${className}`}>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={exportToExcel}
        className="flex items-center gap-1"
      >
        <Download className="h-4 w-4" />
        <span>Export to Excel</span>
      </Button>
    </div>
  );
}
