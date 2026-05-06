/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
} from 'react';

const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

const ActualThemeContext = createContext(null);
export const useActualTheme = () => useContext(ActualThemeContext);

const SetThemeContext = createContext(null);
export const useSetTheme = () => useContext(SetThemeContext);
const FORCED_THEME = 'light';

export const ThemeProvider = ({ children }) => {
  const [theme, _setTheme] = useState(FORCED_THEME);
  const actualTheme = FORCED_THEME;

  // 应用主题到DOM
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const body = document.body;
    const root = document.documentElement;

    body.removeAttribute('theme-mode');
    root.classList.remove('dark');
    root.style.colorScheme = FORCED_THEME;

    try {
      localStorage.setItem('theme-mode', FORCED_THEME);
    } catch {
      // ignore storage failures
    }
  }, [actualTheme]);

  const setTheme = useCallback(() => {
    _setTheme(FORCED_THEME);
    try {
      localStorage.setItem('theme-mode', FORCED_THEME);
    } catch {
      // ignore storage failures
    }
  }, []);

  return (
    <SetThemeContext.Provider value={setTheme}>
      <ActualThemeContext.Provider value={actualTheme}>
        <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
      </ActualThemeContext.Provider>
    </SetThemeContext.Provider>
  );
};
