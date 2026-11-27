export interface Policy {
  version: number
  title: string
  content: string
}

export interface ConsentStatus {
  shouldShowModal: boolean
  policy: Policy
}
