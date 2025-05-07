import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Utilisez un état différé pour éviter les problèmes d'hydratation
  const [mounted, setMounted] = useState(false);

  // Initialisez le thème après le montage du composant
  const [theme, setTheme] = useState<Theme>('light');

  // Effet pour initialiser le thème après le montage
  useEffect(() => {
    setMounted(true);

    // Récupérer le thème du localStorage
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark' || savedTheme === 'light') {
      setTheme(savedTheme as Theme);
    } else if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []);

  // Effet pour appliquer le thème au document
  useEffect(() => {
    if (!mounted) return;

    // Sauvegarde dans localStorage
    localStorage.setItem('theme', theme);

    // Appliquer au document
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    console.log('Theme updated to:', theme);
  }, [theme, mounted]);

  // Fonction pour basculer le thème de manière forcée
  const toggleTheme = () => {
    console.log('toggleTheme called, current theme:', theme);
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'dark' ? 'light' : 'dark';
      console.log('New theme will be:', newTheme);
      return newTheme;
    });
  };

  // Ne pas rendre le contenu tant que le montage n'est pas terminé
  // pour éviter les problèmes d'hydratation
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
