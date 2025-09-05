"use client";
import axios from "axios";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Footer } from "@/components/footer";
import {
  Eye,
  EyeOff,
  User,
  Lock,
  Rocket,
  Github,
  Mail,
  Cloud,
} from "lucide-react";

function Auth() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.post(
        `${API_URL}/user/register`,
        { username, password },
        { withCredentials: true }
      );

      if (response.data.message === "User already exists") {
        setError("Username already exists");
      } else {
        localStorage.setItem("token", response.data.user.token);
        localStorage.setItem("authName", response.data.user.username);

        router.replace("/dashboard");
      }

      setUsername("");
      setPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.post(
        `${API_URL}/user/login`,
        { username, password },
        { withCredentials: true }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("authName", response.data.authName);
      router.push("/dashboard");

      setUsername("");
      setPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Signin failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-deploy-purple to-deploy-blue rounded-2xl shadow-lg mb-4">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Deploy your projects
            </h1>
            <p className="text-slate-600">
              Connect your Git repository and deploy automatically
            </p>
          </div>

          <Card className="shadow-xl border-slate-200">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl text-center text-slate-800">
                Welcome to VERCEL
              </CardTitle>
              <CardDescription className="text-center text-slate-500">
                Sign in or create an account to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue="login"
                className="w-full"
                onValueChange={setActiveTab}
              >
                <TabsList className="grid grid-cols-2 mb-6 bg-slate-100 p-1 rounded-lg">
                  <TabsTrigger
                    value="login"
                    className="data-[state=active]:bg-white data-[state=active]:text-deploy-blue data-[state=active]:shadow-sm rounded-md transition-all"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="data-[state=active]:bg-white data-[state=active]:text-deploy-blue data-[state=active]:shadow-sm rounded-md transition-all"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="login-username"
                        className="text-slate-700"
                      >
                        Username
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="login-username"
                          type="text"
                          placeholder="Enter your username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          className="pl-10 pr-4 py-2 rounded-lg border-slate-300 focus:ring-deploy-blue focus:border-deploy-blue"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="login-password"
                        className="text-slate-700"
                      >
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="pl-10 pr-12 py-2 rounded-lg border-slate-300 focus:ring-deploy-blue focus:border-deploy-blue"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    {error && (
                      <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
                        {error}
                      </div>
                    )}
                    <Button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-deploy-purple to-deploy-blue hover:from-deploy-purple/90 hover:to-deploy-blue/90 text-white py-2.5 rounded-lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Logging in...
                        </>
                      ) : (
                        <>
                          <Cloud className="w-4 h-4" />
                          Login to Dashboard
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-slate-500">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" type="button">
                    <Github className="w-4 h-4 mr-2" />
                    GitHub
                  </Button>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="signup-username"
                        className="text-slate-700"
                      >
                        Username
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="signup-username"
                          type="text"
                          placeholder="Choose a username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          className="pl-10 pr-4 py-2 rounded-lg border-slate-300 focus:ring-deploy-blue focus:border-deploy-blue"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="signup-password"
                        className="text-slate-700"
                      >
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="pl-10 pr-12 py-2 rounded-lg border-slate-300 focus:ring-deploy-blue focus:border-deploy-blue"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    {error && (
                      <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
                        {error}
                      </div>
                    )}
                    <Button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-deploy-purple to-deploy-blue hover:from-deploy-purple/90 hover:to-deploy-blue/90 text-white py-2.5 rounded-lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Creating account...
                        </>
                      ) : (
                        <>
                          <Rocket className="w-4 h-4" />
                          Create Account
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="text-xs text-slate-500 text-center mt-4">
                    By creating an account, you agree to our Terms of Service
                    and Privacy Policy.
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6 text-center text-sm text-slate-500 bg-slate-50 p-4 rounded-lg">
                From code to production in seconds. Our platform handles the
                complexity so you can focus on building.
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-6 text-sm text-slate-500">
            {activeTab === "login" ? (
              <p>
                Don't have an account?{" "}
                <button
                  onClick={() => setActiveTab("signup")}
                  className="text-deploy-blue hover:text-deploy-purple font-medium"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  onClick={() => setActiveTab("login")}
                  className="text-deploy-blue hover:text-deploy-purple font-medium"
                >
                  Login
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {/* Add custom colors if not in global CSS */}
      <style jsx global>{`
        :root {
          --deploy-blue: #2563eb;
          --deploy-purple: #7c3aed;
        }
      `}</style>
    </div>
  );
}

export default Auth;