const Chat = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/20">
        <div className="p-4">
          <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Messages 💬
          </h1>
          <p className="text-sm text-muted-foreground">
            Chat with your tutors and study groups
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <span className="text-6xl">💬</span>
          <h3 className="text-xl font-semibold">Messages Coming Soon!</h3>
          <p className="text-muted-foreground">
            GroupMe-style chat with your tutors and study groups. Real-time messaging, file sharing, and more.
          </p>
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground">
              🚀 This feature is in development and will launch soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;