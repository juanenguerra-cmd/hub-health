import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
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
  TrendingUp,
  Search,
  HelpCircle,
  Database,
  Printer,
  RefreshCw
} from 'lucide-react';

// FAQ Data
const faqData = [
  {
    category: 'Data & Backups',
    icon: Database,
    questions: [
      {
        q: 'Where is my data stored?',
        a: 'All data is stored locally in your browser using localStorage. This means your data stays on your computer and is not sent to any server. However, this also means if you clear your browser data or use a different browser/computer, your data will not be available.',
        tags: ['storage', 'local', 'browser', 'privacy']
      },
      {
        q: 'How do I backup my data?',
        a: 'Go to Settings and click "Export Backup" to download a JSON file containing all your data. Store this file safely. You can also configure automatic backup reminders to prompt you at regular intervals.',
        tags: ['backup', 'export', 'save', 'download']
      },
      {
        q: 'How do I restore from a backup?',
        a: 'Go to Settings and click "Import Backup", then select your previously exported JSON file. This will restore all your templates, sessions, actions, and education data. Note: Importing will merge with or replace existing data.',
        tags: ['restore', 'import', 'upload', 'recover']
      },
      {
        q: 'Will I lose data if I clear my browser cache?',
        a: 'Yes! Clearing browser data, cookies, or localStorage will delete all application data. Always export a backup before clearing browser data. We recommend setting up backup reminders in Settings.',
        tags: ['cache', 'clear', 'delete', 'lost']
      },
      {
        q: 'Can I use this on multiple computers?',
        a: 'Since data is stored locally, each computer/browser has its own separate data. To sync between devices, export a backup from one device and import it on another. There is no automatic cloud sync.',
        tags: ['sync', 'multiple', 'devices', 'computers', 'transfer']
      }
    ]
  },
  {
    category: 'Audits & Templates',
    icon: ClipboardCheck,
    questions: [
      {
        q: 'How do I create a custom audit template?',
        a: 'Go to Templates → Manage Templates and click "New Template". The wizard will guide you through setting the title, category, purpose, risk level, and adding questions with scoring options.',
        tags: ['create', 'custom', 'template', 'wizard', 'new']
      },
      {
        q: 'What are critical failure keys?',
        a: 'Critical failure keys are questions that, if failed, automatically fail the entire audit regardless of other scores. Use these for safety-critical items like patient identification or infection control practices.',
        tags: ['critical', 'failure', 'key', 'auto-fail', 'safety']
      },
      {
        q: 'How do I duplicate a template?',
        a: 'On the Manage Templates page, click the Copy icon on any template card. This creates a new template with "(Copy)" appended to the title and fresh version history starting at v1.0.0.',
        tags: ['duplicate', 'copy', 'clone', 'template']
      },
      {
        q: 'What does archiving a template do?',
        a: 'Archiving removes the template from the active list but preserves it for historical reference. Archived templates can still be viewed and their past audit sessions remain accessible. You can restore archived templates at any time.',
        tags: ['archive', 'delete', 'remove', 'restore', 'inactive']
      },
      {
        q: 'How is the compliance score calculated?',
        a: 'The compliance score is the percentage of points earned out of total possible points. Each question contributes its configured point value. N/A responses are excluded from the calculation. Critical failures override the score to 0%.',
        tags: ['score', 'calculate', 'compliance', 'percentage', 'points']
      }
    ]
  },
  {
    category: 'Printing & Reports',
    icon: Printer,
    questions: [
      {
        q: 'How do I print a pre-audit form for field use?',
        a: 'Open the template you want to audit, click the Print icon, and select "Pre-Audit Form". This generates a landscape grid with 5 sample columns, perfect for clipboard use during rounds.',
        tags: ['print', 'pre-audit', 'form', 'field', 'clipboard']
      },
      {
        q: 'How do I generate a post-audit report?',
        a: 'After completing an audit session, go to Sessions, open the completed audit, and click the Print/Report icon. This generates a detailed report showing all responses, scores, and identified issues.',
        tags: ['report', 'post-audit', 'results', 'print']
      },
      {
        q: 'Where can I find QAPI reports?',
        a: 'Go to Reports in the sidebar. You can generate QAPI Meeting Reports, Huddle Sheets, and Monthly Summaries. These aggregate data across your audits and QA actions for committee presentations.',
        tags: ['qapi', 'report', 'meeting', 'committee', 'summary']
      },
      {
        q: 'How do I print education sign-off sheets?',
        a: 'When viewing an education session, click the Sign-Off Sheet button. This generates a printable attendance sheet with spaces for staff names, signatures, and credentials.',
        tags: ['sign-off', 'attendance', 'education', 'signatures']
      }
    ]
  },
  {
    category: 'Education & Competencies',
    icon: GraduationCap,
    questions: [
      {
        q: 'How does competency recommendation work?',
        a: 'The system uses keyword matching from the MASTERED.IT competency library. When you enter findings or action descriptions, relevant clinical competencies are suggested based on matching keywords. Click a recommendation to link it.',
        tags: ['competency', 'recommendation', 'mastered', 'skills', 'matching']
      },
      {
        q: 'How do I add topics to my library?',
        a: 'Go to Education → Topic Library and click "Add Topic". Enter the topic title, description, F-Tag references, required evidence, and any trigger audits that should prompt this education.',
        tags: ['topic', 'library', 'add', 'education', 'f-tag']
      },
      {
        q: 'How do I track education session attendance?',
        a: 'When creating or editing an education session, add attendees in the Attendees section. You can mark attendance status (Present, Absent, Excused) and generate sign-off sheets for documentation.',
        tags: ['attendance', 'tracking', 'session', 'present', 'absent']
      },
      {
        q: 'What are trigger audits?',
        a: 'Trigger audits are audit templates linked to education topics. When an audit reveals issues, the system can suggest related education topics for staff training based on these links.',
        tags: ['trigger', 'audit', 'link', 'education', 'training']
      }
    ]
  },
  {
    category: 'QA Actions & Follow-Up',
    icon: AlertCircle,
    questions: [
      {
        q: 'How do I create a QA action from an audit?',
        a: 'After completing an audit with findings, you\'ll be prompted to create follow-up actions. Alternatively, go to QA Actions and click "New Action", then link it to the relevant audit session.',
        tags: ['create', 'action', 'audit', 'finding', 'qa']
      },
      {
        q: 'What do the priority levels mean?',
        a: 'Low: Minor issue, address within 30 days. Medium: Moderate concern, address within 14 days. High: Significant issue, address within 7 days. Critical: Immediate action required, address within 24-48 hours.',
        tags: ['priority', 'low', 'medium', 'high', 'critical', 'urgent']
      },
      {
        q: 'How do I close/resolve an action?',
        a: 'Open the action, update the status to "Resolved", and add resolution notes describing what was done. The resolution date is automatically recorded. Resolved actions remain visible for historical reference.',
        tags: ['close', 'resolve', 'complete', 'done', 'status']
      },
      {
        q: 'What appears in the Follow-Up Queue?',
        a: 'The Follow-Up Queue shows all items requiring attention: overdue QA actions, pending education sessions, orientation milestones due, and any other time-sensitive items across the system.',
        tags: ['follow-up', 'queue', 'overdue', 'pending', 'attention']
      }
    ]
  },
  {
    category: 'Troubleshooting',
    icon: RefreshCw,
    questions: [
      {
        q: 'The app is running slowly, what can I do?',
        a: 'Large amounts of data can slow performance. Try: 1) Export a backup and archive old completed audits. 2) Clear old resolved QA actions. 3) Refresh the browser. 4) Try a different browser like Chrome or Edge.',
        tags: ['slow', 'performance', 'speed', 'lag', 'freeze']
      },
      {
        q: 'My data seems to have disappeared!',
        a: 'First, check if you\'re using the same browser you normally use. Try refreshing the page. If data is still missing, check if you recently cleared browser data. If you have a backup file, you can restore from it in Settings.',
        tags: ['missing', 'disappeared', 'lost', 'gone', 'empty']
      },
      {
        q: 'Print preview doesn\'t look right',
        a: 'Ensure you\'re using a modern browser (Chrome recommended for printing). Check print settings for correct paper size and orientation. Disable "Headers and Footers" in print settings for cleaner output.',
        tags: ['print', 'preview', 'wrong', 'format', 'layout']
      },
      {
        q: 'How do I report a bug or request a feature?',
        a: 'Document the issue with steps to reproduce and any error messages. Feature requests and bug reports help improve the system. Contact your system administrator or IT support with detailed information.',
        tags: ['bug', 'report', 'feature', 'request', 'issue', 'help']
      }
    ]
  }
];

