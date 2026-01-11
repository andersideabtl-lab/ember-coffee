'use client';

import { useState, useEffect } from 'react';
import { getContacts, deleteContact } from '@/app/actions/admin';
import { type Contact } from '@/lib/supabase';
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  Calendar, 
  User, 
  Lock,
  RefreshCw,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    
    if (!adminPassword) {
      setError('관리자 비밀번호가 설정되지 않았습니다.');
      return;
    }
    
    if (password === adminPassword) {
      setIsAuthenticated(true);
      setPassword('');
      loadContacts();
    } else {
      setError('비밀번호가 올바르지 않습니다.');
    }
  };

  const loadContacts = async () => {
    setLoading(true);
    setError(null);
    const result = await getContacts();
    
    if (result.success && result.data) {
      setContacts(result.data);
    } else {
      setError(result.error || '문의 목록을 불러올 수 없습니다.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadContacts();
    }
  }, [isAuthenticated]);

  const handleDelete = async (contactId: string, contactName: string) => {
    if (!contactId) return;

    // 확인 창 표시
    const confirmed = window.confirm(
      `"${contactName}"님의 문의 내역을 정말 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`
    );

    if (!confirmed) return;

    setDeletingId(contactId);

    try {
      const result = await deleteContact(contactId);

      if (result.success) {
        toast.success('문의 내역이 삭제되었습니다');
        // 목록 즉시 갱신
        await loadContacts();
      } else {
        toast.error(result.error || '문의 내역 삭제에 실패했습니다.');
      }
    } catch (error) {
      toast.error('예상치 못한 오류가 발생했습니다.');
    } finally {
      setDeletingId(null);
    }
  };

  // 로그인 화면
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <Lock className="h-12 w-12 text-amber-700" />
            </div>
            <CardTitle className="text-2xl text-center">관리자 로그인</CardTitle>
            <CardDescription className="text-center">
              관리자 비밀번호를 입력해주세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="비밀번호"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  className="w-full"
                  autoFocus
                />
                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-amber-700 hover:bg-amber-800 text-white"
              >
                로그인
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 대시보드 화면
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-amber-900 mb-2">
                문의 관리 대시보드
              </h1>
              <p className="text-gray-600">
                접수된 문의사항을 확인하고 관리할 수 있습니다
              </p>
            </div>
            <Button
              onClick={loadContacts}
              disabled={loading}
              className="bg-amber-700 hover:bg-amber-800 text-white"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
          </div>
        </div>

        {loading && contacts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-amber-700 mx-auto mb-4" />
              <p className="text-gray-600">문의 목록을 불러오는 중...</p>
            </CardContent>
          </Card>
        ) : error && contacts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        ) : contacts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">접수된 문의가 없습니다</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>문의 목록 ({contacts.length}건)</CardTitle>
              <CardDescription>최신순으로 정렬된 문의사항 목록</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          이름
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          이메일
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          연락처
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          메시지
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          접수일시
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-24">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact) => (
                      <tr
                        key={contact.id}
                        className="border-b border-gray-100 hover:bg-amber-50 transition-colors"
                      >
                        <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                          {contact.name}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-amber-700 hover:text-amber-800 hover:underline"
                          >
                            {contact.email}
                          </a>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          {contact.phone ? (
                            <a
                              href={`tel:${contact.phone}`}
                              className="text-amber-700 hover:text-amber-800 hover:underline"
                            >
                              {contact.phone}
                            </a>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700 max-w-md">
                          <div className="line-clamp-2">{contact.message}</div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {contact.created_at
                            ? new Date(contact.created_at).toLocaleString('ko-KR', {
                                timeZone: 'Asia/Seoul',
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                              })
                            : '-'}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => contact.id && handleDelete(contact.id, contact.name)}
                            disabled={deletingId === contact.id || !contact.id}
                            className="h-8 w-8 p-0"
                            aria-label={`${contact.name}님의 문의 삭제`}
                          >
                            {deletingId === contact.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
