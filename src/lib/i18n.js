// 다국어 지원을 위한 번역 데이터
const translations = {
  // 한국어 번역
  ko: {
    // 공통
    common: {
      loading: "로딩 중...",
      error: "오류가 발생했습니다.",
      back: "뒤로 가기",
      save: "저장",
      cancel: "취소",
      download: "다운로드",
      print: "인쇄",
      view: "보기",
      edit: "편집",
      delete: "삭제",
      search: "검색",
      filter: "필터",
      all: "전체",
      yes: "예",
      no: "아니오",
      success: "성공",
      failed: "실패",
      retry: "다시 시도",
      period: "기간",
      status: "상태",
      date: "날짜",
      name: "이름",
      address: "주소",
      postalCode: "우편번호",
      currency: "원",
    },
    
    // 회사 보고서
    companyReport: {
      title: "{name} 캠페인 보고서",
      description: "캠페인의 성과와 분석 데이터를 확인할 수 있습니다",
      downloadReport: "보고서 다운로드",
      period: {
        label: "기간",
        all: "전체 기간",
        past7days: "지난 7일",
        past30days: "지난 30일",
        past90days: "지난 90일",
        past1year: "지난 1년",
      },
      campaign: {
        label: "캠페인",
        all: "전체 캠페인",
        period: "기간",
        status: "상태",
        active: "진행중",
        completed: "완료",
        draft: "초안",
        closed: "종료",
      },
      tabs: {
        overview: "개요",
        campaigns: "캠페인",
        influencers: "인플루언서",
        analytics: "분석",
      },
      metrics: {
        totalApplications: "총 신청 수",
        approvedCount: "승인 수",
        approvalRate: "승인율",
        completedCount: "완료 수",
        completionRate: "완료율",
        totalReward: "총 보상금",
        averageReward: "평균 보상금",
      },
      status: {
        pending: "대기 중",
        approved: "승인됨",
        rejected: "거부됨",
        completed: "완료됨",
        cancelled: "취소됨",
      },
      charts: {
        statusDistribution: "신청 상태 분포",
        dailyApplications: "일별 신청 추이",
        count: "건수",
      },
      sns: {
        totalUploads: "총 업로드",
        instagram: "인스타그램",
        tiktok: "틱톡",
        youtube: "유튜브",
        other: "기타",
        reels: "릴스 동영상",
        shorts: "쇼츠 동영상",
        videos: "동영상",
        externalPlatform: "외부 플랫폼",
      },
      campaignPerformance: {
        title: "캠페인 효과 지표",
        approvalRate: "승인율",
        completionRate: "완료율",
        uploadRate: "SNS 업로드율",
        platformDistribution: "플랫폼 분포",
      },
    },
    
    // 확정 크리에이터 보고서
    confirmedCreatorsReport: {
      title: "전체 캠페인 확정 크리에이터",
      description: "전체 캠페인의 확정 크리에이터 관리",
      confirmedCreators: "확정 크리에이터",
      shipped: "발송 완료",
      confirmed: "확정됨",
      management: "관리",
      unitReward: "단위 리워드",
      totalReward: "총 리워드",
      notShipped: "미발송",
      approvalDate: "승인일",
      phone: "전화번호",
      postalCode: "우편번호",
      address: "주소",
      shippingAddress: "배송지 주소",
      shippingDate: "발송일",
      shippingStatus: "배송 상태",
      shippingManagement: "배송 관리",
      shippingDescription: "확정 크리에이터에게 상품 발송 정보를 입력해주세요.",
      editShipping: "배송 정보 편집",
      enterTracking: "배송 번호 입력",
      track: "추적",
      trackingUpdated: "배송 정보가 업데이트되었습니다",
      trackingUrl: "추적 URL",
      noCreators: "확정 크리에이터가 없습니다",
      noCreatorsDescription: "아직 승인된 크리에이터가 없습니다.",
      shippingInfo: {
        title: "배송 정보 관리",
        description: "확정 크리에이터에게 상품 발송 정보를 입력해주세요.",
        trackingNumber: "배송 추적 번호",
        trackingNumberPlaceholder: "예: 123456789012",
        trackingNumberHelp: "일본 우체국, 야마토 운송, 사가와 택배 등의 추적 번호를 입력해주세요.",
        shippingAddress: "배송지 주소",
        editShippingInfo: "배송 정보 편집",
        enterTrackingNumber: "배송 번호 입력",
        shippedStatus: "발송 완료",
      },
      noCreators: {
        title: "확정 크리에이터가 없습니다",
        description: "아직 승인된 크리에이터가 없습니다.",
      },
    },
    
    // SNS 업로드 최종 보고서
    snsUploadReport: {
      title: "전체 캠페인 SNS 업로드",
      description: "SNS 업로드 최종 보고서",
      finalReport: "최종 보고서",
      completedCreators: "완료 크리에이터",
      totalUploads: "총 업로드 수",
      platformStats: "플랫폼별 업로드 통계",
      uploadedContentList: "업로드된 콘텐츠 목록",
      uploadedContentDescription: "크리에이터가 업로드한 SNS 콘텐츠의 상세 정보",
      uploadDate: "업로드 날짜",
      completed: "완료",
      watch: "시청",
      visit: "방문",
      notes: "비고",
    },
  },
  
  // 일본어 번역
  ja: {
    // 공통
    common: {
      loading: "読み込み中...",
      error: "エラーが発生しました。",
      back: "戻る",
      save: "保存",
      cancel: "キャンセル",
      download: "ダウンロード",
      print: "印刷",
      view: "表示",
      edit: "編集",
      delete: "削除",
      search: "検索",
      filter: "フィルター",
      all: "全て",
      yes: "はい",
      no: "いいえ",
      success: "成功",
      failed: "失敗",
      retry: "再試行",
      period: "期間",
      status: "状態",
      date: "日付",
      name: "名前",
      address: "住所",
      postalCode: "郵便番号",
      currency: "円",
    },
    
    // 회사 보고서
    companyReport: {
      title: "{name} キャンペーンレポート",
      description: "キャンペーンの成果と分析データを確認できます",
      downloadReport: "レポートダウンロード",
      period: {
        label: "期間",
        all: "全期間",
        past7days: "過去7日",
        past30days: "過去30日",
        past90days: "過去90日",
        past1year: "過去1年",
      },
      campaign: {
        label: "キャンペーン",
        all: "全キャンペーン",
        period: "期間",
        status: "ステータス",
        active: "進行中",
        completed: "完了",
        draft: "下書き",
        closed: "終了",
      },
      tabs: {
        overview: "概要",
        campaigns: "キャンペーン",
        influencers: "インフルエンサー",
        analytics: "分析",
      },
      metrics: {
        totalApplications: "総応募数",
        approvedCount: "承認数",
        approvalRate: "承認率",
        completedCount: "完了数",
        completionRate: "完了率",
        totalReward: "総報酬",
        averageReward: "平均報酬",
      },
      status: {
        pending: "待機中",
        approved: "承認済み",
        rejected: "拒否",
        completed: "完了",
        cancelled: "キャンセル",
      },
      charts: {
        statusDistribution: "応募状態分布",
        dailyApplications: "日別応募推移",
        count: "件数",
      },
      sns: {
        totalUploads: "総アップロード",
        instagram: "Instagram",
        tiktok: "TikTok",
        youtube: "YouTube",
        other: "その他",
        reels: "リール動画",
        shorts: "ショート動画",
        videos: "動画",
        externalPlatform: "外部プラットフォーム",
      },
      campaignPerformance: {
        title: "キャンペーン効果指標",
        approvalRate: "承認率",
        completionRate: "完了率",
        uploadRate: "SNSアップロード率",
        platformDistribution: "プラットフォーム分布",
      },
    },
    
    // 확정 크리에이터 보고서
    confirmedCreatorsReport: {
      title: "全キャンペーン確定クリエイター",
      description: "全キャンペーンの確定クリエイター管理",
      confirmedCreators: "確定クリエイター",
      shipped: "発送済み",
      confirmed: "確定済み",
      management: "管理",
      unitReward: "単位リワード",
      totalReward: "総リワード",
      notShipped: "未発送",
      approvalDate: "承認日",
      phone: "電話番号",
      postalCode: "郵便番号",
      address: "住所",
      shippingAddress: "配送先住所",
      shippingDate: "発送日",
      shippingStatus: "配送状況",
      shippingManagement: "配送管理",
      shippingDescription: "確定クリエイターへの商品発送情報を入力してください。",
      editShipping: "配送情報編集",
      enterTracking: "配送番号入力",
      track: "追跡",
      trackingUpdated: "配送情報が更新されました",
      trackingUrl: "追跡URL",
      noCreators: "確定クリエイターがいません",
      noCreatorsDescription: "まだ承認されたクリエイターがいません。",
      shippingInfo: {
        title: "配送情報管理",
        description: "確定クリエイターへの商品発送情報を入力してください。",
        trackingNumber: "配送追跡番号",
        trackingNumberPlaceholder: "例: 123456789012",
        trackingNumberHelp: "日本郵便、ヤマト運輸、佐川急便などの追跡番号を入力してください。",
        shippingAddress: "配送先住所",
        editShippingInfo: "配送情報編集",
        enterTrackingNumber: "配送番号入力",
        shippedStatus: "発送済み",
      },
      noCreators: {
        title: "確定クリエイターがいません",
        description: "まだ承認されたクリエイターがいません。",
      },
    },
    
    // SNS 업로드 최종 보고서
    snsUploadReport: {
      title: "全キャンペーンSNSアップロード",
      description: "SNSアップロード最終報告書",
      finalReport: "最終報告書",
      completedCreators: "完了クリエイター",
      totalUploads: "総アップロード数",
      platformStats: "プラットフォーム別アップロード統計",
      uploadedContentList: "アップロード済みコンテンツ一覧",
      uploadedContentDescription: "クリエイターがアップロードしたSNSコンテンツの詳細",
      uploadDate: "アップロード日",
      completed: "完了",
      watch: "視聴",
      visit: "訪問",
      notes: "備考",
    },
  },
  
  // 영어 번역
  en: {
    // 공통
    common: {
      loading: "Loading...",
      error: "An error occurred.",
      back: "Back",
      save: "Save",
      cancel: "Cancel",
      download: "Download",
      print: "Print",
      view: "View",
      edit: "Edit",
      delete: "Delete",
      search: "Search",
      filter: "Filter",
      all: "All",
      yes: "Yes",
      no: "No",
      success: "Success",
      failed: "Failed",
      retry: "Retry",
      period: "Period",
      status: "Status",
      date: "Date",
      name: "Name",
      address: "Address",
      postalCode: "Postal Code",
      currency: "JPY",
    },
    
    // 회사 보고서
    companyReport: {
      title: "{name} Campaign Report",
      description: "Check campaign performance and analytics data",
      downloadReport: "Download Report",
      period: {
        label: "Period",
        all: "All Time",
        past7days: "Past 7 Days",
        past30days: "Past 30 Days",
        past90days: "Past 90 Days",
        past1year: "Past 1 Year",
      },
      campaign: {
        label: "Campaign",
        all: "All Campaigns",
        period: "Period",
        status: "Status",
        active: "Active",
        completed: "Completed",
        draft: "Draft",
        closed: "Closed",
      },
      tabs: {
        overview: "Overview",
        campaigns: "Campaigns",
        influencers: "Influencers",
        analytics: "Analytics",
      },
      metrics: {
        totalApplications: "Total Applications",
        approvedCount: "Approved Count",
        approvalRate: "Approval Rate",
        completedCount: "Completed Count",
        completionRate: "Completion Rate",
        totalReward: "Total Reward",
        averageReward: "Average Reward",
      },
      status: {
        pending: "Pending",
        approved: "Approved",
        rejected: "Rejected",
        completed: "Completed",
        cancelled: "Cancelled",
      },
      charts: {
        statusDistribution: "Application Status Distribution",
        dailyApplications: "Daily Application Trend",
        count: "Count",
      },
      sns: {
        totalUploads: "Total Uploads",
        instagram: "Instagram",
        tiktok: "TikTok",
        youtube: "YouTube",
        other: "Other",
        reels: "Reels Video",
        shorts: "Short Video",
        videos: "Videos",
        externalPlatform: "External Platform",
      },
      campaignPerformance: {
        title: "Campaign Performance Metrics",
        approvalRate: "Approval Rate",
        completionRate: "Completion Rate",
        uploadRate: "SNS Upload Rate",
        platformDistribution: "Platform Distribution",
      },
    },
    
    // 확정 크리에이터 보고서
    confirmedCreatorsReport: {
      title: "All Campaign Confirmed Creators",
      description: "Manage confirmed creators for all campaigns",
      confirmedCreators: "Confirmed Creators",
      shipped: "Shipped",
      confirmed: "Confirmed",
      management: "Management",
      unitReward: "Unit Reward",
      totalReward: "Total Reward",
      notShipped: "Not Shipped",
      approvalDate: "Approval Date",
      phone: "Phone Number",
      postalCode: "Postal Code",
      address: "Address",
      shippingAddress: "Shipping Address",
      shippingDate: "Shipping Date",
      shippingStatus: "Shipping Status",
      shippingManagement: "Shipping Management",
      shippingDescription: "Enter shipping information for confirmed creators.",
      editShipping: "Edit Shipping Info",
      enterTracking: "Enter Tracking Number",
      track: "Track",
      trackingUpdated: "Shipping information updated",
      trackingUrl: "Tracking URL",
      noCreators: "No Confirmed Creators",
      noCreatorsDescription: "There are no approved creators yet.",
      shippingInfo: {
        title: "Shipping Information Management",
        description: "Enter shipping information for confirmed creators.",
        trackingNumber: "Tracking Number",
        trackingNumberPlaceholder: "Example: 123456789012",
        trackingNumberHelp: "Enter tracking number from Japan Post, Yamato Transport, Sagawa Express, etc.",
        shippingAddress: "Shipping Address",
        editShippingInfo: "Edit Shipping Info",
        enterTrackingNumber: "Enter Tracking Number",
        shippedStatus: "Shipped",
      },
      noCreators: {
        title: "No Confirmed Creators",
        description: "There are no approved creators yet.",
      },
    },
    
    // SNS 업로드 최종 보고서
    snsUploadReport: {
      title: "All Campaign SNS Uploads",
      description: "SNS Upload Final Report",
      finalReport: "Final Report",
      completedCreators: "Completed Creators",
      totalUploads: "Total Uploads",
      platformStats: "Platform Upload Statistics",
      uploadedContentList: "Uploaded Content List",
      uploadedContentDescription: "Details of SNS content uploaded by creators",
      uploadDate: "Upload Date",
      completed: "Completed",
      watch: "Watch",
      visit: "Visit",
      notes: "Notes",
    },
  },
};

