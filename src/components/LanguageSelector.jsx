import { useState, useEffect } from 'react';
import i18n from '../lib/i18n';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

const LanguageSelector = () => {
  const [currentLang, setCurrentLang] = useState(i18n.getCurrentLanguage());

  const handleLanguageChange = (lang) => {
    i18n.setLanguage(lang);
    setCurrentLang(lang);
    // 페이지 새로고침 없이 언어 변경 적용을 위한 이벤트 발생
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
  };

  const getLanguageName = (code) => {
    const language = i18n.supportedLanguages.find(lang => lang.code === code);
    return language ? language.name : code;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Globe className="h-4 w-4" />
          <span>{getLanguageName(currentLang)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {i18n.supportedLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={currentLang === lang.code ? "bg-accent" : ""}
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
