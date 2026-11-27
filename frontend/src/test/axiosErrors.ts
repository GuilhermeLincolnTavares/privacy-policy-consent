import { AxiosError, type AxiosResponse } from 'axios'

export const axiosErrorWithStatus = (status: number): AxiosError =>
  new AxiosError(
    'Request failed',
    AxiosError.ERR_BAD_REQUEST,
    undefined,
    undefined,
    { status } as AxiosResponse,
  )
