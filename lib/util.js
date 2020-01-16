import moment from 'moment'

moment.locale('zh-cn')

export function getTimeFromNow (time) {
  return moment(time).fromNow()
}