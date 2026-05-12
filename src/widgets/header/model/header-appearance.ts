export const getHeaderVars = (isHeroPage: boolean) =>
  isHeroPage
    ? {
        '--header-border': 'rgba(255,255,255,0.08)',
        '--header-background': 'transparent',
        '--header-backdrop': 'none',
        '--menu-button-color': '#F8F3FF',
        '--menu-button-border': 'rgba(255,255,255,0.14)',
        '--menu-button-background': 'rgba(255,255,255,0.04)',
        '--drawer-background':
          'linear-gradient(180deg, rgba(14,15,29,0.98) 0%, rgba(10,11,22,0.99) 100%)',
        '--drawer-text-color': '#F8F3FF',
        '--drawer-divider': 'rgba(255,255,255,0.12)',
        '--drawer-profile-border': 'rgba(255,255,255,0.12)',
        '--drawer-profile-background': 'rgba(255,255,255,0.04)',
        '--drawer-outline-color': '#F8F3FF',
        '--drawer-outline-border': 'rgba(255,255,255,0.18)',
        '--drawer-hover-background': 'rgba(255,255,255,0.08)',
        '--drawer-hover-border': 'rgba(255,255,255,0.28)',
      }
    : {
        '--header-border': 'rgba(12,34,48,0.10)',
        '--header-background': 'rgba(239,245,251,0.78)',
        '--header-backdrop': 'blur(18px)',
        '--menu-button-color': '#0C2230',
        '--menu-button-border': 'rgba(255,255,255,0.8)',
        '--menu-button-background': 'rgba(255,255,255,0.7)',
        '--drawer-background': 'rgba(255,255,255,0.98)',
        '--drawer-text-color': '#0C2230',
        '--drawer-divider': 'rgba(12,34,48,0.10)',
        '--drawer-profile-border': 'rgba(17,24,39,0.08)',
        '--drawer-profile-background': 'rgba(17,24,39,0.04)',
        '--drawer-outline-color': '#0C2230',
        '--drawer-outline-border': 'rgba(12,34,48,0.10)',
        '--drawer-hover-background': 'rgba(17,24,39,0.06)',
        '--drawer-hover-border': 'rgba(12,34,48,0.18)',
      };
