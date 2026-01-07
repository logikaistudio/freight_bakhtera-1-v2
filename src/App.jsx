import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import MainLayout from './components/Layout/MainLayout';
import { testSupabaseConnection, getSupabaseStatus } from './lib/supabase';

// Main Dashboard
import FreightDashboard from './pages/FreightDashboard';

// Centralized Modules
import VendorManagement from './pages/Centralized/VendorManagement';
import CustomerManagement from './pages/Centralized/CustomerManagement';
import Finance from './pages/Centralized/Finance';
import CompanySettings from './pages/Centralized/CompanySettings';
import COAMaster from './pages/Centralized/COAMaster';

// Blink Module
import BlinkDashboard from './pages/Blink/BlinkDashboard';
import QuotationManagement from './pages/Blink/QuotationManagement';
import FlowMonitor from './pages/Blink/FlowMonitor';
import SalesAchievement from './pages/Blink/SalesAchievement';
import ShipmentManagement from './pages/Blink/ShipmentManagement';
import TrackingMonitoring from './pages/Blink/TrackingMonitoring';
import AWBManagement from './pages/Blink/AWBManagement';
import BLManagement from './pages/Blink/BLManagement';
import SalesRevenue from './pages/Blink/SalesRevenue';
import ProfitAnalysis from './pages/Blink/ProfitAnalysis';
import MasterRoutes from './pages/Blink/MasterRoutes';

// Blink Finance Module
import InvoiceManagement from './pages/Blink/InvoiceManagement';
import PurchaseOrder from './pages/Blink/PurchaseOrder';
import GeneralJournal from './pages/Blink/GeneralJournal';
import AccountsReceivable from './pages/Blink/AccountsReceivable';
import AccountsPayable from './pages/Blink/AccountsPayable';
import ProfitLoss from './pages/Blink/ProfitLoss';
import BalanceSheet from './pages/Blink/BalanceSheet';
import GeneralLedger from './pages/Blink/GeneralLedger';
import TrialBalance from './pages/Blink/TrialBalance';

// Bridge Module
import BridgeDashboard from './pages/Bridge/BridgeDashboard';
import BCMaster from './pages/Bridge/BCMaster';
import ItemMaster from './pages/Bridge/ItemMaster';
import PengajuanManagement from './pages/Bridge/PengajuanManagement';
import BridgeFinance from './pages/Bridge/BridgeFinance';
import GoodsMovement from './pages/Bridge/GoodsMovement';
import WarehouseInventory from './pages/Bridge/WarehouseInventory';
import ActivityLogger from './pages/Bridge/ActivityLogger';
import ApprovalManager from './pages/Bridge/ApprovalManager';

// Big Module
import BigDashboard from './pages/Big/BigDashboard';
import EventManagement from './pages/Big/EventManagement';
import BigQuotations from './pages/Big/BigQuotations';
import BigInvoices from './pages/Big/BigInvoices';
import BigCosts from './pages/Big/BigCosts';
import BigAR from './pages/Big/BigAR';

// Pabean Module
import PabeanDashboard from './pages/Pabean/PabeanDashboard';
import BarangMasuk from './pages/Pabean/BarangMasuk';
import BarangKeluar from './pages/Pabean/BarangKeluar';
import BarangReject from './pages/Pabean/BarangReject';
import PergerakanBarang from './pages/Pabean/PergerakanBarang';