export function UserGuidePage() {
  const [activeTab, setActiveTab] = useState('getting-started');
  const [faqSearch, setFaqSearch] = useState('');

  // Filter FAQ based on search
  const filteredFaq = useMemo(() => {
    if (!faqSearch.trim()) return faqData;
    
    const searchLower = faqSearch.toLowerCase();
    return faqData.map(category => ({
      ...category,
      questions: category.questions.filter(q => 
        q.q.toLowerCase().includes(searchLower) ||
        q.a.toLowerCase().includes(searchLower) ||
        q.tags.some(tag => tag.includes(searchLower))
      )
    })).filter(category => category.questions.length > 0);
  }, [faqSearch]);

  const totalFaqResults = filteredFaq.reduce((acc, cat) => acc + cat.questions.length, 0);

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
        <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full">
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="competencies">Competencies</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
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

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Search for answers to common questions and troubleshooting tips
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search FAQs... (e.g., backup, template, print)"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {faqSearch && (
                <p className="text-sm text-muted-foreground">
                  Found {totalFaqResults} result{totalFaqResults !== 1 ? 's' : ''} for "{faqSearch}"
                </p>
              )}

              {/* FAQ Categories */}
              {filteredFaq.length > 0 ? (
                <div className="space-y-6">
                  {filteredFaq.map((category, catIdx) => (
                    <div key={catIdx} className="space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <category.icon className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">{category.category}</h3>
                        <Badge variant="secondary" className="ml-auto">
                          {category.questions.length}
                        </Badge>
                      </div>
                      
                      <Accordion type="single" collapsible className="w-full">
                        {category.questions.map((item, qIdx) => (
                          <AccordionItem key={qIdx} value={`${catIdx}-${qIdx}`}>
                            <AccordionTrigger className="text-left hover:no-underline">
                              <span className="flex items-start gap-2">
                                <HelpCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                                <span>{item.q}</span>
                              </span>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="pl-6 space-y-3">
                                <p className="text-muted-foreground leading-relaxed">
                                  {item.a}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {item.tags.map((tag, tagIdx) => (
                                    <Badge 
                                      key={tagIdx} 
                                      variant="outline" 
                                      className="text-xs cursor-pointer hover:bg-muted"
                                      onClick={() => setFaqSearch(tag)}
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No results found for "{faqSearch}"</p>
                  <p className="text-sm mt-2">Try different keywords or browse all categories</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setFaqSearch('')}
                  >
                    Clear Search
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
