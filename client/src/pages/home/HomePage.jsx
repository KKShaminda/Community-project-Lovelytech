import { Footer } from '../../components/Footer'
import { Navbar } from '../../components/Navbar'

export function HomePage() {
  return (
    <div className="min-h-screen bg-[#ffffff] text-black flex flex-col">
      <Navbar />
      <main className="flex-1" />
      <Footer />
    </div>
  )
}

export default HomePage