function App() {
  // Test Supabase connection on app initialization
  useEffect(() => {
    const initSupabase = async () => {
      console.log('🚀 Bakhtera-1 Application Starting...');
      const status = getSupabaseStatus();
      console.log('📊 Supabase Status:', status);

      if (status.configured) {
        const result = await testSupabaseConnection();
        if (result.success) {
          console.log('✅ Supabase connection verified!');
        } else {
          console.error('❌ Supabase connection failed:', result.error);
        }
      } else {
        console.warn('⚠️ Supabase not configured. Check .env file.');
      }
    };

    initSupabase();
  }, []);
  return (
    <DataProvider>
      <Router>
        <MainLayout>
          <Routes>
            {/* Main Dashboard */}
            <Route path="/" element={<FreightDashboard />} />

            {/* Centralized Modules */}
            <Route path="/vendors" element={<VendorManagement />} />
            <Route path="/customers" element={<CustomerManagement />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/finance/coa" element={<COAMaster />} />
            <Route path="/settings" element={<CompanySettings />} />

            {/* Blink Module - Sales & Operations */}
            <Route path="/blink" element={<BlinkDashboard />} />
            <Route path="/blink/quotations" element={<QuotationManagement />} />
            <Route path="/blink/flow-monitor" element={<FlowMonitor />} />
            <Route path="/blink/sales-achievement" element={<SalesAchievement />} />
            <Route path="/blink/shipments" element={<ShipmentManagement />} />
            <Route path="/blink/operations/tracking" element={<TrackingMonitoring />} />
            <Route path="/blink/operations/awb" element={<AWBManagement />} />
            <Route path="/blink/operations/bl" element={<BLManagement />} />
            <Route path="/blink/master/routes" element={<MasterRoutes />} />

            {/* Blink Finance Module */}
            <Route path="/blink/finance/invoices" element={<InvoiceManagement />} />
            <Route path="/blink/finance/purchase-orders" element={<PurchaseOrder />} />
            <Route path="/blink/finance/general-journal" element={<GeneralJournal />} />
            <Route path="/blink/finance/general-ledger" element={<GeneralLedger />} />
            <Route path="/blink/finance/trial-balance" element={<TrialBalance />} />
            <Route path="/blink/finance/ar" element={<AccountsReceivable />} />
            <Route path="/blink/finance/ap" element={<AccountsPayable />} />
            <Route path="/blink/finance/profit-loss" element={<ProfitLoss />} />
            <Route path="/blink/finance/balance-sheet" element={<BalanceSheet />} />
            <Route path="/blink/sales-revenue" element={<SalesRevenue />} />

            {/* Legacy Blink Routes - Redirects */}
            <Route path="/blink/invoices" element={<InvoiceManagement />} />
            <Route path="/blink/finance/profit" element={<ProfitAnalysis />} />

            {/* Bridge Module */}
            <Route path="/bridge" element={<BridgeDashboard />} />
            <Route path="/bridge/bc-master" element={<BCMaster />} />
            <Route path="/bridge/item-master" element={<ItemMaster />} />
            <Route path="/bridge/pengajuan" element={<PengajuanManagement />} />
            <Route path="/bridge/finance" element={<BridgeFinance />} />
            <Route path="/bridge/goods-movement" element={<GoodsMovement />} />
            <Route path="/bridge/inventory" element={<WarehouseInventory />} />
            <Route path="/bridge/logger" element={<ActivityLogger />} />
            <Route path="/bridge/approvals" element={<ApprovalManager />} />

            {/* Big Module */}
            <Route path="/big" element={<BigDashboard />} />
            <Route path="/big/events" element={<EventManagement />} />
            <Route path="/big/quotations" element={<BigQuotations />} />
            <Route path="/big/invoices" element={<BigInvoices />} />
            <Route path="/big/costs" element={<BigCosts />} />
            <Route path="/big/ar" element={<BigAR />} />

            {/* Pabean Module */}
            <Route path="/pabean" element={<PabeanDashboard />} />
            <Route path="/pabean/barang-masuk" element={<BarangMasuk />} />
            <Route path="/pabean/barang-keluar" element={<BarangKeluar />} />
            <Route path="/pabean/barang-reject" element={<BarangReject />} />
            <Route path="/pabean/pergerakan" element={<PergerakanBarang />} />
          </Routes>
        </MainLayout>
      </Router>
    </DataProvider>
  );
}

export default App;
