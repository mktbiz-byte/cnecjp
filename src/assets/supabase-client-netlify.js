// Netlify 환경에 최적화된 Supabase 클라이언트
console.log('🚀 Netlify 최적화 Supabase 클라이언트 로드 시작');

// Supabase 설정 (Netlify 환경 변수 또는 하드코딩)
const SUPABASE_URL = 'https://psfwmzlnaboattocyupu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZndtemxuYWJvYXR0b2N5dXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MTU2NzgsImV4cCI6MjA3NDE5MTY3OH0.59A4QPRwv8YjfasHu_NTTv0fH6YhG8L_mBkOZypfgwg';

// 전역 변수
let supabaseClient = null;
let isInitialized = false;

// Netlify 환경 감지
const isNetlify = window.location.hostname.includes('netlify.app') || 
                  window.location.hostname.includes('netlify.com');

console.log('환경 감지:', isNetlify ? 'Netlify' : 'Local');

// Supabase 클라이언트 초기화 (Netlify 최적화)
async function initializeSupabase() {
    if (isInitialized && supabaseClient) {
        return supabaseClient;
    }

    try {
        console.log('🔄 Netlify 환경에서 Supabase 클라이언트 초기화 시작...');

        // Supabase 라이브러리 로드 대기 (Netlify에서 더 긴 대기 시간)
        let attempts = 0;
        const maxAttempts = isNetlify ? 100 : 50; // Netlify에서 더 긴 대기
        
        while (typeof window.supabase === 'undefined' && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, isNetlify ? 200 : 100));
            attempts++;
        }

        if (typeof window.supabase === 'undefined') {
            throw new Error('Supabase 라이브러리를 로드할 수 없습니다. CDN 연결을 확인하세요.');
        }

        console.log('✅ Supabase 라이브러리 로드 완료');

        // Netlify 환경에 최적화된 클라이언트 설정
        const clientOptions = {
            auth: {
                redirectTo: window.location.origin,
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: false, // Netlify에서 URL 감지 비활성화
                flowType: 'implicit' // Netlify에서 더 안정적
            },
            global: {
                headers: {
                    'X-Client-Info': 'netlify-deployment'
                }
            }
        };

        // 클라이언트 생성
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, clientOptions);

        // 연결 테스트
        const { data, error } = await supabaseClient.from('campaigns').select('count').limit(1);
        
        if (error && error.code !== 'PGRST116') { // PGRST116은 빈 테이블 오류 (정상)
            console.warn('⚠️ 연결 테스트 경고:', error.message);
        } else {
            console.log('✅ 데이터베이스 연결 테스트 성공');
        }

        isInitialized = true;
        console.log('✅ Netlify 환경에서 Supabase 클라이언트 초기화 완료');
        
        return supabaseClient;

    } catch (error) {
        console.error('❌ Netlify 환경에서 Supabase 초기화 실패:', error);
        
        // Netlify 환경에서 자주 발생하는 문제들 안내
        console.error(`
        Netlify 환경에서 자주 발생하는 문제들:
        1. CORS 정책: Supabase에서 ${window.location.origin} 도메인 허용 필요
        2. HTTPS 강제: 모든 리소스가 HTTPS여야 함
        3. 환경 변수: Netlify 대시보드에서 환경 변수 설정 필요
        4. 빌드 설정: netlify.toml 파일 확인 필요
        `);
        
        throw error;
    }
}

// Supabase 클라이언트 가져오기
async function getSupabaseClient() {
    if (!supabaseClient) {
        await initializeSupabase();
    }
    return supabaseClient;
}

