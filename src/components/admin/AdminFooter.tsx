export function AdminFooter() {
  return (
    <footer className="border-t bg-background px-6 py-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>&copy; 2025 Customer Support AI. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Support</a>
        </div>
      </div>
    </footer>
  );
}