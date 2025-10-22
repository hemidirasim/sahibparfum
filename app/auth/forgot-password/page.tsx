'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [actualEmailSent, setActualEmailSent] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })


      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError)
        const textResponse = await response.text()
        console.error('Response text:', textResponse)
        toast.error('Server cavabında xəta var')
        return
      }

      if (!response.ok) {
        console.error('API error:', data)
        toast.error(data.error || 'Xəta baş verdi')
      } else {
        setEmailSent(true)
        setActualEmailSent(data.emailSent || false)
        if (data.emailSent) {
          toast.success('Şifrə sıfırlama linki email ünvanınıza göndərildi')
        } else {
          toast('Email ünvanınızı yoxladıq. Əgər qeydiyyatdadırsa, link göndəriləcək.', {
            icon: 'ℹ️',
            duration: 4000,
          })
        }
      }
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Şəbəkə xətası. Zəhmət olmasa yenidən cəhd edin.')
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <Link href="/" className="inline-block">
              <img
                className="mx-auto h-12 w-auto"
                src="https://i.ibb.co/cX2Gyv2T/Sahib-Logo-PNG.png"
                alt="Sahib Parfumeriya"
              />
            </Link>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {actualEmailSent ? 'Email göndərildi' : 'Email yoxlandı'}
            </h2>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              {actualEmailSent ? (
                <>
                  <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Şifrə sıfırlama linki göndərildi
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    <strong>{email}</strong> ünvanına şifrə sıfırlama linki göndərdik. 
                    Email qutunuzu yoxlayın və linkə klik edin.
                  </p>
                  <p className="text-xs text-gray-500 mb-6">
                    Email gəlmədisə, spam qovluğunu yoxlayın və ya bir neçə dəqiqə gözləyin.
                  </p>
                </>
              ) : (
                <>
                  <CheckCircle className="mx-auto h-16 w-16 text-blue-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Email ünvanı yoxlandı
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    <strong>{email}</strong> ünvanını yoxladıq. Əgər bu ünvan sistemdə qeydiyyatdadırsa, 
                    şifrə sıfırlama linki göndəriləcək.
                  </p>
                  <p className="text-xs text-gray-500 mb-6">
                    Təhlükəsizlik məqsədi ilə email-in mövcudluğu açıqlanmır.
                  </p>
                </>
              )}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setEmailSent(false)
                    setEmail('')
                  }}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Başqa email ünvanı daxil et
                </button>
                <Link
                  href="/auth/signin"
                  className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Giriş səhifəsinə qayıt
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <img
              className="mx-auto h-12 w-auto"
              src="https://i.ibb.co/cX2Gyv2T/Sahib-Logo-PNG.png"
              alt="Sahib Parfumeriya"
            />
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Şifrəni sıfırla
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Şifrəni sıfırlamaq üçün email ünvanınızı daxil edin
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email ünvanı
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Email ünvanınızı daxil edin"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Göndərilir...
                  </div>
                ) : (
                  'Şifrə sıfırlama linki göndər'
                )}
              </button>
            </div>

            <div className="text-center">
              <Link
                href="/auth/signin"
                className="flex items-center justify-center text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Giriş səhifəsinə qayıt
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
