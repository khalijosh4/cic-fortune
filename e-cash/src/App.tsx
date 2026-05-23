import { Routes, Route, Navigate } from "react-router-dom"
import { AppLayout } from "@/components/layouts/app-layout"
import { OnboardingPage } from "@/pages/onboarding"
import { LoginPage } from "@/pages/login"
import { HomePage } from "@/pages/home"
import { FundsTransferPage } from "@/pages/funds-transfer"
import { LoansPage } from "@/pages/loans"
import { SettingsPage } from "@/pages/settings"
import { CustomerRequestsPage } from "@/pages/customer-requests"
import { TransactionsPage } from "@/pages/transactions"
import { TransactionDetailPage } from "@/pages/transaction-detail"
import { ReceivePage } from "@/pages/receive"
import { PayBillsPage } from "@/pages/pay-bills"
import { TopUpPage } from "@/pages/top-up"
import { LoanDetailPage } from "@/pages/loan-detail"
import { RequestDetailPage } from "@/pages/request-detail"
import { BeneficiariesPage } from "@/pages/beneficiaries"
import { AddBeneficiaryPage } from "@/pages/add-beneficiary"
import { BeneficiaryDetailPage } from "@/pages/beneficiary-detail"
import { ProfilePage } from "@/pages/profile"

export function App() {
  return (
    <Routes>
      <Route path="/" element={<OnboardingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppLayout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/transfer" element={<FundsTransferPage />} />
        <Route path="/loans" element={<LoansPage />} />
        <Route path="/requests" element={<CustomerRequestsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/transactions/:id" element={<TransactionDetailPage />} />
        <Route path="/receive" element={<ReceivePage />} />
        <Route path="/pay-bills" element={<PayBillsPage />} />
        <Route path="/top-up" element={<TopUpPage />} />
        <Route path="/loans/:id" element={<LoanDetailPage />} />
        <Route path="/requests/:id" element={<RequestDetailPage />} />
        <Route path="/beneficiaries" element={<BeneficiariesPage />} />
        <Route path="/beneficiaries/add" element={<AddBeneficiaryPage />} />
        <Route path="/beneficiaries/:id" element={<BeneficiaryDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
