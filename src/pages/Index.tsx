// Update this page (the content is just a fallback if you fail to update the page)

import { Link } from 'react-router-dom';
import { Clock, BarChart3, Briefcase, Info } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Work Tracker
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track work sessions, manage jobs, and monitor progress with an easy-to-use dashboard system.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Link 
            to="/worker" 
            className="group block p-6 bg-card rounded-lg border hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Worker Dashboard</h3>
              <p className="text-muted-foreground">
                Check in, track time, and complete assigned jobs
              </p>
            </div>
          </Link>

          <Link 
            to="/parent" 
            className="group block p-6 bg-card rounded-lg border hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-success/10 rounded-full flex items-center justify-center group-hover:bg-success/20 transition-colors">
                <BarChart3 className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Parent Overview</h3>
              <p className="text-muted-foreground">
                View work history, track progress, and monitor activity
              </p>
            </div>
          </Link>

          <Link 
            to="/jobs" 
            className="group block p-6 bg-card rounded-lg border hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Briefcase className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Manage Jobs</h3>
              <p className="text-muted-foreground">
                Create, edit, and organize available work assignments
              </p>
            </div>
          </Link>
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
            <Info className="w-4 h-4" />
            Connect to Firebase to enable data persistence and real-time updates
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
