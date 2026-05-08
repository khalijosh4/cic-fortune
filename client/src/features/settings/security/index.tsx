import { ContentSection } from '../components/content-section'
import { SecurityForm } from './security-form'

export default function SettingsSecurity() {
  return (
    <ContentSection
      title='Security'
      desc='Manage your account security and update your password.'
    >
      <SecurityForm />
    </ContentSection>
  )
}
