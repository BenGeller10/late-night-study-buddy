import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, BookOpen, Plus, Search } from "lucide-react";

interface StudyMaterialsProps {
  user: any;
  onBack: () => void;
}

const StudyMaterials = ({ user, onBack }: StudyMaterialsProps) => {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/20 p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back
          </Button>
          <div>
            <h1 className="text-xl font-bold">Study Materials</h1>
            <p className="text-sm text-muted-foreground">
              Organize and share your study resources
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Welcome Card */}
        <Card className="glass-card border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-300">
              <BookOpen className="w-5 h-5" />
              Ready to get organized?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Upload and organize your study materials, notes, and resources. Share them with tutors and study groups to enhance your learning experience.
            </p>
            <div className="flex gap-2">
              <Button className="flex-1">
                <Upload className="w-4 h-4 mr-2" />
                Upload Materials
              </Button>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Create Folder
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload New Material
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="material-title">Title</Label>
              <Input
                id="material-title"
                placeholder="e.g., Calculus II - Chapter 5 Notes"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="material-description">Description</Label>
              <Textarea
                id="material-description"
                placeholder="Brief description of the material..."
                className="min-h-20"
              />
            </div>

            <div className="space-y-2">
              <Label>File Upload</Label>
              <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drop files here or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports PDF, DOC, DOCX, TXT files up to 10MB
                </p>
                <Button variant="outline" className="mt-4">
                  Choose Files
                </Button>
              </div>
            </div>

            <Button className="w-full">
              Upload Material
            </Button>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              My Materials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search your materials..."
                  className="pl-10"
                />
              </div>

              {/* Empty State */}
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="font-medium mb-2">No materials uploaded yet</h3>
                <p className="text-sm text-muted-foreground">
                  Start organizing your study materials by uploading your first file above.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon Features */}
        <Card className="glass-card border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-300">
              <span className="text-lg">🚀</span>
              Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span>Share materials with tutors during sessions</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span>Collaborate on shared study documents</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span>Auto-organize materials by subject</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span>AI-powered study material recommendations</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudyMaterials;