

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © 2025 VERCEL. Deploy with confidence.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a
              href="#"
              className="hover:text-foreground transition-colors duration-200"
            >
              Privacy
            </a>
            <a
              href="#"
              className="hover:text-foreground transition-colors duration-200"
            >
              Terms
            </a>
            <a
              href="#"
              className="hover:text-foreground transition-colors duration-200"
            >
              Support
            </a>
            <a
              href="#"
              className="hover:text-foreground transition-colors duration-200"
            >
              Documentation
            </a>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-muted-foreground/70">
          From code to production in seconds. Zero configuration required.
        </div>
      </div>
    </footer>
  );
}