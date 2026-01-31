import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  BookOpen,
  Users,
  FileText,
  BarChart3,
  Sparkles,
  ClipboardCheck,
  GraduationCap,
  AlertCircle,
  Calendar,
  Settings,
  Inbox,
  History,
  Download,
  Upload,
  Lightbulb,
  Target,
  CheckCircle2,
  ArrowRight,
  Zap,
  Shield,
  TrendingUp
} from 'lucide-react';

export function UserGuidePage() {
  const [activeTab, setActiveTab] = useState('getting-started');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">User Guide & Documentation</h1>
          <p className="text-muted-foreground">
            Learn how to use the Nurse Educator Suite effectively
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="competencies">Competencies</TabsTrigger>
          <TabsTrigger value="release-notes">Release Notes</TabsTrigger>
        </TabsList>

        {/* Getting Started Tab */}
        <TabsContent value="getting-started" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Welcome to Nurse Educator Suite
              </CardTitle>
              <CardDescription>
                Your comprehensive tool for audit management, staff education, and quality assurance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg bg-muted/30">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Primary Purpose
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    This suite helps Nurse Educators manage clinical audits, track staff education, 
                    monitor quality action plans, and maintain survey readiness documentation.
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-muted/30">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Data Storage
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    All data is stored locally in your browser. Use the backup feature regularly 
                    to export your data and prevent loss.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Quick Start Guide</h3>
                <div className="space-y-3">
                  {[
                    { step: 1, title: 'Configure Your Facility', desc: 'Go to Settings to set your facility name and logo' },
                    { step: 2, title: 'Explore Audit Templates', desc: 'Browse pre-built templates or create custom ones' },
                    { step: 3, title: 'Run Your First Audit', desc: 'Select a template and start a new audit session' },
                    { step: 4, title: 'Track Education', desc: 'Plan inservices and track staff attendance' },
                    { step: 5, title: 'Generate Reports', desc: 'Create compliance reports for QAPI meetings' },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-4 p-3 border rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Navigation Overview</CardTitle>
              <CardDescription>Where to find each feature in the sidebar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { icon: ClipboardCheck, label: 'Audit Templates', desc: 'Browse, create, and manage audit forms' },
                  { icon: FileText, label: 'Audit Sessions', desc: 'View completed audits and results' },
                  { icon: AlertCircle, label: 'QA Actions', desc: 'Track quality action plans and follow-ups' },
                  { icon: GraduationCap, label: 'Education', desc: 'Plan and track staff inservices' },
                  { icon: BookOpen, label: 'Topic Library', desc: 'Manage educational topics and evidence' },
                  { icon: Users, label: 'Orientation', desc: 'Track new hire onboarding progress' },
                  { icon: Inbox, label: 'Follow-Up Queue', desc: 'View items requiring attention' },
                  { icon: BarChart3, label: 'Analytics+', desc: 'Compliance trends and heatmaps' },
                  { icon: Calendar, label: 'Calendar', desc: 'View scheduled activities' },
                  { icon: FileText, label: 'Reports', desc: 'Generate printable reports' },
                  { icon: Settings, label: 'Settings', desc: 'Configure facility info and backups' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                    <item.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Capabilities Tab */}
        <TabsContent value="capabilities" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Audit Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-primary" />
                  Audit Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>Pre-built templates for common clinical audits (Falls, Infection Control, Skin, Medication, etc.)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>Custom template creation wizard with scoring configuration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>Template versioning and change history tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>Pre-audit print forms for field auditing (landscape 5-sample grid)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>Post-audit reports with pass/fail scoring and critical failures</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>Duplicate templates to create variants with fresh version history</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Education Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  Education Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>Plan and schedule staff inservices with topic integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>Track attendance with printable sign-off sheets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>Education Topic Library with F-Tag and regulation references</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>Link trigger audits and required evidence artifacts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>Month/year filtering for session history</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* QA Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  Quality Action Plans
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>Create action plans from audit findings or independently</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>Track status: Open, In Progress, Resolved, Overdue</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>Assign owners and due dates for accountability</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>Priority levels (Low, Medium, High, Critical)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>Resolution notes for documentation</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Staff Orientation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Staff Orientation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>Track new hire onboarding with 30/60/90-day checkpoints</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>Department and position tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>KPIs for active orientees and overdue milestones</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>Status indicators: Active, Completed, On Hold</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Analytics & Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>Tool-by-Unit compliance heatmaps</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>Recurring issue identification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>Time-to-close distribution metrics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>Owner accountability tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>Trend analysis over time</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-primary" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>Full backup export to JSON file</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>Import backup to restore data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>Backup reminder banner with configurable frequency</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>CSV export for education topics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>Browser close warning when data exists</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Available Reports & Where to Find Them
              </CardTitle>
              <CardDescription>
                Generate professional documentation for QAPI meetings and survey readiness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="qapi">
                  <AccordionTrigger>
                    <span className="flex items-center gap-2">
                      <Badge variant="secondary">Reports Page</Badge>
                      QAPI Summary Report
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-sm">
                    <p>Comprehensive quality assurance summary for QAPI committee meetings.</p>
                    <p className="text-muted-foreground">
                      <strong>Location:</strong> Sidebar → Reports → QAPI Summary
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Includes:</strong> Audit compliance rates, open QA actions, education completion stats
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="huddle">
                  <AccordionTrigger>
                    <span className="flex items-center gap-2">
                      <Badge variant="secondary">Reports Page</Badge>
                      Huddle Report
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-sm">
                    <p>Quick summary for daily/weekly staff huddles.</p>
                    <p className="text-muted-foreground">
                      <strong>Location:</strong> Sidebar → Reports → Huddle Report
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Includes:</strong> Key metrics, overdue items, upcoming education
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="action-packet">
                  <AccordionTrigger>
                    <span className="flex items-center gap-2">
                      <Badge variant="secondary">Reports Page</Badge>
                      Action Plan Packet
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-sm">
                    <p>Detailed documentation of all quality action plans.</p>
                    <p className="text-muted-foreground">
                      <strong>Location:</strong> Sidebar → Reports → Action Plan Packet
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Includes:</strong> All QA actions with status, owners, and resolution notes
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="pre-audit">
                  <AccordionTrigger>
                    <span className="flex items-center gap-2">
                      <Badge variant="outline">Templates Page</Badge>
                      Pre-Audit Print Form
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-sm">
                    <p>Printable form for manual field auditing with landscape 5-sample scoring grid.</p>
                    <p className="text-muted-foreground">
                      <strong>Location:</strong> Sidebar → Audit Templates → Select template → "Pre-Audit Print"
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Use:</strong> Print blank forms, conduct audits on the floor, then enter results digitally
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="post-audit">
                  <AccordionTrigger>
                    <span className="flex items-center gap-2">
                      <Badge variant="outline">Sessions Page</Badge>
                      Post-Audit Report
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-sm">
                    <p>Results report from completed audit sessions with pass/fail scoring.</p>
                    <p className="text-muted-foreground">
                      <strong>Location:</strong> Sidebar → Audit Sessions → View session → "Print Report"
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Includes:</strong> Scores by question, critical failures, recommendations
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="signoff">
                  <AccordionTrigger>
                    <span className="flex items-center gap-2">
                      <Badge variant="outline">Education Page</Badge>
                      Education Sign-Off Sheet
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-sm">
                    <p>Printable attendance sign-off sheet for inservice sessions.</p>
                    <p className="text-muted-foreground">
                      <strong>Location:</strong> Sidebar → Education → View session → "Sign-Off Sheet"
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Use:</strong> Print before session, collect signatures, file for survey readiness
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="csv">
                  <AccordionTrigger>
                    <span className="flex items-center gap-2">
                      <Badge variant="outline">Topic Library</Badge>
                      CSV Export
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-sm">
                    <p>Export education topics to spreadsheet format.</p>
                    <p className="text-muted-foreground">
                      <strong>Location:</strong> Sidebar → Topic Library → Export CSV button
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Use:</strong> Data portability, external analysis, backup
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Competencies Tab */}
        <TabsContent value="competencies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Competency Recommendations
              </CardTitle>
              <CardDescription>
                How to use the MASTERED.IT competency library for staff skill validation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border rounded-lg bg-primary/5 border-primary/20">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  What is the Competency Library?
                </h3>
                <p className="text-sm text-muted-foreground">
                  The system includes the <strong>MASTERED.IT library</strong> of over 160 clinical competency skills. 
                  When you create QA findings or education topics, the system automatically suggests relevant 
                  competencies based on keyword matching, helping you document staff skill validation as evidence 
                  for survey readiness.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">How It Works</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Keyword-Based Matching</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        When you enter a finding or topic (e.g., "fall prevention" or "blood pressure monitoring"), 
                        the system scans keywords in the competency library to find relevant skills.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Automatic Suggestions</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Matching competencies appear as suggestions. Each shows the skill code, title, 
                        applicable disciplines (CNA, Nurse, etc.), and platform (Mastered vs. Custom).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Link to Evidence</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Select relevant competencies to link them to your QA action or education topic. 
                        This creates documentation showing what skills were validated as part of your 
                        corrective action or training.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold">4</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Survey Readiness</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Linked competencies serve as evidence that staff have been properly trained 
                        and validated on relevant skills—critical for survey preparedness.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Where to Find Competency Recommendations</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-primary" />
                      QA Actions
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      When creating or editing a QA action, look for the "Suggested Competencies" 
                      section based on your finding description.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      Topic Library
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Education topics can be linked to competencies as part of the 
                      "Required Evidence Artifacts" for survey documentation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-muted/30">
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Pro Tip
                </h4>
                <p className="text-sm text-muted-foreground">
                  Be specific in your finding descriptions to get better competency matches. 
                  For example, "blood pressure measurement technique" will match more precisely 
                  than just "vital signs."
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Release Notes Tab */}
        <TabsContent value="release-notes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Release Notes & Milestones
              </CardTitle>
              <CardDescription>
                Track the evolution of the Nurse Educator Suite
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-6">
                  {/* Current Release */}
                  <div className="border-l-4 border-primary pl-4 pb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-primary">Current</Badge>
                      <span className="font-bold">v2.0 – Template & Competency Update</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">January 2026</p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Zap className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                        <span><strong>Template Creation Wizard:</strong> Build custom audit templates with a 4-step guided process</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Zap className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                        <span><strong>Template Duplication:</strong> Clone existing templates with fresh version history</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Zap className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                        <span><strong>Competency Library:</strong> 160+ MASTERED.IT skills with keyword matching</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Zap className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                        <span><strong>User Guide:</strong> In-app documentation and help system</span>
                      </li>
                    </ul>
                  </div>

                  {/* Previous Releases */}
                  <div className="border-l-4 border-muted-foreground/30 pl-4 pb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">v1.8</Badge>
                      <span className="font-bold">Analytics Enhancement</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">December 2025</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Tool-by-Unit compliance heatmaps</li>
                      <li>• Recurring issue identification</li>
                      <li>• Time-to-close distribution metrics</li>
                      <li>• Owner accountability tracking</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-muted-foreground/30 pl-4 pb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">v1.6</Badge>
                      <span className="font-bold">Education Topic Library</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">November 2025</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Centralized topic management with version control</li>
                      <li>• Trigger audit linking</li>
                      <li>• Evidence artifact documentation</li>
                      <li>• F-Tag and regulation references</li>
                      <li>• CSV import/export</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-muted-foreground/30 pl-4 pb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">v1.4</Badge>
                      <span className="font-bold">Print Documentation</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">October 2025</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Pre-audit print forms (landscape 5-sample grid)</li>
                      <li>• Post-audit result reports</li>
                      <li>• Education sign-off sheets</li>
                      <li>• Print optimization (header repeat, no row splitting)</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-muted-foreground/30 pl-4 pb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">v1.2</Badge>
                      <span className="font-bold">Staff Orientation</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">September 2025</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• 30/60/90-day checkpoint tracking</li>
                      <li>• Department and position management</li>
                      <li>• Retention milestone KPIs</li>
                      <li>• Overdue milestone alerts</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-muted-foreground/30 pl-4 pb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">v1.0</Badge>
                      <span className="font-bold">Initial Release</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">August 2025</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Core audit template system</li>
                      <li>• Audit session management</li>
                      <li>• QA action tracking</li>
                      <li>• Education scheduling</li>
                      <li>• Dashboard KPIs</li>
                      <li>• Backup/restore functionality</li>
                    </ul>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