// Netlify 최적화 Supabase API 래퍼
const supabaseAPI = {
    client: null,

    // 초기화
    async init() {
        try {
            this.client = await getSupabaseClient();
            console.log('✅ Netlify 환경에서 Supabase API 래퍼 초기화 완료');
            return this.client;
        } catch (error) {
            console.error('❌ Netlify 환경에서 Supabase API 래퍼 초기화 실패:', error);
            throw error;
        }
    },

    // 인증 상태 확인
    async checkAuthStatus() {
        try {
            const client = await getSupabaseClient();
            const { data: { session }, error } = await client.auth.getSession();
            
            if (error) {
                console.error('❌ 인증 상태 확인 오류:', error);
                return null;
            }
            
            return session;
        } catch (error) {
            console.error('❌ 인증 상태 확인 실패:', error);
            return null;
        }
    },

    // 로그아웃
    async signOut() {
        try {
            const client = await getSupabaseClient();
            const { error } = await client.auth.signOut();
            
            if (error) {
                console.error('❌ 로그아웃 오류:', error);
                return { error };
            }
            
            console.log('✅ 로그아웃 성공');
            return { error: null };
        } catch (error) {
            console.error('❌ 로그아웃 실패:', error);
            return { error };
        }
    },

    // 캠페인 목록 조회 (Netlify 최적화)
    async getCampaigns() {
        try {
            console.log('📋 Netlify에서 캠페인 목록 조회 시작');
            
            const client = await getSupabaseClient();
            
            // Netlify 환경에서 더 안정적인 쿼리
            const { data, error } = await client
                .from('campaigns')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100); // 제한을 두어 성능 향상
            
            if (error) {
                console.error('❌ 캠페인 목록 조회 오류:', error);
                
                // 일반적인 오류 해결 안내
                if (error.code === 'PGRST301') {
                    console.error('테이블이 존재하지 않습니다. Supabase에서 campaigns 테이블을 생성하세요.');
                } else if (error.message.includes('JWT')) {
                    console.error('인증 오류입니다. API 키를 확인하세요.');
                } else if (error.message.includes('CORS')) {
                    console.error('CORS 오류입니다. Supabase에서 도메인을 허용하세요.');
                }
            } else {
                console.log('✅ Netlify에서 캠페인 목록 조회 성공:', data?.length || 0, '개');
            }
            
            return { data, error };
            
        } catch (error) {
            console.error('❌ getCampaigns 네트워크 오류:', error);
            return { data: null, error };
        }
    },

    // 특정 캠페인 조회
    async getCampaignById(id) {
        try {
            console.log('📋 Netlify에서 캠페인 조회 시작, ID:', id);
            
            const client = await getSupabaseClient();
            const { data, error } = await client
                .from('campaigns')
                .select('*')
                .eq('id', id)
                .single();
            
            console.log('📋 캠페인 조회 결과:', { data, error });
            return { data, error };
            
        } catch (error) {
            console.error('❌ getCampaignById 오류:', error);
            return { data: null, error };
        }
    },

    // 캠페인 생성 (Netlify 최적화)
    async createCampaign(campaignData) {
        try {
            console.log('📝 Netlify에서 캠페인 생성 시작:', campaignData);
            
            const client = await getSupabaseClient();
            
            // 데이터 검증
            if (!campaignData.title || !campaignData.brand || !campaignData.reward_amount) {
                const errorMsg = '필수 필드가 누락되었습니다: title, brand, reward_amount';
                console.error('❌', errorMsg);
                return { data: null, error: { message: errorMsg } };
            }
            
            // Netlify 환경에 최적화된 데이터 정리
            const cleanData = {
                title: String(campaignData.title).trim(),
                brand_name: String(campaignData.brand).trim(),
                description: String(campaignData.description || '').trim(),
                reward_amount: parseInt(campaignData.reward_amount) || 0,
                platforms: Array.isArray(campaignData.platforms) ? campaignData.platforms : [],
                min_followers: parseInt(campaignData.min_followers) || 1000,
                min_posts_per_week: parseInt(campaignData.min_posts_per_week) || 3,
                questions: campaignData.questions || null,
                status: campaignData.status || 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            console.log('정리된 데이터:', cleanData);
            
            // Netlify 환경에서 더 안정적인 삽입
            const { data, error } = await client
                .from('campaigns')
                .insert([cleanData])
                .select()
                .single();
            
            if (error) {
                console.error('❌ Netlify에서 캠페인 생성 실패:', error);
                
                // 상세한 오류 분석
                if (error.code === '23505') {
                    console.error('중복 데이터 오류: 동일한 캠페인이 이미 존재합니다.');
                } else if (error.code === '23502') {
                    console.error('필수 필드 누락: 데이터베이스 스키마를 확인하세요.');
                } else if (error.code === '42501') {
                    console.error('권한 오류: RLS 정책을 확인하세요.');
                }
            } else {
                console.log('✅ Netlify에서 캠페인 생성 성공!', data);
            }
            
            return { data, error };
            
        } catch (error) {
            console.error('❌ createCampaign 네트워크 오류:', error);
            return { data: null, error };
        }
    },

    // 캠페인 업데이트
    async updateCampaign(id, updateData) {
        try {
            console.log('🔄 Netlify에서 캠페인 업데이트 시작:', { id, updateData });
            
            const client = await getSupabaseClient();
            
            const cleanData = {
                ...updateData,
                updated_at: new Date().toISOString()
            };
            
            const { data, error } = await client
                .from('campaigns')
                .update(cleanData)
                .eq('id', id)
                .select()
                .single();
            
            console.log('📋 캠페인 업데이트 결과:', { data, error });
            return { data, error };
            
        } catch (error) {
            console.error('❌ updateCampaign 오류:', error);
            return { data: null, error };
        }
    },

    // 캠페인 삭제
    async deleteCampaign(id) {
        try {
            console.log('🗑️ Netlify에서 캠페인 삭제 시작, ID:', id);
            
            const client = await getSupabaseClient();
            const { data, error } = await client
                .from('campaigns')
                .delete()
                .eq('id', id)
                .select()
                .single();
            
            console.log('📋 캠페인 삭제 결과:', { data, error });
            return { data, error };
            
        } catch (error) {
            console.error('❌ deleteCampaign 오류:', error);
            return { data: null, error };
        }
    },

    // 응모 목록 조회
    async getApplications() {
        try {
            console.log('📋 Netlify에서 응모 목록 조회 시작');
            
            const client = await getSupabaseClient();
            const { data, error } = await client
                .from('applications')
                .select(`
                    *,
                    campaigns (
                        id,
                        title,
                        brand_name,
                        reward_amount
                    ),
                    creators (
                        id,
                        name,
                        email,
                        instagram_username,
                        tiktok_username,
                        youtube_username
                    )
                `)
                .order('created_at', { ascending: false })
                .limit(100);
            
            console.log('📋 응모 목록 조회 결과:', { data, error });
            return { data, error };
            
        } catch (error) {
            console.error('❌ getApplications 오류:', error);
            return { data: null, error };
        }
    }
};

// Netlify 환경에서 자동 초기화 (더 안정적)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            console.log('🚀 Netlify 환경에서 Supabase API 자동 초기화 시작');
            await supabaseAPI.init();
            console.log('✅ Netlify 환경에서 Supabase API 자동 초기화 완료');
        } catch (error) {
            console.error('❌ Netlify 환경에서 Supabase API 자동 초기화 실패:', error);
        }
    });
} else {
    // 이미 로드된 경우 즉시 초기화
    setTimeout(async () => {
        try {
            console.log('🚀 Netlify 환경에서 Supabase API 지연 초기화 시작');
            await supabaseAPI.init();
            console.log('✅ Netlify 환경에서 Supabase API 지연 초기화 완료');
        } catch (error) {
            console.error('❌ Netlify 환경에서 Supabase API 지연 초기화 실패:', error);
        }
    }, 1000);
}

// 전역 객체로 노출
window.supabaseAPI = supabaseAPI;
window.getSupabaseClient = getSupabaseClient;

console.log('📦 Netlify 최적화 Supabase API 래퍼 로드 완료');
