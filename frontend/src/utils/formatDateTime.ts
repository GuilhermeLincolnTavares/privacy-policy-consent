const DATE_TIME_FORMAT = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export const formatDateTime = (isoDateTime: string): string =>
  DATE_TIME_FORMAT.format(new Date(isoDateTime))
