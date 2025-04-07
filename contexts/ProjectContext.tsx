import React, { createContext, useContext, useState, useEffect } from "react";
import { Project } from "@/types/project";
import { ProjectService } from "@/services/ProjectService";

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  loadProjects: () => Promise<void>;
  addProject: (
    projectData: Omit<Project, "id" | "createdAt" | "updatedAt">
  ) => Promise<Project>;
  updateProject: (project: Project) => Promise<Project>;
  deleteProject: (id: string) => Promise<boolean>;
  syncProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const localProjects = await ProjectService.getLocalProjects();
      setProjects(localProjects);
    } catch (err) {
      setError("Failed to load projects");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addProject = async (
    projectData: Omit<Project, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const newProject = await ProjectService.createProject(projectData);
      setProjects((prev) => [...prev, newProject]);
      return newProject;
    } catch (err) {
      setError("Failed to add project");
      console.error(err);
      throw err;
    }
  };

  const updateProject = async (project: Project) => {
    try {
      const updatedProject = await ProjectService.updateProject(project);
      setProjects((prev) =>
        prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
      );
      return updatedProject;
    } catch (err) {
      setError("Failed to update project");
      console.error(err);
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const result = await ProjectService.deleteProject(id);
      if (result) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
      return result;
    } catch (err) {
      setError("Failed to delete project");
      console.error(err);
      throw err;
    }
  };

  const syncProjects = async () => {
    try {
      setLoading(true);
      await ProjectService.syncProjects();
      await loadProjects(); // Reload after sync
    } catch (err) {
      setError("Failed to sync projects");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize projects
  useEffect(() => {
    loadProjects();

    // Initialize listeners for sync
    ProjectService.initListeners();

    // Sync on initial load
    syncProjects();
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        loading,
        error,
        loadProjects,
        addProject,
        updateProject,
        deleteProject,
        syncProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
};
