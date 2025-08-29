import { Link } from 'react-router-dom'
export default function App(){
  return (
    <div className="app">
      <header className="header"><div className="header-inner"><div className="logo" /><div className="title">Insight Hunter</div></div></header>
      <main className="main">
        <section className="panel" style={{textAlign:'center'}}>
          <h1 style={{marginTop:0}}>Auto‑CFO for everyone</h1>
          <p style={{opacity:.85}}>Upload CSVs, get clean reports, and see your forecast instantly.</p>
          <div style={{display:'flex',gap:12,justifyContent:'center',marginTop:16}}>
            <Link to="/dashboard" className="button">Open Dashboard</Link>
            <Link to="/forecast" className="button ghost">View Forecast</Link>
          </div>
        </section>
      </main>
    </div>
  )
}
