import { useMemo, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ReferenceRecord = {
  title: string;
  tags: string[];
  explanation: string;
  expectation: string;
  lookingFor: string;
  artifacts: string;
  auditMap: string;
};

const referenceLibrary: ReferenceRecord[] = [
  {
    title: 'CMS 42 CFR 483.80 Infection Prevention & Control Program',
    tags: ['CMS', 'SNF', 'LTC', 'F880', 'IPCP'],
    explanation: 'Sets infection prevention standards, risk assessments, surveillance, and outbreak response for SNFs.',
    expectation: 'Maintain an IPCP, implement surveillance, and document interventions for risks and outbreaks.',
    lookingFor: 'IP risk assessment, surveillance logs, isolation workflows, and staff competency checks.',
    artifacts: 'IP plan, surveillance reports, PPE audits, isolation signage photos.',
    auditMap: 'Hand Hygiene Observation, PPE Compliance, Outbreak Readiness, Environmental Cleaning.',
  },
  {
    title: 'CMS Appendix PP (State Operations Manual) - Surveyor Guidance',
    tags: ['CMS', 'SOM', 'Survey', 'SNF', 'LTC'],
    explanation: 'Interpretive guidance and procedures for surveyors inspecting LTC facilities.',
    expectation: 'Policies align with F-tags and staff demonstrate consistent practice.',
    lookingFor: 'Policy alignment, staff interviews, documentation consistency, and corrective action loops.',
    artifacts: 'Policies, training logs, QA action plans, audit results.',
    auditMap: 'All audits with evidence-to-show and corrective action documentation.',
  },
  {
    title: 'CMS 42 CFR 483.25 Quality of Care',
    tags: ['CMS', 'Quality', 'SNF', 'LTC'],
    explanation: 'Requires appropriate care and services to meet resident needs and prevent avoidable decline.',
    expectation: 'Care plans drive services and monitoring; adverse events trigger review and changes.',
    lookingFor: 'Care plan adherence, ADL support, incident follow-up, clinical monitoring.',
    artifacts: 'Care plans, ADL support logs, incident investigations, reassessments.',
    auditMap: 'Care Plan Audit, ADL Care Audit, Incident Reporting Audit.',
  },
  {
    title: 'CMS 42 CFR 483.10 Resident Rights',
    tags: ['CMS', 'Resident Rights', 'SNF', 'LTC'],
    explanation: 'Defines resident choice, dignity, privacy, and participation in care decisions.',
    expectation: 'Residents are informed, choices honored, and preferences documented.',
    lookingFor: 'Preference documentation, advance directives, meal timing, grooming choices.',
    artifacts: 'Resident interviews, preference records, advance directive documentation.',
    auditMap: 'Resident Rights & Preferences Audit.',
  },
  {
    title: 'CMS 42 CFR 483.12 Freedom from Abuse, Neglect, and Exploitation',
    tags: ['CMS', 'Abuse Prevention', 'SNF', 'LTC', 'F600'],
    explanation: 'Mandates prevention, reporting, and investigation of abuse or neglect.',
    expectation: 'Timely reporting, thorough investigations, and protective interventions.',
    lookingFor: 'Abuse prevention training, reporting timelines, investigation files.',
    artifacts: 'Incident reports, investigation summaries, staff training records.',
    auditMap: 'Abuse Prevention Audit, Incident Reporting Audit.',
  },
  {
    title: 'CMS 42 CFR 483.45 Pharmacy Services & Medication Management',
    tags: ['CMS', 'Medication', 'SNF', 'LTC', 'F-tag'],
    explanation: 'Establishes medication storage, labeling, and pharmacological review expectations.',
    expectation: 'Medications stored and labeled correctly; GDR and pharmacist reviews documented.',
    lookingFor: 'Medication storage audits, labeling checks, psychotropic review notes.',
    artifacts: 'Medication room audits, IV labeling audits, GDR documentation.',
    auditMap: 'IV Labeling Audit, Psychotropic GDR Audit.',
  },
  {
    title: 'CMS 42 CFR 483.60 Food and Nutrition Services',
    tags: ['CMS', 'Food Safety', 'SNF', 'LTC'],
    explanation: 'Requires safe food handling, palatable meals, and resident choice in dining.',
    expectation: 'Food temperatures and storage comply with policy; residents receive meals on time.',
    lookingFor: 'Temperature logs, storage audits, meal service timing checks.',
    artifacts: 'Temperature logs, food storage photos, resident feedback notes.',
    auditMap: 'Food Safety Audit, Resident Rights & Preferences Audit.',
  },
  {
    title: 'CMS 42 CFR 483.75 QAPI Program',
    tags: ['CMS', 'QAPI', 'SNF', 'LTC'],
    explanation: 'Requires a data-driven QAPI program with performance improvement projects.',
    expectation: 'Routine monitoring, targeted PIPs, and corrective actions tied to findings.',
    lookingFor: 'QAPI minutes, trend analyses, audit-driven action plans.',
    artifacts: 'QAPI meeting reports, dashboards, action plan tracking.',
    auditMap: 'QA Actions, Analytics+ reports, audit trending.',
  },
  {
    title: 'NYSDOH 10 NYCRR Part 415 - Residential Health Care Facilities',
    tags: ['NYSDOH', 'NYSDOG', 'SNF', 'LTC', 'State'],
    explanation: 'New York State regulatory requirements for nursing homes and LTC operations.',
    expectation: 'State-specific policies, staffing oversight, and resident care documentation.',
    lookingFor: 'State-required policy adherence, staffing evidence, care oversight logs.',
    artifacts: 'Staffing schedules, policy attestations, resident care documentation.',
    auditMap: 'Staff Training Audit, Care Plan Audit, Incident Reporting Audit.',
  },
  {
    title: 'NYSDOH Infection Control Guidance (DAL/QSO Communications)',
    tags: ['NYSDOH', 'NYSDOG', 'Infection Control', 'State'],
    explanation: 'State memos clarifying infection control requirements and outbreak response.',
    expectation: 'Rapid identification, reporting, and mitigation of communicable disease risks.',
    lookingFor: 'Outbreak response checklists, reporting timelines, PPE supply monitoring.',
    artifacts: 'Outbreak logs, PPE inventory checks, notification templates.',
    auditMap: 'Outbreak Readiness Audit, PPE Compliance, Surveillance Audit.',
  },
  {
    title: 'CDC Enhanced Barrier Precautions (EBP) Guidance for Nursing Homes',
    tags: ['CDC', 'EBP', 'MDRO', 'Infection Control'],
    explanation: 'Defines when to use Enhanced Barrier Precautions for residents with MDRO risk in nursing homes.',
    expectation: 'Identify residents who meet EBP criteria and apply gown/glove use during high-contact care.',
    lookingFor: 'EBP roster accuracy, signage, and staff ability to differentiate EBP from isolation.',
    artifacts: 'EBP roster, staff training records, signage verification.',
    auditMap: 'EBP Audit, PPE Compliance, Room Readiness Audit.',
  },
  {
    title: 'CDC Transmission-Based Precautions (Isolation) Guidance',
    tags: ['CDC', 'Isolation', 'Transmission-Based Precautions', 'Infection Control'],
    explanation: 'Outlines isolation requirements for contact, droplet, and airborne precautions.',
    expectation: 'Initiate isolation promptly, use correct PPE, and document discontinuation criteria.',
    lookingFor: 'Isolation orders, signage, PPE supply, and EBP vs isolation identification.',
    artifacts: 'Isolation logs, isolation signage photos, PPE audits.',
    auditMap: 'Isolation/EBP Room Readiness Audit, PPE Compliance.',
  },
  {
    title: 'CMS Emergency Preparedness Rule (EP)',
    tags: ['CMS', 'Emergency Preparedness', 'SNF', 'LTC'],
    explanation: 'Requires risk assessments, emergency plans, training, and exercises.',
    expectation: 'Up-to-date EP plan, staff training, and documented drills.',
    lookingFor: 'Hazard vulnerability analysis, drill reports, staff training compliance.',
    artifacts: 'EP plan, drill after-action reports, training rosters.',
    auditMap: 'Staff Training Audit, Room Readiness Audit.',
  },
  {
    title: 'CMS 42 CFR 483.70 Physical Environment (Life Safety)',
    tags: ['CMS', 'Life Safety', 'SNF', 'LTC'],
    explanation: 'Sets requirements for safe physical environment, equipment upkeep, and infection-safe spaces.',
    expectation: 'Environment hazards mitigated, equipment cleaned, and spaces ready for care.',
    lookingFor: 'Environmental rounds, equipment cleaning audits, storage compliance.',
    artifacts: 'Environmental checklists, equipment cleaning logs, corrective actions.',
    auditMap: 'Environment Audit, Equipment Cleaning Audit, Room Readiness Audit.',
  },
];

const PAGE_SIZE_OPTIONS = ['6', '8', '12'];

export function RegulatoryReferencesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[1]);

  const filteredReferences = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return referenceLibrary;
    return referenceLibrary.filter((item) => {
      const haystack = [
        item.title,
        item.explanation,
        item.expectation,
        item.lookingFor,
        item.artifacts,
        item.auditMap,
        item.tags.join(' '),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  const pageSizeNumber = Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(filteredReferences.length / pageSizeNumber));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSizeNumber;
  const pagedReferences = filteredReferences.slice(startIndex, startIndex + pageSizeNumber);

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Regulatory Reference Library</CardTitle>
          <CardDescription>
            Search NYSDOH (NYSDOG) and CMS references tied to SNF/LTC expectations and the audits you already run.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="w-full lg:max-w-md">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by regulation, F-tag, expectation, or audit map..."
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Rows per page</span>
              <Select value={pageSize} onValueChange={setPageSize}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Rows" />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[240px]">Title</TableHead>
                <TableHead className="min-w-[180px]">Tags</TableHead>
                <TableHead className="min-w-[260px]">Explanation</TableHead>
                <TableHead className="min-w-[260px]">Expectation</TableHead>
                <TableHead className="min-w-[240px]">Looking For</TableHead>
                <TableHead className="min-w-[220px]">Artifacts</TableHead>
                <TableHead className="min-w-[220px]">Map to Audit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedReferences.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                    No references match your search.
                  </TableCell>
                </TableRow>
              ) : (
                pagedReferences.map((item) => (
                  <TableRow key={item.title}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.explanation}</TableCell>
                    <TableCell className="text-sm">{item.expectation}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.lookingFor}</TableCell>
                    <TableCell className="text-sm">{item.artifacts}</TableCell>
                    <TableCell className="text-sm">{item.auditMap}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredReferences.length === 0 ? 0 : startIndex + 1}-
              {Math.min(startIndex + pageSizeNumber, filteredReferences.length)} of {filteredReferences.length} references
            </p>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      setPage((prev) => Math.max(1, prev - 1));
                    }}
                  />
                </PaginationItem>
                {pageNumbers.map((pageNumber) => (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      isActive={pageNumber === safePage}
                      onClick={(event) => {
                        event.preventDefault();
                        setPage(pageNumber);
                      }}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      setPage((prev) => Math.min(totalPages, prev + 1));
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
