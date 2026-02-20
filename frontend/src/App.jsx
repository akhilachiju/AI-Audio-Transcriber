import Header from './components/Header'
import Footer from './components/Footer'
import Home from './components/Home'

function App() {
  return (
    // Main layout with header, content, and footer
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <Home />
      <Footer />
    </div>
  )
}

export default App
