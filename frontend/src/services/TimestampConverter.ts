export default class TimestampConverter {

   /**
   * Convert milliseconds → hh:mm:ss (time of day, always 00:00:00–23:59:59)
   */
  static msToHMS(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hh = Math.floor(totalSeconds / 3600) % 24;
    const mm = Math.floor((totalSeconds % 3600) / 60);
    const ss = totalSeconds % 60;

    return [
      hh.toString().padStart(2, "0"),
      mm.toString().padStart(2, "0"),
    //   ss.toString().padStart(2, "0"),
    ].join(":");
  }

  /**
   * Convert hh:mm:ss → milliseconds
   */
  static HMSToms(str: string): number {
    const parts = str.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid time format, expected hh:mm:ss");
    }

    const [hh, mm, ss] = parts.map(p => parseInt(p, 10));

    if (
      isNaN(hh) || isNaN(mm) || isNaN(ss) ||
      hh < 0 || hh > 23 ||
      mm < 0 || mm > 59 ||
      ss < 0 || ss > 59
    ) {
      throw new Error("Invalid time values in hh:mm:ss");
    }

    return (hh * 3600 + mm * 60 + ss) * 1000;
  }
}
