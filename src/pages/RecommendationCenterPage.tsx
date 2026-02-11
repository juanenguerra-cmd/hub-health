import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { recommendationPreviews, recommendationRules } from '@/lib/recommendation-rules';

export function RecommendationCenterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Recommended Competency</h1>
        <p className="text-sm text-muted-foreground">
          Prepare your QI workflow to recommend competencies and in-services without owning corporate LMS data.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Recommended Competencies (Preview)</CardTitle>
          <CardDescription>
            These are generated from audit findings and trends. Use them to select matching corporate modules.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          {recommendationPreviews.map((rec) => (
            <div key={rec.id} className="rounded-lg border border-border p-4 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Issue • {rec.unit}</p>
                <p className="font-semibold">{rec.issue}</p>
                <p className="text-sm text-muted-foreground">{rec.trend}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Competencies</p>
                <div className="flex flex-wrap gap-2">
                  {rec.recommendedCompetencies.map((item) => (
                    <Badge key={item} variant="secondary">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">In-service</p>
                <ul className="list-disc pl-5 text-sm text-foreground">
                  {rec.recommendedInservices.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <p className="text-xs text-muted-foreground">Follow-up: {rec.followUpPlan}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommendation Engine Rules</CardTitle>
          <CardDescription>
            Use these rules to map audit or event trends to competency domains, in-service topics, and re-audit plans.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendationRules.map((rule, index) => (
            <div key={rule.id} className="space-y-3 rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">Rule {index + 1}</Badge>
                <p className="text-sm font-semibold">{rule.trigger}</p>
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Competencies</p>
                  <ul className="list-disc pl-5 text-sm">
                    {rule.competencyDomains.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">In-service</p>
                  <p className="text-sm">{rule.inserviceTitle}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Follow-up</p>
                  <p className="text-sm">{rule.followUp}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Search Tags</p>
                <div className="flex flex-wrap gap-2">
                  {rule.searchTags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>In-service Builder Output</CardTitle>
          <CardDescription>
            Standardize your in-service templates so you can plug in corporate modules or deliver quick huddles.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-border p-4 space-y-2">
            <p className="text-sm font-semibold">Template Fields</p>
            <Separator />
            <ul className="list-disc pl-5 text-sm text-muted-foreground">
              <li>Title, why now, and audience</li>
              <li>Duration and objectives</li>
              <li>Key points and return-demo expectations</li>
              <li>Re-audit measure and due date</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border p-4 space-y-2">
            <p className="text-sm font-semibold">Corporate Mapping Notes</p>
            <Separator />
            <ul className="list-disc pl-5 text-sm text-muted-foreground">
              <li>Map competency domains to corporate catalog entries</li>
              <li>Store only the selected module or competency reference</li>
              <li>Keep performance detail in corporate LMS, not here</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
