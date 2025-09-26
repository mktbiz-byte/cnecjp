import React, { useState, useEffect } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { database } from '../../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Loader2, Plus, Edit, Save, X, ExternalLink, 
  AlertCircle, CheckCircle, Link as LinkIcon, 
  FileText, Folder, Users
} from 'lucide-react'

const CreatorMaterialsManager = ({ campaignId, applications }) => {
  const { language } = useLanguage()
  
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [selectedCreator, setSelectedCreator] = useState(null)
  const [materialModal, setMaterialModal] = useState(false)
  
  const [materialForm, setMaterialForm] = useState({
    google_drive_url: '',
    google_slides_url: '',
    additional_notes: ''
  })

  // 승인된 크리에이터만 필터링
  const approvedCreators = applications.filter(app => app.status === 'approved')

  useEffect(() => {
    if (campaignId) {
      loadMaterials()
    }
  }, [campaignId])

  const loadMaterials = async () => {
    try {
      setLoading(true)
      setError('')
      
      const { data, error } = await database.supabase
        .from('creator_materials')
        .select('*')
        .eq('campaign_id', campaignId)
      
      if (error) throw error
      setMaterials(data || [])
      
    } catch (error) {
      console.error('Load materials error:', error)
      setError(language === 'ko' 
        ? '자료를 불러올 수 없습니다.'
        : '資料を読み込めません。'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSaveMaterials = async () => {
    try {
      setProcessing(true)
      setError('')
      
      if (!selectedCreator) return
      
      const materialData = {
        campaign_id: campaignId,
        creator_id: selectedCreator.user_id,
        application_id: selectedCreator.id,
        google_drive_url: materialForm.google_drive_url,
        google_slides_url: materialForm.google_slides_url,
        additional_notes: materialForm.additional_notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // 기존 자료가 있는지 확인
      const existingMaterial = materials.find(m => m.creator_id === selectedCreator.user_id)
      
      if (existingMaterial) {
        // 업데이트
        const { error } = await database.supabase
          .from('creator_materials')
          .update({
            google_drive_url: materialForm.google_drive_url,
            google_slides_url: materialForm.google_slides_url,
            additional_notes: materialForm.additional_notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingMaterial.id)
        
        if (error) throw error
      } else {
        // 새로 생성
        const { error } = await database.supabase
          .from('creator_materials')
          .insert([materialData])
        
        if (error) throw error
      }
      
      setSuccess(language === 'ko' 
        ? '크리에이터 자료가 저장되었습니다.'
        : 'クリエイター資料が保存されました。'
      )
      
      await loadMaterials()
      setMaterialModal(false)
      resetForm()
      
    } catch (error) {
      console.error('Save materials error:', error)
      setError(language === 'ko' 
        ? '자료 저장 중 오류가 발생했습니다.'
        : '資料保存中にエラーが発生しました。'
      )
    } finally {
      setProcessing(false)
    }
  }

  const openMaterialModal = (creator) => {
    setSelectedCreator(creator)
    
    // 기존 자료가 있으면 폼에 로드
    const existingMaterial = materials.find(m => m.creator_id === creator.user_id)
    if (existingMaterial) {
      setMaterialForm({
        google_drive_url: existingMaterial.google_drive_url || '',
        google_slides_url: existingMaterial.google_slides_url || '',
        additional_notes: existingMaterial.additional_notes || ''
      })
    } else {
      resetForm()
    }
    
    setMaterialModal(true)
  }

  const resetForm = () => {
    setMaterialForm({
      google_drive_url: '',
      google_slides_url: '',
      additional_notes: ''
    })
    setSelectedCreator(null)
  }

  const getCreatorMaterial = (creatorId) => {
    return materials.find(m => m.creator_id === creatorId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {language === 'ko' ? '크리에이터 자료 관리' : 'クリエイター資料管理'}
          </h3>
          <p className="text-sm text-gray-600">
            {language === 'ko' 
              ? '승인된 크리에이터에게 개별 Google Drive/Slides 링크를 제공하세요.'
              : '承認されたクリエイターに個別のGoogle Drive/Slidesリンクを提供してください。'
            }
          </p>
        </div>
        <Badge variant="outline">
          {language === 'ko' ? `승인된 크리에이터: ${approvedCreators.length}명` : `承認済み: ${approvedCreators.length}人`}
        </Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {approvedCreators.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">
                {language === 'ko' 
                  ? '승인된 크리에이터가 없습니다.'
                  : '承認されたクリエイターがいません。'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          approvedCreators.map((creator) => {
            const material = getCreatorMaterial(creator.user_id)
            const hasMaterials = material && (material.google_drive_url || material.google_slides_url)
            
            return (
              <Card key={creator.id} className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{creator.name}</CardTitle>
                      <CardDescription>{creator.email}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {hasMaterials ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          {language === 'ko' ? '자료 제공됨' : '資料提供済み'}
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          {language === 'ko' ? '자료 미제공' : '資料未提供'}
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        onClick={() => openMaterialModal(creator)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        {language === 'ko' ? '자료 관리' : '資料管理'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {hasMaterials && (
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {material.google_drive_url && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Folder className="h-4 w-4 text-blue-600" />
                          <span>Google Drive:</span>
                          <a 
                            href={material.google_drive_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center"
                          >
                            {language === 'ko' ? '링크 열기' : 'リンクを開く'}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      )}
                      {material.google_slides_url && (
                        <div className="flex items-center space-x-2 text-sm">
                          <FileText className="h-4 w-4 text-orange-600" />
                          <span>Google Slides:</span>
                          <a 
                            href={material.google_slides_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center"
                          >
                            {language === 'ko' ? '링크 열기' : 'リンクを開く'}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      )}
                      {material.additional_notes && (
                        <div className="text-sm text-gray-600 mt-2">
                          <strong>{language === 'ko' ? '추가 메모:' : '追加メモ:'}</strong> {material.additional_notes}
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })
        )}
      </div>

      {/* 자료 관리 모달 */}
      <Dialog open={materialModal} onOpenChange={setMaterialModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {language === 'ko' ? '크리에이터 자료 관리' : 'クリエイター資料管理'}
            </DialogTitle>
            <DialogDescription>
              {selectedCreator && (
                <>
                  {language === 'ko' 
                    ? `${selectedCreator.name}님에게 제공할 자료 링크를 설정하세요.`
                    : `${selectedCreator.name}さんに提供する資料リンクを設定してください。`
                  }
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="google_drive_url">
                <Folder className="h-4 w-4 inline mr-2" />
                Google Drive URL
              </Label>
              <Input
                id="google_drive_url"
                value={materialForm.google_drive_url}
                onChange={(e) => setMaterialForm(prev => ({ ...prev, google_drive_url: e.target.value }))}
                placeholder="https://drive.google.com/drive/folders/..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="google_slides_url">
                <FileText className="h-4 w-4 inline mr-2" />
                Google Slides URL
              </Label>
              <Input
                id="google_slides_url"
                value={materialForm.google_slides_url}
                onChange={(e) => setMaterialForm(prev => ({ ...prev, google_slides_url: e.target.value }))}
                placeholder="https://docs.google.com/presentation/..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="additional_notes">
                {language === 'ko' ? '추가 메모' : '追加メモ'}
              </Label>
              <Input
                id="additional_notes"
                value={materialForm.additional_notes}
                onChange={(e) => setMaterialForm(prev => ({ ...prev, additional_notes: e.target.value }))}
                placeholder={language === 'ko' ? '크리에이터에게 전달할 추가 정보' : 'クリエイターに伝える追加情報'}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={handleSaveMaterials}
                disabled={processing || (!materialForm.google_drive_url && !materialForm.google_slides_url)}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {language === 'ko' ? '저장' : '保存'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setMaterialModal(false)
                  resetForm()
                }}
              >
                <X className="h-4 w-4 mr-2" />
                {language === 'ko' ? '취소' : 'キャンセル'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CreatorMaterialsManager
