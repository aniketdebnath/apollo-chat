export enum BanDuration {
  OneDay = "1day",
  OneWeek = "1week",
  OneMonth = "1month",
  Permanent = "permanent",
}

export const banDurationLabels: Record<BanDuration, string> = {
  [BanDuration.OneDay]: "1 Day",
  [BanDuration.OneWeek]: "1 Week",
  [BanDuration.OneMonth]: "1 Month",
  [BanDuration.Permanent]: "Permanent",
};
