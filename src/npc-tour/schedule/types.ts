

export type TourDataType ={
  defaultShow:TourDayType
  shows: TourDayType[]
}

export type TourDayType = {
  refId: string
  startTime: number
  //startTimeMS: number
  length: number
  day: number
  campaigns:TourInstType[],
}
export type TourInstType = {
  refId: string
  campaignId: string
  campaignKey: string
}

export type ShowTypePlayListType = {
  lastShow: TourDayType
  currentShow: TourDayType
  nextShow: TourDayType
}

//export let currentlyPlaying: number | null


export type ShowResultType={
  show?:TourDayType
  offset?: number
  index?: number
}

export type ShowMatchRangeResult = {
  lastShow?: ShowResultType
  currentShow?: ShowResultType
  nextShow?: ShowResultType
}
