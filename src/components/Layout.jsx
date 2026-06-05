import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import ToastContainer from './ToastContainer'

export default function Layout() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Outlet />
      </main>
      <ToastContainer />
    </>
  )
}
