/**
 * 구글 드라이브 URL 생성 헬퍼 함수
 * 실제 API 연동 없이 URL 형식만 생성하는 함수입니다.
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
 * 실제 구글 드라이브 API 연동 시 사용할 함수 (현재는 미구현)
 * @param {string} brandName - 브랜드명
 * @param {string} userName - 신청자 이름
 * @returns {Promise<{driveUrl: string, slidesUrl: string}>} - 생성된 URL 객체
 */
export const createGoogleDriveFolders = async (brandName, userName) => {
  // 실제 API 연동 시 구현
  // 현재는 형식만 제공하는 함수 사용
  const driveUrl = generateDriveUrl(brandName, userName);
  const slidesUrl = generateSlidesUrl(brandName, userName);
  
  return {
    driveUrl,
    slidesUrl
  };
};

export default {
  generateDriveUrl,
  generateSlidesUrl,
  createGoogleDriveFolders
};
