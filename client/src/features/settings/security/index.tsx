import { ContentSection } from '../components/content-section'
import { SecurityForm } from './security-form'

export default function SettingsSecurity() {
  return (
    <ContentSection
      title='Security'
      desc='Update your password and manage your account security settings.'
    >
      <SecurityForm />
    </ContentSection>
  )
}
