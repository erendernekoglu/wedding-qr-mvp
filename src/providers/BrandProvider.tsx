import React, { createContext, useContext, useState } from 'react';

interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
}

interface BrandFonts {
  heading: string;
  body: string;
}

interface BrandContextType {
  colors: BrandColors;
  fonts: BrandFonts;
  updateColors: (colors: Partial<BrandColors>) => void;
  updateFonts: (fonts: Partial<BrandFonts>) => void;
}

const defaultColors: BrandColors = {
  primary: '#C2185B',
  secondary: '#8BC34A',
  accent: '#FF9800',
};

const defaultFonts: BrandFonts = {
  heading: 'Playfair Display',
  body: 'Inter',
};

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [colors, setColors] = useState<BrandColors>(defaultColors);
  const [fonts, setFonts] = useState<BrandFonts>(defaultFonts);

  const updateColors = (newColors: Partial<BrandColors>) => {
    setColors(prev => ({ ...prev, ...newColors }));
    
    // Update CSS custom properties
    const root = document.documentElement;
    if (newColors.primary) root.style.setProperty('--brand-primary', newColors.primary);
    if (newColors.secondary) root.style.setProperty('--brand-secondary', newColors.secondary);
    if (newColors.accent) root.style.setProperty('--brand-accent', newColors.accent);
  };

  const updateFonts = (newFonts: Partial<BrandFonts>) => {
    setFonts(prev => ({ ...prev, ...newFonts }));
    
    // Update CSS custom properties
    const root = document.documentElement;
    if (newFonts.heading) root.style.setProperty('--brand-font-heading', newFonts.heading);
    if (newFonts.body) root.style.setProperty('--brand-font-body', newFonts.body);
  };

  // Initialize CSS custom properties
  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', colors.primary);
    root.style.setProperty('--brand-secondary', colors.secondary);
    root.style.setProperty('--brand-accent', colors.accent);
    root.style.setProperty('--brand-font-heading', fonts.heading);
    root.style.setProperty('--brand-font-body', fonts.body);
  }, []);

  return (
    <BrandContext.Provider value={{ colors, fonts, updateColors, updateFonts }}>
      {children}
    </BrandContext.Provider>
  );
}

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
};