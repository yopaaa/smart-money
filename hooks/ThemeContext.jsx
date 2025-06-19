import { getSetting, saveSetting } from "@/utils/fn/settings";
import { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';

const ThemeContext = createContext();

import { DarkTheme as DefaultDarkTheme, DefaultTheme as LightTheme } from '@react-navigation/native';

export const CustomDarkTheme = {
  mode: 'dark',
  ...DefaultDarkTheme,
  colors: {
    ...DefaultDarkTheme.colors,
    background: '#050B10',   // Biru-hitam sangat pekat
    card: '#0A1A24',         // Biru sangat gelap untuk card/header
    text: '#bfbfbf',         // Abu kebiruan yang tenang
    border: '#13222D',       // Biru keabu-abuan gelap untuk border
    primary: '#2563EB',      // Biru navy tua — lebih gelap dari sebelumnya
    secondary: '#014E73',    // Biru kehitaman — pelengkap yang gelap
    inactive: "#808080",
    description: "#777",
  },
};


export const CustomLightTheme = {
  mode: 'light',
  ...LightTheme,
  colors: {
    ...LightTheme.colors,
    inactive: "#808080",
    description: "#777",
    // background: '#ebf3f7',     // Biru muda sangat pucat — lembut dan terang
    // card: '#FFFFFF',           // Putih bersih — tetap kontras
    // text: '#1A2B3C',           // Biru kehitaman — elegan dan nyaman dibaca
    border: '#E5E5E5',         // Biru muda pastel — segar sebagai pemisah
    primary: '#2563EB',        // Warna utama — Deep Sky Blue
    // secondary: '#5d8599',      // Biru tua sebagai penyeimbang
  },
};


export const ThemeProvider = ({ children }) => {
  // const colorScheme = Appearance.getColorScheme();
  const [themeMode, setThemeMode] = useState(getSetting("@theme") || "light");

  const toggleTheme = () => {
    setThemeMode(prev => (prev === 'light' ? 'dark' : 'light'));

    if (themeMode == "light") {
      setThemeMode("dark")
      saveSetting("@theme", "dark")

      return
    }
    setThemeMode("light")
    saveSetting("@theme", "light")
  };

  const theme = themeMode === 'light' ? CustomLightTheme : CustomDarkTheme;

  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setThemeMode(colorScheme);
    });

    return () => listener.remove();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};


// Hook untuk digunakan di komponen lain
export const useTheme = () => useContext(ThemeContext);
