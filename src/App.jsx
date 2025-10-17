import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProjectsList from './components/ProjectsList';
import ProjectDetail from './components/ProjectDetail';
import TestPreview from './components/TestPreview';
import ProjectWizard from './components/ProjectWizard';
import TestWizard from './components/TestWizard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<ProjectsList />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/project/:id/test/:testId" element={<TestPreview />} />
          <Route path="/new-project" element={<ProjectWizard />} />
          <Route path="/test-wizard" element={<TestWizard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}