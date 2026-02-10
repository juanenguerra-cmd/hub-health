import { useMemo, useState } from 'react';
import type { EduTopic } from '@/types/nurse-educator';
import {
  categorizeByKeywords,
  getCategoryMetadata,
  parseFTags,
  type CMSCategory
} from '@/lib/regulatory-categories';

export interface EducationFilters {
  search: string;
  regulatoryCategory: 'all' | CMSCategory;
  ftags: string[];
  priority: 'all' | 'critical' | 'high' | 'medium';
  nysdohRequired: 'all' | 'yes' | 'no';
  hasAudit: 'all' | 'yes' | 'no';
  disciplines: string[];
  showArchived: boolean;
}

const defaultFilters: EducationFilters = {
  search: '',
  regulatoryCategory: 'all',
  ftags: [],
  priority: 'all',
  nysdohRequired: 'all',
  hasAudit: 'all',
  disciplines: [],
  showArchived: false
};

export const useEducationFilters = (topics: EduTopic[]) => {
  const [filters, setFilters] = useState<EducationFilters>(defaultFilters);

  const availableFTags = useMemo(() => {
    const tags = new Set<string>();
    topics.forEach(topic => {
      parseFTags(topic.ftags).forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [topics]);

  const availableDisciplines = useMemo(() => {
    const disciplines = new Set<string>();
    topics.forEach(topic => {
      topic.disciplines?.split(/[;,]/).forEach(d => {
        const trimmed = d.trim();
        if (trimmed) disciplines.add(trimmed);
      });
    });
    return Array.from(disciplines).sort();
  }, [topics]);

  const filteredTopics = useMemo(() => {
    return topics.filter(topic => {
      if (!filters.showArchived && topic.archived) return false;
      if (filters.showArchived && !topic.archived) return false;

      if (filters.search) {
        const query = filters.search.toLowerCase();
        const searchable = [
          topic.topic,
          topic.description,
          topic.purpose,
          topic.ftags,
          topic.nysdohRegs,
          topic.facilityPolicy,
          topic.disciplines,
          topic.regulatoryCategory || '',
          topic.category || ''
        ]
          .join(' ')
          .toLowerCase();

        if (!searchable.includes(query)) return false;
      }

      const resolvedCategory = topic.regulatoryCategory || categorizeByKeywords(
        topic.topic,
        topic.ftags,
        topic.nysdohRegs || '',
        topic.purpose
      );

      if (filters.regulatoryCategory !== 'all' && resolvedCategory !== filters.regulatoryCategory) {
        return false;
      }

      if (filters.ftags.length > 0) {
        const topicFTags = parseFTags(topic.ftags);
        const hasAllSelected = filters.ftags.every(tag => topicFTags.includes(tag));
        if (!hasAllSelected) return false;
      }

      if (filters.priority !== 'all') {
        const topicPriority = topic.priority || getCategoryMetadata(resolvedCategory).priority;
        if (topicPriority !== filters.priority) return false;
      }

      if (filters.nysdohRequired !== 'all') {
        const isRequired = Boolean(topic.nysdohRequired);
        if (filters.nysdohRequired === 'yes' && !isRequired) return false;
        if (filters.nysdohRequired === 'no' && isRequired) return false;
      }

      if (filters.hasAudit !== 'all') {
        const hasAudit = Boolean(topic.triggerAuditId);
        if (filters.hasAudit === 'yes' && !hasAudit) return false;
        if (filters.hasAudit === 'no' && hasAudit) return false;
      }

      if (filters.disciplines.length > 0) {
        const topicDisciplines = topic.disciplines.split(/[;,]/).map(d => d.trim().toLowerCase());
        const hasAny = filters.disciplines.some(d =>
          topicDisciplines.some(td => td.includes(d.toLowerCase()))
        );
        if (!hasAny) return false;
      }

      return true;
    });
  }, [topics, filters]);

  const filterStats = useMemo(() => {
    return {
      total: topics.length,
      filtered: filteredTopics.length,
      active: topics.filter(t => !t.archived).length,
      archived: topics.filter(t => t.archived).length,
      critical: topics.filter(t => {
        const category = t.regulatoryCategory || categorizeByKeywords(t.topic, t.ftags, t.nysdohRegs || '', t.purpose);
        return getCategoryMetadata(category).priority === 'critical';
      }).length,
      nysdohRequired: topics.filter(t => t.nysdohRequired).length
    };
  }, [topics, filteredTopics]);

  const updateFilter = <K extends keyof EducationFilters>(key: K, value: EducationFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => setFilters(defaultFilters);

  const hasActiveFilters =
    filters.search !== '' ||
    filters.regulatoryCategory !== 'all' ||
    filters.ftags.length > 0 ||
    filters.priority !== 'all' ||
    filters.nysdohRequired !== 'all' ||
    filters.hasAudit !== 'all' ||
    filters.disciplines.length > 0;

  return {
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    filteredTopics,
    filterStats,
    availableFTags,
    availableDisciplines
  };
};
