import React, { useState, useRef, useEffect } from 'react';
import { IPortfolioItem } from '../../types';
import { Plus, X, ExternalLink, Trash2, Check } from 'lucide-react';

export interface PlatformConfig {
  id: string;
  name: string;
  placeholder: string;
  brandColor: string;
  brandBg: string;
  brandBorder: string;
  icon: (props: { className?: string; color?: string }) => React.ReactNode;
}

// 13 Social Platforms from Image 2
export const PLATFORMS: PlatformConfig[] = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    placeholder: 'Your LinkedIn link',
    brandColor: '#0A66C2',
    brandBg: '#E8F4F9',
    brandBorder: '#B8D7EB',
    icon: ({ className, color }) => (
      <svg viewBox="0 0 24 24" className={className} fill={color || 'currentColor'} width="20" height="20">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.3a1.63 1.63 0 0 0-1.63 1.63c0 .9.73 1.63 1.63 1.63.9 0 1.63-.73 1.63-1.63 0-.9-.73-1.63-1.63-1.63Z" />
      </svg>
    ),
  },
  {
    id: 'github',
    name: 'GitHub',
    placeholder: 'Your GitHub link',
    brandColor: '#24292F',
    brandBg: '#F0F2F5',
    brandBorder: '#D0D7DE',
    icon: ({ className, color }) => (
      <svg viewBox="0 0 24 24" className={className} fill={color || 'currentColor'} width="20" height="20">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
      </svg>
    ),
  },
  {
    id: 'instagram',
    name: 'Instagram',
    placeholder: 'Your Instagram link',
    brandColor: '#E1306C',
    brandBg: '#FDF0F4',
    brandBorder: '#F9C0D3',
    icon: ({ className, color }) => (
      <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke={color || 'currentColor'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="20"
        height="20"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
      </svg>
    ),
  },
  {
    id: 'behance',
    name: 'Behance',
    placeholder: 'Your Behance link',
    brandColor: '#0057FF',
    brandBg: '#EBF2FF',
    brandBorder: '#B8D2FF',
    icon: ({ className, color }) => (
      <svg viewBox="0 0 24 24" className={className} fill={color || 'currentColor'} width="20" height="20">
        <path d="M22 7h-5v1.5h5V7Zm-.73 3.65c-.27-.37-.66-.65-1.17-.83-.51-.18-1.12-.27-1.83-.27-1.07 0-1.95.27-2.64.82-.69.55-1.08 1.36-1.17 2.43h6.91c-.04-.84-.36-1.56-.96-2.07l-.14-.08Zm-4.9 3.42c.07.64.33 1.13.78 1.47.45.34 1.02.51 1.7.51.62 0 1.12-.13 1.5-.4.38-.27.63-.61.76-1.03h2.09c-.27.99-.81 1.76-1.62 2.31-.81.55-1.78.83-2.91.83-1.46 0-2.65-.43-3.57-1.3-.92-.87-1.38-2.07-1.38-3.6 0-1.57.45-2.8 1.35-3.69.9-.89 2.05-1.34 3.45-1.34 1.48 0 2.65.45 3.51 1.35.86.9 1.28 2.12 1.25 3.66v1.29h-9.37ZM8.64 12.35c.74-.23 1.3-.61 1.68-1.14.38-.53.57-1.18.57-1.95 0-.82-.23-1.51-.69-2.07-.46-.56-1.08-.98-1.86-1.26-.78-.28-1.7-.42-2.76-.42H1v13.08h4.86c1.15 0 2.13-.16 2.94-.48.81-.32 1.44-.8 1.89-1.44.45-.64.67-1.41.67-2.31 0-.86-.24-1.59-.72-2.19-.48-.6-1.15-1.03-2-1.28v.46Zm-4.6-5.11h1.56c.86 0 1.5.17 1.92.51.42.34.63.85.63 1.53 0 .66-.22 1.16-.66 1.5-.44.34-1.09.51-1.95.51H4.04V7.24Zm1.86 8.93H4.04v-3.75h1.92c.96 0 1.68.2 2.16.6.48.4.72 1 .72 1.8 0 .76-.25 1.35-.75 1.77-.5.42-1.23.63-2.19.63v-1.05Z" />
      </svg>
    ),
  },
  {
    id: 'dribbble',
    name: 'Dribbble',
    placeholder: 'Your Dribbble link',
    brandColor: '#EA4C89',
    brandBg: '#FDF0F5',
    brandBorder: '#F9BFD6',
    icon: ({ className, color }) => (
      <svg viewBox="0 0 24 24" className={className} fill={color || 'currentColor'} width="20" height="20">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm7.42 6.13c1.23 1.43 2.01 3.23 2.15 5.21-1.21-.24-2.88-.41-4.78-.41-.53 0-1.07.01-1.6.04-.15-.34-.31-.69-.48-1.03-.53-1.07-1.12-2.11-1.77-3.08 2.66-.4 4.88-.04 6.48-.73zM12 3.65c2.32 0 4.43.91 5.99 2.39-1.39.56-3.41.87-5.89.51-1.43-.21-2.92-.61-4.32-1.17A8.324 8.324 0 0 1 12 3.65zm-6.19 2.8c1.37.54 2.82.93 4.22 1.13.06.12.12.24.18.37-.5 1.38-1.15 2.87-1.93 4.41-1.62-.35-3.41-.55-5.22-.57.43-2.07 1.44-3.9 2.75-5.34zM3.65 12c.01.27.03.54.06.8 1.72.01 3.44.2 4.99.53-.78 1.54-1.66 3.01-2.61 4.39C4.54 16.14 3.65 14.18 3.65 12zm4.31 6.57c.92-1.32 1.77-2.72 2.52-4.18.91 1.79 1.7 3.53 2.35 5.17-1.53.53-3.17.8-4.87.8-.01-.59-.01-1.19 0-1.79zm6.39 1.45c-.63-1.57-1.39-3.25-2.27-4.99 1.4-.04 2.86-.02 4.36.07.41 1.09.73 2.21.96 3.36-1-.53-2.04-.95-3.05-1.44z" />
      </svg>
    ),
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    placeholder: 'Your X link',
    brandColor: '#000000',
    brandBg: '#F3F4F6',
    brandBorder: '#D1D5DB',
    icon: ({ className, color }) => (
      <svg viewBox="0 0 24 24" className={className} fill={color || 'currentColor'} width="18" height="18">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: 'facebook',
    name: 'Facebook',
    placeholder: 'Your Facebook link',
    brandColor: '#1877F2',
    brandBg: '#EBF3FF',
    brandBorder: '#B8D6FF',
    icon: ({ className, color }) => (
      <svg viewBox="0 0 24 24" className={className} fill={color || 'currentColor'} width="20" height="20">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z" />
      </svg>
    ),
  },
  {
    id: 'medium',
    name: 'Medium',
    placeholder: 'Your Medium link',
    brandColor: '#12100E',
    brandBg: '#F3F4F6',
    brandBorder: '#D1D5DB',
    icon: ({ className, color }) => (
      <svg viewBox="0 0 24 24" className={className} fill={color || 'currentColor'} width="20" height="20">
        <path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12Zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12Z" />
      </svg>
    ),
  },
  {
    id: 'reddit',
    name: 'Reddit',
    placeholder: 'Your Reddit link',
    brandColor: '#FF4500',
    brandBg: '#FFF0EB',
    brandBorder: '#FFC8B8',
    icon: ({ className, color }) => (
      <svg viewBox="0 0 24 24" className={className} fill={color || 'currentColor'} width="20" height="20">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.702zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.197-2.512-.73a.326.326 0 0 0-.232-.095z" />
      </svg>
    ),
  },
  {
    id: 'slack',
    name: 'Slack',
    placeholder: 'Your Slack link',
    brandColor: '#4A154B',
    brandBg: '#F7EFF7',
    brandBorder: '#E6D3E6',
    icon: ({ className, color }) => (
      <svg viewBox="0 0 24 24" className={className} fill={color || 'currentColor'} width="20" height="20">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
      </svg>
    ),
  },
  {
    id: 'codepen',
    name: 'CodePen',
    placeholder: 'Your CodePen link',
    brandColor: '#131417',
    brandBg: '#F3F4F6',
    brandBorder: '#D1D5DB',
    icon: ({ className, color }) => (
      <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke={color || 'currentColor'}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="20"
        height="20"
      >
        <path d="m12 2 10 6.5v7L12 22 2 15.5v-7L12 2z"></path>
        <path d="M12 22v-6.5"></path>
        <path d="m22 8.5-10 7-10-7"></path>
        <path d="m2 15.5 10-6.5 10 6.5"></path>
        <path d="M12 2v6.5"></path>
      </svg>
    ),
  },
  {
    id: 'figma',
    name: 'Figma',
    placeholder: 'Your Figma link',
    brandColor: '#F24E1E',
    brandBg: '#FEF0EB',
    brandBorder: '#FDC4B3',
    icon: ({ className, color }) => (
      <svg viewBox="0 0 24 24" className={className} fill={color || 'currentColor'} width="18" height="18">
        <path d="M8.5 12a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Zm-3.5 7a3.5 3.5 0 0 1 3.5-3.5H12v3.5a3.5 3.5 0 0 1-7 0Zm0-7A3.5 3.5 0 0 1 8.5 8.5H12V12H8.5A3.5 3.5 0 0 1 5 12Zm0-7A3.5 3.5 0 0 1 8.5 1.5H12V5H8.5A3.5 3.5 0 0 1 5 5Zm7-3.5h3.5a3.5 3.5 0 0 1 0 7H12V1.5Z" />
      </svg>
    ),
  },
  {
    id: 'custom',
    name: 'Custom Profile',
    placeholder: 'Your Custom link',
    brandColor: '#2563EB',
    brandBg: '#EFF6FF',
    brandBorder: '#BFDBFE',
    icon: ({ className, color }) => (
      <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke={color || 'currentColor'}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="18"
        height="18"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
      </svg>
    ),
  },
];

interface PortfolioSocialMediaLinksProps {
  portfolioList: IPortfolioItem[];
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  onSaveLink: (platformId: string, url: string) => Promise<void>;
  onDeleteLink: (platformId: string) => Promise<void>;
}

export function PortfolioSocialMediaLinks({
  portfolioList,
  githubUrl,
  linkedinUrl,
  portfolioUrl,
  onSaveLink,
  onDeleteLink,
}: PortfolioSocialMediaLinksProps) {
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null);
  const [activePlatform, setActivePlatform] = useState<PlatformConfig | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [saving, setSaving] = useState(false);

  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setActivePlatform(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper to retrieve the current URL of a given platform
  const getPlatformUrl = (platformId: string): string => {
    if (platformId === 'linkedin' && linkedinUrl) return linkedinUrl;
    if (platformId === 'github' && githubUrl) return githubUrl;
    if (platformId === 'custom' && portfolioUrl) return portfolioUrl;

    const found = portfolioList.find((p) => {
      const pName = (p.name || '').toLowerCase();
      const pUrl = (p.url || '').toLowerCase();
      if (platformId === 'linkedin' && (pName.includes('linkedin') || pUrl.includes('linkedin.com'))) return true;
      if (platformId === 'github' && (pName.includes('github') || pUrl.includes('github.com'))) return true;
      if (platformId === 'instagram' && (pName.includes('instagram') || pUrl.includes('instagram.com'))) return true;
      if (platformId === 'behance' && (pName.includes('behance') || pUrl.includes('behance.net'))) return true;
      if (platformId === 'dribbble' && (pName.includes('dribbble') || pUrl.includes('dribbble.com'))) return true;
      if (platformId === 'x' && (pName.includes('twitter') || pName === 'x' || pUrl.includes('twitter.com') || pUrl.includes('x.com'))) return true;
      if (platformId === 'facebook' && (pName.includes('facebook') || pUrl.includes('facebook.com'))) return true;
      if (platformId === 'medium' && (pName.includes('medium') || pUrl.includes('medium.com'))) return true;
      if (platformId === 'reddit' && (pName.includes('reddit') || pUrl.includes('reddit.com'))) return true;
      if (platformId === 'slack' && (pName.includes('slack') || pUrl.includes('slack.com'))) return true;
      if (platformId === 'codepen' && (pName.includes('codepen') || pUrl.includes('codepen.io'))) return true;
      if (platformId === 'figma' && (pName.includes('figma') || pUrl.includes('figma.com'))) return true;
      if (platformId === 'custom' && (pName.includes('custom') || pName.includes('portfolio') || pName.includes('website'))) return true;
      return false;
    });

    return found?.url || '';
  };

  const handleOpenPopover = (platform: PlatformConfig) => {
    const existing = getPlatformUrl(platform.id);
    setUrlInput(existing);
    setActivePlatform(platform);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePlatform) return;
    const cleanUrl = urlInput.trim();
    if (!cleanUrl) return;

    setSaving(true);
    try {
      await onSaveLink(activePlatform.id, cleanUrl);
      setActivePlatform(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!activePlatform) return;
    setSaving(true);
    try {
      await onDeleteLink(activePlatform.id);
      setActivePlatform(null);
    } finally {
      setSaving(false);
    }
  };

  const handleButtonClick = (platform: PlatformConfig) => {
    if (activePlatform?.id === platform.id) {
      setActivePlatform(null);
    } else {
      handleOpenPopover(platform);
    }
  };

  const renderPlatformButton = (platform: PlatformConfig, row: number) => {
    const existingUrl = getPlatformUrl(platform.id);
    const isAdded = Boolean(existingUrl);
    const isHovered = hoveredPlatform === platform.id;
    const isSelected = activePlatform?.id === platform.id;

    // Custom link has authentic blue styling by default (matching Image 2)
    const isCustom = platform.id === 'custom';
    const showActiveStyle = isAdded || isCustom;

    return (
      <div
        key={platform.id}
        className="relative"
        onMouseEnter={() => setHoveredPlatform(platform.id)}
        onMouseLeave={() => setHoveredPlatform(null)}
      >
        {/* Round Button */}
        <button
          type="button"
          onClick={() => handleButtonClick(platform)}
          style={{
            backgroundColor: showActiveStyle
              ? platform.brandBg
              : isSelected
              ? '#F1F5F9'
              : '#F1F5F9',
            borderColor: showActiveStyle
              ? platform.brandBorder
              : isSelected
              ? '#94A3B8'
              : '#E2E8F0',
            color: showActiveStyle ? platform.brandColor : '#94A3B8',
          }}
          className={`h-11 w-11 rounded-full border flex items-center justify-center transition-all duration-200 shadow-2xs cursor-pointer ${
            showActiveStyle
              ? 'scale-100 hover:scale-105 shadow-xs'
              : 'hover:bg-slate-200/80 hover:text-slate-700'
          }`}
          title={isAdded ? `${platform.name}: ${existingUrl}` : `Add ${platform.name} link`}
        >
          {/* If currently selected/open: show X close icon (Image 4) */}
          {isSelected ? (
            <X className="h-5 w-5 text-slate-700 transition-transform animate-in zoom-in-75 duration-150" />
          ) : !isAdded && isHovered ? (
            /* If not added and hovered: show Plus icon (Image 3) */
            <Plus className="h-5 w-5 text-slate-700 transition-transform animate-in zoom-in-75 duration-150" />
          ) : (
            platform.icon({
              className: 'transition-colors',
              color: showActiveStyle ? platform.brandColor : undefined,
            })
          )}
        </button>

        {/* Hover Tooltip (Image 3): "Add link" with down arrow */}
        {isHovered && !activePlatform && (
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-lg pointer-events-none whitespace-nowrap z-30 animate-in fade-in slide-in-from-bottom-1 duration-150">
            {isAdded ? platform.name : 'Add link'}
            {/* Small bottom triangle */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
          </div>
        )}

        {/* Floating Popover anchored to button (Image 4 & 5) */}
        {isSelected && (
          <div
            ref={popoverRef}
            className={`absolute ${
              row === 2 ? 'bottom-13.5' : 'top-13.5'
            } left-0 sm:left-auto sm:right-0 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-4 w-76 sm:w-82 text-left animate-in fade-in zoom-in-95 duration-150`}
          >
            {/* Popover Header */}
            <div className="pb-2.5">
              <span className="text-sm font-semibold text-slate-800">
                {getPlatformUrl(platform.id)
                  ? `Edit ${platform.name}'s link`
                  : `Add ${platform.name}'s link`}
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    {platform.icon({
                      className: 'h-4 w-4',
                      color: urlInput.trim() ? platform.brandColor : '#94A3B8',
                    })}
                  </div>
                  <input
                    type="url"
                    required
                    autoFocus
                    placeholder={platform.placeholder}
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white placeholder:text-slate-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving || !urlInput.trim()}
                  className={`px-4.5 py-2 rounded-full text-xs font-semibold transition-colors shrink-0 ${
                    urlInput.trim()
                      ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs cursor-pointer'
                      : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                  }`}
                >
                  {saving ? '...' : 'Save'}
                </button>
              </div>

              {/* If already added: show Visit URL & Remove action */}
              {getPlatformUrl(platform.id) && (
                <div className="pt-2 flex items-center justify-between text-[11px] border-t border-slate-100">
                  <a
                    href={getPlatformUrl(platform.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Visit URL</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={saving}
                    className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Remove</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">Portfolio/Social Media</h3>
      </div>

      {/* Interactive Icons Bar (2 Rows matching Image 2) */}
      <div className="space-y-3">
        {/* Row 1: 9 platforms (LinkedIn, GitHub, Instagram, Behance, Dribbble, X, Facebook, Medium, Reddit) */}
        <div className="flex flex-wrap items-center gap-3">
          {PLATFORMS.slice(0, 9).map((platform) => renderPlatformButton(platform, 1))}
        </div>

        {/* Row 2: 4 platforms (Slack, CodePen, Figma, Custom Link) */}
        <div className="flex flex-wrap items-center gap-3">
          {PLATFORMS.slice(9).map((platform) => renderPlatformButton(platform, 2))}
        </div>
      </div>

      {/* Added links summary cards (clean, elegant list of currently added profiles) */}
      {portfolioList && portfolioList.length > 0 && (
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Connected Profiles ({portfolioList.length})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {portfolioList.map((port, idx) => {
              // Match platform config
              const matched = PLATFORMS.find(
                (p) =>
                  p.id === port.name.toLowerCase() ||
                  port.name.toLowerCase().includes(p.id) ||
                  port.url.toLowerCase().includes(p.id)
              );

              return (
                <div
                  key={port.id || idx}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      style={{
                        backgroundColor: matched?.brandBg || '#F1F5F9',
                        color: matched?.brandColor || '#475569',
                      }}
                      className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border border-slate-200/60"
                    >
                      {matched ? matched.icon({ className: 'h-3.5 w-3.5' }) : <ExternalLink className="h-3.5 w-3.5" />}
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-slate-800 text-[11px]">{port.name}</p>
                      <a
                        href={port.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-blue-600 hover:underline truncate block"
                      >
                        {port.url}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const plat = matched || PLATFORMS.find((p) => p.id === 'custom')!;
                        handleOpenPopover(plat);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200"
                      title="Edit"
                    >
                      <span className="text-[10px] font-bold">Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!window.confirm(`Remove ${port.name} link?`)) return;
                        const plat = matched?.id || 'custom';
                        await onDeleteLink(plat);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