// 현재 언어 설정 (기본값: 한국어)
let currentLanguage = 'ko';

// 언어 변경 함수
const setLanguage = (lang) => {
  if (translations[lang]) {
    currentLanguage = lang;
    // 로컬 스토리지에 언어 설정 저장
    localStorage.setItem('language', lang);
    return true;
  }
  return false;
};

// 번역 텍스트 가져오기
const t = (key, params = {}) => {
  const keys = key.split('.');
  let value = translations[currentLanguage];
  
  // 키 경로를 따라 번역 값 찾기
  for (const k of keys) {
    if (value && value[k]) {
      value = value[k];
    } else {
      // 번역이 없으면 키 반환
      return key;
    }
  }
  
  // 파라미터 치환
  if (typeof value === 'string') {
    Object.keys(params).forEach(param => {
      value = value.replace(`{${param}}`, params[param]);
    });
  }
  
  return value;
};

// 초기화 함수 - 로컬 스토리지에서 언어 설정 불러오기
const initLanguage = () => {
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage && translations[savedLanguage]) {
    currentLanguage = savedLanguage;
  }
};

// 지원 언어 목록
const supportedLanguages = [
  { code: 'ko', name: '한국어' },
  { code: 'ja', name: '日本語' },
  { code: 'en', name: 'English' }
];

// 현재 언어 코드 가져오기
const getCurrentLanguage = () => currentLanguage;

// 초기화
initLanguage();

export default {
  t,
  setLanguage,
  getCurrentLanguage,
  supportedLanguages
};
