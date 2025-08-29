import { Outlet, useLocation } from 'react-router-dom'
import TabBar from './TabBar'
export default function Layout(){
  const { pathname } = useLocation()
  const showTabs = pathname !== '/'
  return (
    <div className="app">
      <header className="header"><div className="header-inner"><div className="logo" /><div className="title">Insight Hunter</div></div></header>
      <main className="main"><Outlet /></main>
      {showTabs && <TabBar />}
    </div>
  )
}
