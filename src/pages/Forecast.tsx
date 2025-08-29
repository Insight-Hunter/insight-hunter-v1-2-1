import { useEffect, useMemo, useState } from 'react'
import { getJSON } from '@/lib/api'
type Row = { month: string; cashIn: number; cashOut: number; netCash: number; eomBalance: number }
export default function Forecast(){
  const [rows, setRows] = useState<Row[] | null>(null)
  const [err, setErr] = useState<string | null>(null)
  useEffect(()=>{ getJSON<Row[]>('/api/demo/forecast').then(setRows).catch(e=>setErr(String(e))) },[])
  const totals = useMemo(()=>{ if(!rows) return null; return rows.reduce((acc,r)=>({
    cashIn: acc.cashIn + r.cashIn, cashOut: acc.cashOut + r.cashOut, netCash: acc.netCash + r.netCash, eomBalance: r.eomBalance
  }),{cashIn:0,cashOut:0,netCash:0,eomBalance:0}) },[rows])
  return (
    <div className="panel">
      <h2 style={{marginTop:0}}>Forecast</h2>
      {err && <div style={{color:'var(--bad)'}}>Error: {err}</div>}
      {!rows && !err && <div>Loading…</div>}
      {rows && (
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{color:'var(--muted)',fontSize:13}}>
                <th align="left">Month</th>
                <th align="right">Cash In</th>
                <th align="right">Cash Out</th>
                <th align="right">Net Cash</th>
                <th align="right">EoM Balance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r=> (
                <tr key={r.month}>
                  <td>{r.month}</td>
                  <td align="right">${r.cashIn.toLocaleString()}</td>
                  <td align="right">${r.cashOut.toLocaleString()}</td>
                  <td align="right" style={{color:r.netCash>=0?'var(--ok)':'var(--bad)'}}>{r.netCash>=0?'+':''}${r.netCash.toLocaleString()}</td>
                  <td align="right">${r.eomBalance.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            {totals && (
              <tfoot>
                <tr>
                  <td style={{fontWeight:700}}>Totals</td>
                  <td align="right" style={{fontWeight:700}}>${totals.cashIn.toLocaleString()}</td>
                  <td align="right" style={{fontWeight:700}}>${totals.cashOut.toLocaleString()}</td>
                  <td align="right" style={{fontWeight:700,color:totals.netCash>=0?'var(--ok)':'var(--bad)'}}>{totals.netCash>=0?'+':''}${totals.netCash.toLocaleString()}</td>
                  <td align="right" style={{fontWeight:700}}>${totals.eomBalance.toLocaleString()}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  )
}
