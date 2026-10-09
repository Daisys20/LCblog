import { Link, Route, Routes } from 'react-router-dom';

import Footer from './components/Footer';
import GridFlow from './components/GridFlow';
import Navbar from './components/Navbar';
import ScrollTopButton from './components/ScrollTopButton';
import AboutPage from './pages/AboutPage';
import ArchivePage from './pages/ArchivePage';
import HomePage from './pages/HomePage';
import JourneyPage from './pages/JourneyPage';
import LifePage from './pages/LifePage';
import PostPage from './pages/PostPage';
import ProfilePage from './pages/ProfilePage';
import ProjectsPage from './pages/ProjectsPage';
import TagsPage from './pages/TagsPage';

export default function App() {
  return (
    <>
      <GridFlow />
      <Navbar />
      <main className="site-main">
        <Routes>
          <Route path="/" element={<ProfilePage />} />
          <Route path="/blog" element={<HomePage />} />
          <Route path="/post/:slug" element={<PostPage />} />
          <Route path="/life" element={<LifePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/journey" element={<JourneyPage />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/tags" element={<TagsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route
            path="*"
            element={
              <div className="state-box">
                <p>页面不存在</p>
                <Link to="/" className="chip">
                  回到首页
                </Link>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
      <ScrollTopButton />
    </>
  );
}
