import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, Play, Eye, Settings2 } from 'lucide-react';

export function TemplatesPage() {
  const { templates } = useApp();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Templates</h1>
          <p className="text-muted-foreground">Survey-ready audit tools with CMS F-tags and NYDOH references</p>
        </div>
        <Button className="gap-2">
          <Settings2 className="w-4 h-4" />
          Manage Templates
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((tpl) => (
          <Card key={tpl.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <ClipboardCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{tpl.title}</CardTitle>
                    <CardDescription className="mt-1">
                      v{tpl.version} • {tpl.category}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {tpl.passingThreshold}% threshold
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {tpl.purpose.summary}
              </p>
              
              <div className="flex flex-wrap gap-1.5 mb-4">
                {tpl.ftagTags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    CMS {tag}
                  </Badge>
                ))}
                {tpl.nydohTags.slice(0, 1).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    NYDOH
                  </Badge>
                ))}
                {tpl.placementTags.slice(0, 2).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1 gap-2">
                  <Play className="w-4 h-4" />
                  Run Audit
                </Button>
                <Button size="sm" variant="outline" className="gap-2">
                  <Eye className="w-4 h-4" />
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
