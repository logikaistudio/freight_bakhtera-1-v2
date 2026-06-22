import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data: inboundTransactions } = await supabase.from('freight_inbound').select('*');
  const { data: outboundTransactions } = await supabase.from('freight_outbound').select('*');
  const { data: mutationLogs } = await supabase.from('freight_mutation_logs').select('*');
  const outboundQuotations = []; // Assuming empty for this test

  // 3. From mutationLogs
  const secondaryOutbound = mutationLogs.filter(log => {
      const dest = (log.destination || '').toLowerCase();
      return dest && dest !== 'warehouse' && dest !== 'gudang' && dest !== 'gudang pabean';
  }).map(log => ({
      ...log,
      mutatedQty: Number(log.mutated_qty) || Number(log.mutatedQty) || 0,
      date: log.date || log.created_at,
      itemCode: log.item_code || log.itemCode,
      source: 'mutation_log'
  }));

  const allOutboundItems = [...secondaryOutbound];

  const allInboundItems = inboundTransactions.flatMap((t, tIdx) => {
      return t.items.map((item, itemIdx) => ({
          ...t,
          ...item,
          inboundId: t.id,
          itemCode: item.itemCode || item.item_code || item.code,
          originalQty: Number(item.quantity) || Number(item.qty) || 0,
      }));
  });

  const reconciliationData = allInboundItems.map(inbound => {
      const inboundPengajuan = inbound.pengajuanNumber || inbound.pengajuan_number;
      const inboundItemCode = (inbound.itemCode || '').trim().toLowerCase();

      const relatedOutbound = allOutboundItems.filter(outItem => {
          const outSourcePengajuan = outItem.sourcePengajuanNumber || outItem.source_pengajuan_number;
          const outPengajuan = outItem.pengajuanNumber || outItem.pengajuan_number;
          const matchPengajuan = outSourcePengajuan ? outSourcePengajuan === inboundPengajuan : outPengajuan === inboundPengajuan;
          
          const outItemCode = (outItem.itemCode || '').trim().toLowerCase();
          const matchCode = inboundItemCode && outItemCode && (outItemCode === inboundItemCode);

          return matchPengajuan && matchCode;
      });

      const totalOut = relatedOutbound.reduce((sum, item) => sum + (Number(item.mutatedQty) || 0), 0);

      return {
          itemCode: inbound.itemCode,
          qtyMasuk: inbound.originalQty,
          qtyKeluar: totalOut,
          qtySisa: inbound.originalQty - totalOut
      };
  });

  console.log(JSON.stringify(reconciliationData, null, 2));
}

test();
