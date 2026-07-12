import { Routes, Route } from "react-router-dom";
import SiteLayout from "./components/layout/SiteLayout";
import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import InteractivePortfolio from "./pages/InteractivePortfolio";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Sanjussai from "./pages/Sanjussai";
import ProjectDetail from "./pages/ProjectDetail";

function App() {
    return (
        <Routes>
            <Route path="/" element={<SiteLayout />}>
                <Route index element={<Home />} />
                <Route path="portfolio" element={<Portfolio />} />
                <Route path="interactive-portfolio" element={<InteractivePortfolio />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="sanjussai" element={<Sanjussai />} />
                <Route path="projects/:slug" element={<ProjectDetail />} />
            </Route>
        </Routes>
    );
}

export default App;