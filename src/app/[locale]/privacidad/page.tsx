import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'
import { legalContent } from '@/data/legal-content'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return { title: `${legalContent[locale === 'en' ? 'en' : 'es'].privacy.title} | Ale Gerez Coach` }
}

export default async function PrivacidadPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return <LegalPage locale={locale} kind="privacy" />
}
