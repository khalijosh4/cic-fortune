export type Beneficiary = {
  id: number
  name: string
  account: string
  bank: string
  initial: string
}

export const beneficiaries: Beneficiary[] = [
  { id: 1, name: "Sarah Kim", account: "**** 4521", bank: "Equity Bank", initial: "S" },
  { id: 2, name: "John Doe", account: "**** 7890", bank: "KCB", initial: "J" },
  { id: 3, name: "Emily Chen", account: "**** 3344", bank: "Co-op Bank", initial: "E" },
  { id: 4, name: "Mike Johnson", account: "**** 1122", bank: "Stanbic Bank", initial: "M" },
  { id: 5, name: "Anna Williams", account: "**** 9988", bank: "Absa Bank", initial: "A" },
]

export type Transaction = {
  id: number
  name: string
  amount: number
  date: string
  type: "send" | "receive" | "payment"
  description?: string
}

export const transactions: Transaction[] = [
  { id: 1, name: "Sarah Kim", amount: -250, date: "Today", type: "send", description: "Dinner payment" },
  { id: 2, name: "Salary Deposit", amount: 4500, date: "Yesterday", type: "receive", description: "Monthly salary" },
  { id: 3, name: "Netflix", amount: -15.99, date: "2 days ago", type: "payment", description: "Monthly subscription" },
  { id: 4, name: "John Doe", amount: -120, date: "3 days ago", type: "send", description: "Rent share" },
  { id: 5, name: "Freelance Payment", amount: 800, date: "5 days ago", type: "receive", description: "Web dev project" },
  { id: 6, name: "Spotify", amount: -9.99, date: "6 days ago", type: "payment", description: "Monthly subscription" },
  { id: 7, name: "Emily Chen", amount: -65, date: "1 week ago", type: "send", description: "Birthday gift" },
  { id: 8, name: "Refund", amount: 49.99, date: "1 week ago", type: "receive", description: "Order cancellation" },
  { id: 9, name: "Uber Ride", amount: -23.50, date: "8 days ago", type: "payment", description: "Airport trip" },
  { id: 10, name: "Client Invoice", amount: 1500, date: "10 days ago", type: "receive", description: "Consulting fee" },
  { id: 11, name: "AWS Hosting", amount: -47.20, date: "12 days ago", type: "payment", description: "Server costs" },
  { id: 12, name: "Mike Johnson", amount: -200, date: "2 weeks ago", type: "send", description: "Loan repayment" },
  { id: 13, name: "Dividend Payout", amount: 125, date: "2 weeks ago", type: "receive", description: "Stock dividends" },
  { id: 14, name: "Grocery Store", amount: -89.35, date: "2 weeks ago", type: "payment", description: "Weekly groceries" },
  { id: 15, name: "Anna Williams", amount: -350, date: "3 weeks ago", type: "send", description: "Invoice payment" },
  { id: 16, name: "Cashback Reward", amount: 12.50, date: "3 weeks ago", type: "receive", description: "Credit card cashback" },
  { id: 17, name: "Electric Bill", amount: -95, date: "3 weeks ago", type: "payment", description: "Monthly utility" },
  { id: 18, name: "Tom Baker", amount: -75, date: "4 weeks ago", type: "send", description: "Concert tickets" },
  { id: 19, name: "Interest Payment", amount: 8.42, date: "4 weeks ago", type: "receive", description: "Savings interest" },
  { id: 20, name: "Phone Plan", amount: -55, date: "4 weeks ago", type: "payment", description: "Monthly cell plan" },
]
