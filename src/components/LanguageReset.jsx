import { useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

const LanguageReset = () => {
  const { changeLanguage } = useLanguage()

  useEffect(() => {
    // localStorage 초기화 및 일본어로 설정
    localStorage.removeItem('cnec-language')
    localStorage.setItem('cnec-language', 'ja')
    changeLanguage('ja')
    
    console.log('언어가 일본어로 설정되었습니다.')
  }, [changeLanguage])

  return null
}

export default LanguageReset
