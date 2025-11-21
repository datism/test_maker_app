import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProjectsList from './components/ProjectsList';
import ProjectDetail from './components/ProjectDetail';
import TestPreview from './components/TestPreview';
import ProjectWizard from './components/ProjectWizard';

export default function App() {
  return (
    <BrowserRouter basename='/tstiu/'>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<ProjectsList />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/project/:id/test/:testId" element={<TestPreview />} />
          <Route path="/project/:id/master-test-preview" element={<TestPreview />} />
          <Route path="/new-project" element={<ProjectWizard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}