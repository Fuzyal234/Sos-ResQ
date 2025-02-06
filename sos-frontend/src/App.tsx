import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { CssBaseline } from "@mui/material"
import { ThemeProvider } from "@mui/material/styles"
import { useThemeContext } from "./contexts/ThemeContext"
import Layout from "./components/Layout"
import Home from "./pages/Home"
import About from "./pages/About"

function App() {
  const { theme } = useThemeContext()

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  )
}

export default App

