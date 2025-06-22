import dayjs from 'dayjs'
// dependent on utc plugin
import customParseFormat from 'dayjs/plugin/customParseFormat'
import duration from 'dayjs/plugin/duration'

import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

export { Duration, DurationUnitType } from 'dayjs/plugin/duration'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)
dayjs.tz.setDefault('America/Los_Angeles')
dayjs.extend(duration)

export default dayjs
