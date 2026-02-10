import { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { getNavItemByPath } from '@/lib/navigation';

type Crumb = {
  label: string;
  path?: string;
};

function getBreadcrumbs(pathname: string): Crumb[] {
  const current = getNavItemByPath(pathname);

  if (!current) {
    return [{ label: 'Home', path: '/dashboard' }, { label: 'Not Found' }];
  }

  const breadcrumbs: Crumb[] = [{ label: 'Home', path: '/dashboard' }];

  if (current.id !== 'dashboard') {
    breadcrumbs.push({ label: current.groupLabel });
  }

  breadcrumbs.push({ label: current.label });

  return breadcrumbs;
}

export function AppBreadcrumbs() {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <Fragment key={`${crumb.label}-${index}`}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : crumb.path ? (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.path}>{crumb.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
