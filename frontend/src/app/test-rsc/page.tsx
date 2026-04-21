import { donationGateway } from '@/core/gateway';

export default async function TestRSCPage() {
  // Direct call to gateway on server side
  const donations = await donationGateway.getDonations();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">tét tét các kiểu</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Danh sách quyên góp (Server Side)</h2>
      </div>
    </div>
  );
}
