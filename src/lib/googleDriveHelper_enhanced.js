import googleDriveService from './googleDriveService';
import { database } from './supabase';

/**
 * 구글 드라이브 URL 생성 및 API 연동 헬퍼 함수
 */

/**
 * 브랜드명과 날짜를 기반으로 폴더 이름 생성
 * @param {string} brandName - 브랜드명
 * @returns {string} - 폴더 이름 (브랜드명_YYYYMMDD)
 */
export const generateFolderName = (brandName) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${brandName}_${year}${month}${day}`;
};

/**
 * 신청자 이름을 기반으로 하위 폴더 이름 생성
 * @param {string} userName - 신청자 이름
 * @returns {string} - 폴더 이름 (userName)
 */
export const generateUserFolderName = (userName) => {
  return userName.replace(/\s+/g, '_');
};

/**
 * 구글 드라이브 URL 생성 (실제 API 연동 없이 형식만 생성)
 * @param {string} brandName - 브랜드명
 * @param {string} userName - 신청자 이름
 * @returns {string} - 구글 드라이브 URL
 */
export const generateDriveUrl = (brandName, userName) => {
  const folderName = generateFolderName(brandName);
  const userFolder = generateUserFolderName(userName);
  
  // 실제 URL이 아닌 형식만 제공하는 예시 URL
  return `https://drive.google.com/drive/folders/${folderName}/${userFolder}`;
};

/**
 * 구글 슬라이드 URL 생성 (실제 API 연동 없이 형식만 생성)
 * @param {string} brandName - 브랜드명
 * @param {string} userName - 신청자 이름
 * @returns {string} - 구글 슬라이드 URL
 */
export const generateSlidesUrl = (brandName, userName) => {
  const folderName = generateFolderName(brandName);
  const userFolder = generateUserFolderName(userName);
  
  // 실제 URL이 아닌 형식만 제공하는 예시 URL
  return `https://docs.google.com/presentation/d/${folderName}_${userFolder}_guide`;
};

/**
 * 구글 드라이브 서비스 초기화
 * @param {Object} credentials - 서비스 계정 인증 정보
 * @returns {boolean} - 초기화 성공 여부
 */
export const initializeGoogleDriveService = (credentials) => {
  try {
    return googleDriveService.initialize(credentials);
  } catch (error) {
    console.error('구글 드라이브 서비스 초기화 오류:', error);
    return false;
  }
};

/**
 * 시스템 설정에서 구글 드라이브 API 인증 정보 로드 및 서비스 초기화
 * @returns {Promise<boolean>} - 초기화 성공 여부
 */
export const initializeFromSystemSettings = async () => {
  try {
    // 시스템 설정에서 구글 드라이브 API 인증 정보 로드
    const settings = await database.system.getSettings();
    
    if (!settings || !settings.google_drive_credentials) {
      console.error('구글 드라이브 API 인증 정보가 시스템 설정에 없습니다.');
      return false;
    }
    
    let credentials;
    try {
      // JSON 문자열을 객체로 변환
      credentials = JSON.parse(settings.google_drive_credentials);
    } catch (error) {
      console.error('구글 드라이브 API 인증 정보 파싱 오류:', error);
      return false;
    }
    
    // 서비스 초기화
    return initializeGoogleDriveService(credentials);
  } catch (error) {
    console.error('시스템 설정에서 구글 드라이브 API 초기화 오류:', error);
    return false;
  }
};

/**
 * 구글 드라이브 폴더 및 슬라이드 생성 (실제 API 연동)
 * @param {string} brandName - 브랜드명
 * @param {string} userName - 신청자 이름
 * @param {string} userEmail - 신청자 이메일
 * @returns {Promise<{driveUrl: string, slidesUrl: string}>} - 생성된 URL 객체
 */
export const createGoogleDriveFolders = async (brandName, userName, userEmail) => {
  try {
    // 서비스가 초기화되지 않은 경우 시스템 설정에서 초기화 시도
    if (!googleDriveService.isInitialized()) {
      const initialized = await initializeFromSystemSettings();
      if (!initialized) {
        throw new Error('구글 드라이브 서비스를 초기화할 수 없습니다.');
      }
    }
    
    // 폴더 구조 생성
    const result = await googleDriveService.createFolderStructureForUser(
      brandName || 'brand',
      userName || 'user',
      userEmail
    );
    
    return {
      driveUrl: result.userFolder.webViewLink,
      slidesUrl: result.slides.webViewLink
    };
  } catch (error) {
    console.error('구글 드라이브 폴더 생성 오류:', error);
    
    // API 연동 실패 시 형식만 제공하는 URL 반환
    return {
      driveUrl: generateDriveUrl(brandName, userName),
      slidesUrl: generateSlidesUrl(brandName, userName)
    };
  }
};

/**
 * 구글 드라이브 API 상태 확인
 * @returns {Promise<{initialized: boolean, error: string|null}>} - API 상태 정보
 */
export const checkGoogleDriveApiStatus = async () => {
  try {
    // 서비스가 이미 초기화되어 있는지 확인
    if (googleDriveService.isInitialized()) {
      return { initialized: true, error: null };
    }
    
    // 시스템 설정에서 초기화 시도
    const initialized = await initializeFromSystemSettings();
    return { initialized, error: initialized ? null : '구글 드라이브 API 인증 정보가 올바르지 않습니다.' };
  } catch (error) {
    return { initialized: false, error: error.message };
  }
};

export default {
  generateDriveUrl,
  generateSlidesUrl,
  createGoogleDriveFolders,
  initializeGoogleDriveService,
  initializeFromSystemSettings,
  checkGoogleDriveApiStatus
};
