import { StatusBar } from 'expo-status-bar';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MainScreen } from './src/screens/MainScreen';
import { ThemeProvider } from './src/theme/ThemeContext';
import { i18next } from './src/i18n';
import { LanguageProvider } from './src/i18n/LanguageContext';

export function App() {
  return (
    <I18nextProvider i18n={i18next}>
      <LanguageProvider>
        <SafeAreaProvider>
          <ThemeProvider>
            <StatusBar style="dark" />
            <MainScreen />
          </ThemeProvider>
        </SafeAreaProvider>
      </LanguageProvider>
    </I18nextProvider>
  );
}
