"use client"
import {
  Zap,
  Cat,
  Cloud,
  Globe,
  Shield,
  BarChart3,
  Rocket,
  GitBranch,
  Cpu,
  Server,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Footer } from "@/components/footer";

export default function Home() {
  const features = [
    {
      icon: <GitBranch className="w-8 h-8 text-deploy-blue" />,
      title: "GitHub Integration",
      description:
        "Connect your repositories and deploy directly from your favorite Git platform with automatic builds on every push.",
    },
    {
      icon: <Zap className="w-8 h-8 text-deploy-purple" />,
      title: "Lightning Fast Builds",
      description:
        "Powered by AWS ECS for scalable, containerized builds that complete in seconds, not minutes.",
    },
    {
      icon: <Globe className="w-8 h-8 text-deploy-blue" />,
      title: "Global CDN",
      description:
        "Static assets hosted on S3 with worldwide distribution for blazing fast load times anywhere.",
    },
    {
      icon: <Server className="w-8 h-8 text-deploy-purple" />,
      title: "Custom Domains",
      description:
        "Connect your own domains with SSL certificates automatically provisioned and managed.",
    },
    {
      icon: <Shield className="w-8 h-8 text-deploy-blue" />,
      title: "Secure by Default",
      description:
        "Enterprise-grade security with automatic HTTPS, DDoS protection, and secure environment variables.",
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-deploy-purple" />,
      title: "Real-time Analytics",
      description:
        "Monitor your deployments with detailed analytics, performance metrics, and build logs.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Hero Section */}
          <section className="text-center space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-deploy-blue/10 text-deploy-blue text-sm font-medium mb-4">
                <Rocket className="w-4 h-4 mr-2" />
                Now with zero-configuration deployments
              </div>

              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Deploy your projects
                <br />
                <span className="bg-gradient-to-r from-deploy-purple to-deploy-blue bg-clip-text text-transparent">
                  with zero configuration
                </span>
              </h1>

              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Connect your Git repository and deploy automatically. Get your
                projects live in seconds, not hours.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button className="bg-deploy-blue hover:bg-deploy-blue/90 px-8 py-3 text-lg h-auto rounded-xl">
                  Get Started Free
                </Button>
                <Button
                  variant="outline"
                  className="px-8 py-3 text-lg h-auto rounded-xl border-2"
                >
                  View Demo
                </Button>
              </div>
            </div>

            <div className="pt-10">
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 shadow-sm">
                <h2 className="text-3xl font-bold mb-6 text-slate-800">
                  Everything you need to deploy
                </h2>
                <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                  From code to production in seconds. Our platform handles the
                  complexity so you can focus on building.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-16 px-6 bg-gradient-to-b from-white to-slate-100/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to deploy, scale, and manage your applications
              with ease.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-slate-200/70 bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-300 group hover:border-deploy-blue/30 rounded-xl overflow-hidden"
              >
                <CardHeader className="pb-3">
                  <div className="w-14 h-14 rounded-xl bg-deploy-blue/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold text-slate-800">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-deploy-blue/5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-200">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
              Ready to deploy with zero configuration?
            </h2>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              Join thousands of developers who ship their projects faster with
              our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-deploy-purple hover:bg-deploy-purple/90 px-8 py-3 text-lg h-auto rounded-xl">
                Get Started for Free
              </Button>
              <Button
                variant="outline"
                className="px-8 py-3 text-lg h-auto rounded-xl border-2 text-slate-700"
              >
                Schedule a Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
