"use client";
import React, { useCallback, useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FolderOpen, GitBranch, ExternalLink, Clock, Plus } from "lucide-react";

function Page() {
  const [name, setName] = useState("");
  const [gitURL, setGitURL] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [projects, setProjects] = useState([]);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const { data } = await axios.get(
          `${API_URL}/user/getProjects`,
          {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          }
        );
        setProjects(data.projects || []);
      } catch (err) {
        console.error("Error fetching projects", err);
      }
    };

    fetchProjects();
  }, [success]);

  const handleCreateProject = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");
      setSuccess("");
      setLoading(true);

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const { data } = await axios.post(
          `${API_URL}/project`,
          { name, gitURL },
          {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          }
        );

        setSuccess("Project created successfully ");
        console.log(data)
        console.log("Project:", data.project);

        // reset form
        setName("");
        setGitURL("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to create project");
      } finally {
        setLoading(false);
      }
    },
    [name, gitURL]
  );

  // Format Git URL to display just the username/repo
  const formatGitURL = (url) => {
    try {
      const match = url.match(/github\.com\/([^/]+\/[^/]+?)(?:\.git)?$/);
      return match ? match[1] : url;
    } catch {
      return url;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Projects Dashboard
        </h1>
        <p className="text-slate-600 mb-8">Manage and deploy your projects</p>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side - Create Project */}
          <div className="w-full lg:w-1/3">
            <div className="p-6 bg-white rounded-2xl shadow-lg sticky top-6">
              <h2 className="text-xl font-bold text-center mb-6 flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Project
              </h2>

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deploy-blue focus:border-transparent"
                    placeholder="My Awesome Project"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Git Repository URL
                  </label>
                  <input
                    type="text"
                    value={gitURL}
                    onChange={(e) => setGitURL(e.target.value)}
                    required
                    placeholder="https://github.com/username/repository.git"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deploy-blue focus:border-transparent"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-deploy-purple to-deploy-blue hover:from-deploy-purple/90 hover:to-deploy-blue/90 text-white py-2.5"
                >
                  {loading ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FolderOpen className="w-4 h-4" />
                      Create Project
                    </>
                  )}
                </Button>
              </form>

              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                  {success}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Projects List */}
          <div className="flex-1">
            <div className="p-6 bg-white rounded-2xl shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">
                  Your Projects
                </h2>
                <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {projects.length}{" "}
                  {projects.length === 1 ? "project" : "projects"}
                </span>
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-600 mb-2">
                    No projects yet
                  </h3>
                  <p className="text-slate-500">
                    Create your first project to get started
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {projects.map((project) => (
                    <Link
                      href={`/deploy/${project.id}`}
                      key={project.id}
                      className="block group"
                    >
                      <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:border-deploy-blue/30 group-hover:scale-[1.02] h-full">
                        <div className="flex items-start justify-between mb-4">
                          <FolderOpen className="w-8 h-8 text-deploy-blue" />
                          <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-deploy-blue" />
                        </div>

                        <h3 className="text-lg font-semibold text-slate-800 mb-2 truncate">
                          {project.name}
                        </h3>

                        <div className="flex items-center text-slate-500 text-sm mb-4">
                          <GitBranch className="w-4 h-4 mr-1" />
                          <span className="truncate">
                            {formatGitURL(project.gitURL)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-xs text-slate-400">
                          <span>Click to deploy</span>
                          <span className="px-2 py-1 bg-slate-100 rounded-full">
                            ID: {project.id.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;