import React from 'react';
import { Check, LucideIcon } from 'lucide-react';

interface StatCardProps {
  value: string;
  label: string;
  highlighted?: boolean;
}

export function StatCard({ value, label, highlighted = false }: StatCardProps) {
  return (
    <div className={`stat-card ${highlighted ? 'bg-primary-50' : 'bg-white'} rounded-lg shadow-sm p-4`}>
      <div className={`stat-value ${highlighted ? 'text-primary-500' : 'text-neutral-900'}`}>
        {value}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

interface OutcomeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  outcome: string;
  savings?: string;
  timeline?: string;
}

export function OutcomeCard({ icon: Icon, title, description, outcome, savings, timeline }: OutcomeCardProps) {
  return (
    <div className="card hover-lift">
      <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-subtitle mb-2 text-primary-500">{title}</h3>
      <p className="text-sm text-neutral-600 mb-4">{description}</p>
      
      <div className="space-y-2">
        <div className="flex items-start gap-2 text-sm">
          <Check className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-medium text-neutral-900">Outcome</div>
            <div className="text-neutral-600">{outcome}</div>
          </div>
        </div>
        
        {savings && (
          <div className="flex items-start gap-2 text-sm">
            <Check className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-neutral-900">Savings</div>
              <div className="text-success-500 font-medium">{savings}</div>
            </div>
          </div>
        )}
        
        {timeline && (
          <div className="flex items-start gap-2 text-sm">
            <Check className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-neutral-900">Timeline</div>
              <div className="text-neutral-600">{timeline}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface IndustryDataCardProps {
  stat: string;
  description: string;
  source: string;
  link?: string;
}

export function IndustryDataCard({ stat, description, source, link }: IndustryDataCardProps) {
  return (
    <div className="card-elevated text-center">
      <div className="text-5xl font-bold text-primary-500 mb-4">
        {stat}
      </div>
      <p className="text-neutral-700 mb-4">
        {description}
      </p>
      {link ? (
        <a 
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary-500 hover:text-primary-700 font-medium"
        >
          Source: {source} →
        </a>
      ) : (
        <p className="text-sm text-neutral-500">
          Source: {source}
        </p>
      )}
    </div>
  );
}

interface TrustBadgeProps {
  children: React.ReactNode;
  light?: boolean;
}

export function TrustBadge({ children, light = false }: TrustBadgeProps) {
  return (
    <div className={`trust-badge ${light ? 'text-neutral-400' : 'text-neutral-600'}`}>
      <Check className="w-4 h-4 text-success-500" />
      <span>{children}</span>
    </div>
  );
}

interface GuaranteeCardProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export function GuaranteeCard({ title, description, icon: Icon }: GuaranteeCardProps) {
  return (
    <div className="card">
      {Icon && (
        <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-primary-500" />
        </div>
      )}
      <h4 className="font-bold text-neutral-900 mb-2">{title}</h4>
      <p className="text-sm text-neutral-600">{description}</p>
    </div>
  );
}

