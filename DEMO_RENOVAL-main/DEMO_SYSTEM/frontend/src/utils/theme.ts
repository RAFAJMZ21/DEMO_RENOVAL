export const theme = {
  dark: {
    // Backgrounds
    bgPrimary: 'bg-[#0a0d14]',
    bgSecondary: 'bg-[#10141d]',
    bgCard: 'bg-[#181d29]',
    bgCardHover: 'bg-[#1e293b]',
    bgInput: 'bg-[#181d29]',
    bgOverlay: 'bg-black/70',
    
    // Borders
    borderPrimary: 'border-[#1e2430]',
    borderSecondary: 'border-[#252c3d]',
    borderInput: 'border-[#252c3d]',
    borderFocus: 'focus:border-emerald-500',
    
    // Text
    textPrimary: 'text-white',
    textSecondary: 'text-gray-300',
    textMuted: 'text-gray-400',
    textLabel: 'text-gray-400',
    
    // Brand
    brandPrimary: 'text-emerald-400',
    brandSecondary: 'text-lime-400',
    brandBg: 'bg-emerald-950/80',
    brandBorder: 'border-emerald-800/60',
    brandHover: 'hover:bg-emerald-950/80',
    brandButton: 'bg-lime-400 text-emerald-950 hover:bg-lime-300',
    brandButtonOutline: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30',
    
    // Status
    success: 'text-emerald-400',
    successBg: 'bg-emerald-500/10 border-emerald-500/20',
    warning: 'text-amber-400',
    warningBg: 'bg-amber-500/10 border-amber-500/20',
    danger: 'text-red-400',
    dangerBg: 'bg-red-500/10 border-red-500/20',
    info: 'text-blue-400',
    infoBg: 'bg-blue-500/10 border-blue-500/20',
    
    // Sidebar
    sidebarBg: 'bg-[#10141d] border-[#1e2430]',
    sidebarItem: 'text-gray-400 hover:bg-gray-800/50 hover:text-white',
    sidebarItemActive: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60',
    
    // Header
    headerBg: 'bg-[#10141d] border-[#1e2430]',
    searchBg: 'bg-[#181d29] border-[#252c3d]',
    userMenuBg: 'bg-emerald-950/60 border-emerald-800/50',
    userMenuHover: 'hover:bg-emerald-950/80',
    
    // Scrollbar
    scrollbarTrack: 'bg-[#0a0d14]',
    scrollbarThumb: 'bg-[#252c3d]',
  },
  
  light: {
    // Backgrounds
    bgPrimary: 'bg-emerald-50',
    bgSecondary: 'bg-white',
    bgCard: 'bg-white',
    bgCardHover: 'bg-emerald-50',
    bgInput: 'bg-white',
    bgOverlay: 'bg-black/50',
    
    // Borders
    borderPrimary: 'border-emerald-200',
    borderSecondary: 'border-emerald-100',
    borderInput: 'border-emerald-200',
    borderFocus: 'focus:border-emerald-500',
    
    // Text
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-700',
    textMuted: 'text-gray-500',
    textLabel: 'text-gray-600',
    
    // Brand
    brandPrimary: 'text-emerald-700',
    brandSecondary: 'text-lime-600',
    brandBg: 'bg-emerald-100',
    brandBorder: 'border-emerald-300',
    brandHover: 'hover:bg-emerald-100',
    brandButton: 'bg-emerald-600 text-white hover:bg-emerald-700',
    brandButtonOutline: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    
    // Status
    success: 'text-emerald-700',
    successBg: 'bg-emerald-100 border-emerald-200',
    warning: 'text-amber-700',
    warningBg: 'bg-amber-100 border-amber-200',
    danger: 'text-red-700',
    dangerBg: 'bg-red-100 border-red-200',
    info: 'text-blue-700',
    infoBg: 'bg-blue-100 border-blue-200',
    
    // Sidebar
    sidebarBg: 'bg-white border-emerald-200',
    sidebarItem: 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700',
    sidebarItemActive: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    
    // Header
    headerBg: 'bg-white border-emerald-200',
    searchBg: 'bg-emerald-50 border-emerald-200',
    userMenuBg: 'bg-emerald-100 border-emerald-300',
    userMenuHover: 'hover:bg-emerald-200',
    
    // Scrollbar
    scrollbarTrack: 'bg-emerald-50',
    scrollbarThumb: 'bg-emerald-200',
  },
};

export type ThemeMode = 'dark' | 'light';
export type ThemeColors = typeof theme.dark;

export const getTheme = (isDarkMode: boolean): ThemeColors => 
  isDarkMode ? theme.dark : theme.light;