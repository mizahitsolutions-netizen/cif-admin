import { Eye } from 'lucide-react';

export default function Orders({ orders }) {
  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Orders</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Order</th>
              <th className="p-4 text-left">Customer</th>
              <th className="p-4 text-left">Items</th>
              <th className="p-4 text-left">Total</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map(order => (
              <tr key={order.id} className="border-t">
                <td className="p-4">#{order.id}</td>
                <td className="p-4">{order.customer}</td>
                <td className="p-4">{order.items}</td>
                <td className="p-4">${order.total.toFixed(2)}</td>
                <td className="p-4">{order.status}</td>
                <td className="p-4">
                  <Eye size={18} className="text-blue-600" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}