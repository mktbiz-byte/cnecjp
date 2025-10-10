// PayPal 정보 추출 헬퍼 함수
export const extractPayPalFromDescription = (description) => {
  if (!description) return ''
  
  // "PayPal: email@example.com" 형식에서 이메일 추출
  const paypalMatch = description.match(/PayPal:\s*([^)]+)/)
  if (paypalMatch) {
    return paypalMatch[1].trim()
  }
  
  // 이메일 패턴 직접 추출
  const emailMatch = description.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
  if (emailMatch) {
    return emailMatch[1]
  }
  
  return ''
}
