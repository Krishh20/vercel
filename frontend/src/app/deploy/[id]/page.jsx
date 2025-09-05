"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  FolderOpen,
  GitBranch,
  ExternalLink,
  Clock,
  Rocket,
  Globe,
  FileText,
} from "lucide-react";

export default function DeployPage() {
  const { id } = useParams(); // projectId from URL
  const [project, setProject] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deploymentId, setDeploymentId] = useState(null);
  const [error, setError] = useState(null);
  const [isDeployed, setIsDeployed] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const { data } = await axios.get(`${API_URL}/user/getProjects`, {
          headers: { Authorization: localStorage.getItem("token") },
        });

        const found = data.projects.find((p) => p.id === id);
        setProject(found);
      } catch (err) {
        console.error("Error fetching project", err);
      }
    };
    fetchProject();
  }, [id]);

  // Fetch logs (polling with deploymentId)
  useEffect(() => {
    if (!deploymentId) return;

    const interval = setInterval(async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const { data } = await axios.get(
          `${API_URL}/project/logs/${deploymentId}`,
          {
            headers: { Authorization: localStorage.getItem("token") },
          }
        );

        const newLogs = data.logs || [];
        setLogs(newLogs);

        const isComplete = newLogs.some((log) =>
          log.log.includes("All files uploaded successfully")
        );

        if (isComplete) {
          setIsDeployed(true);
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Error fetching logs", err);
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [deploymentId]);

  // Deploy handler
  const handleDeploy = async () => {
    setLoading(true);
    setError(null);
    setIsDeployed(false);
    setLogs([]);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/project/deploy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({ projectId: id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Deployment failed");
      }

      setDeploymentId(data.deploymentId);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-12 h-12 text-slate-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading project details...</p>
        </div>
      </div>
    );
  }

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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Deploy Project
          </h1>
          <p className="text-slate-600">
            Deploy your project to the cloud with one click
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left - Project Details and Controls */}
          <div className="w-full lg:w-1/3">
            <div className="p-6 bg-white rounded-2xl shadow-lg sticky top-6">
              <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Project Details
              </h2>

              {/* Project Info Card */}
              <div className="mb-6 p-5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-deploy-purple to-deploy-blue rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 truncate">
                    {project.name}
                  </h3>
                </div>

                <div className="flex items-center text-slate-600 text-sm mb-3">
                  <GitBranch className="w-4 h-4 mr-2" />
                  <span className="truncate">
                    {formatGitURL(project.gitURL)}
                  </span>
                </div>

                <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full inline-block">
                  ID: {project.id.slice(0, 8)}...
                </div>
              </div>

              <Button
                onClick={handleDeploy}
                disabled={loading || isDeployed}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-deploy-purple to-deploy-blue hover:from-deploy-purple/90 hover:to-deploy-blue/90 text-white py-2.5 text-lg rounded-xl"
              >
                {loading ? (
                  <>
                    <Clock className="w-5 h-5 animate-spin" />
                    Deploying...
                  </>
                ) : isDeployed ? (
                  <>
                    <Globe className="w-5 h-5" />
                    Deployed Successfully
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5" />
                    Deploy Project
                  </>
                )}
              </Button>

              {/* Status Messages */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
                  {error}
                </div>
              )}

              {deploymentId && !isDeployed && (
                <div className="mt-4 p-3 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 animate-pulse" />
                  Deployment in progress...
                </div>
              )}

              {isDeployed && project.subDomain && (
                <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <Globe className="w-3 h-3 text-green-600" />
                    </div>
                    <p className="font-semibold">Your project is live!</p>
                  </div>
                  <a
                    href={`http://${project.subDomain}.${API_URL}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Live Project
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Right - Logs */}
          <div className="flex-1">
            <div className="p-6 bg-white rounded-2xl shadow-lg h-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Deployment Logs
                </h2>
                {logs.length > 0 && (
                  <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {logs.length} log entries
                  </span>
                )}
              </div>

              {logs.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p>No logs yet. Deploy your project to see logs here.</p>
                </div>
              ) : (
                <div className="space-y-3 font-mono text-sm bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-[600px] overflow-y-auto">
                  {logs.map((log, i) => (
                    <div
                      key={i}
                      className="pb-2 border-b border-slate-200 last:border-b-0"
                    >
                      <span className="text-slate-500 text-xs">
                        [{new Date(log.timestamp).toLocaleTimeString()}]
                      </span>{" "}
                      <span
                        className={
                          log.log.includes("ERROR")
                            ? "text-red-600"
                            : log.log.includes("SUCCESS")
                            ? "text-green-600"
                            : "text-slate-700"
                        }
                      >
                        {log.log}
                      </span>
                    </div>
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