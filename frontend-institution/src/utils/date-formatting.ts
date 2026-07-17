export class DateFormatting {

  static toValidDate = (input: string ): Date => {
    const [datePart, timePart] = input.split(" ");
    const [day, month, year] = datePart.split("-");
    const [hours, minutes, seconds] = timePart.split(":");
    const dateObj = new Date(
      parseInt(year),
      parseInt(month) - 1, 
      parseInt(day),
      parseInt(hours),
      parseInt(minutes),
      parseInt(seconds)
    );
    return dateObj;
  }

  static formatDateTimePickerComponent = (date?: string, format = 'Y-m-d hh:mm:ss') => {
    let d: Date;
    if (!date) {
      d = new Date();
    } else {
      d = new Date(this.toValidDate(date));
    }
    d.setHours(12, 59, 59, 0);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());

    if (format === 'Y-m-d hh:mm:ss') {
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    return d.toString();
  }

  static formatDayOfMonth(date: Date): string {
    const formatOptions: Intl.DateTimeFormatOptions = {
      year: "numeric", // year
      month: "long", // month
      day: "numeric", // day of the month
      hour: "numeric", // hour (12-hour format)
      minute: "numeric", // minutes
      //   second: 'numeric', // seconds
      hour12: true, // use 12-hour format
      //   timeZoneName: 'short' // time zone name
    };

    const formatter = new Intl.DateTimeFormat("es-PE", formatOptions);

    return formatter.format(date);
  }

  static formatShortDayOfMonth(date: Date): string {
    const formatOptions: Intl.DateTimeFormatOptions = {
      // weekday: 'long', // day of the week
      year: "numeric", // year
      month: "short", // month
      day: "numeric", // day of the month
      // hour: "numeric", // hour (12-hour format)
      // minute: "numeric", // minutes
      //   second: 'numeric', // seconds
      // hour12: true, // use 12-hour format
      //   timeZoneName: 'short' // time zone name
    };

    const formatter = new Intl.DateTimeFormat("es-PE", formatOptions);

    return formatter.format(date);
  }

  static formatShort(date: Date): string {
    const formatOptions: Intl.DateTimeFormatOptions = {
      // weekday: 'long', // day of the week
      year: "numeric", // year
      month: "numeric", // month
      day: "numeric", // day of the month
      hour: "numeric", // hour (12-hour format)
      minute: "numeric", // minutes
      //   second: 'numeric', // seconds
      hour12: true, // use 12-hour format
      //   timeZoneName: 'short' // time zone name
    };

    const formatter = new Intl.DateTimeFormat("es-PE", formatOptions);

    return formatter.format(date);
  }

  static timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    const interval = Math.floor(seconds / 31536000);

    if (interval > 1) return `Hace ${interval} años`;

    if (interval === 1) return `Hace ${interval} año`;

    const months = Math.floor(seconds / 2628000);
    if (months > 1) return `Hace ${months} meses`;

    if (months === 1) return `Hace ${months} mes`;

    const days = Math.floor(seconds / 86400);
    if (days > 1) return `Hace ${days} dias`;

    if (days === 1) return `Hace ${days} día`;

    const hours = Math.floor(seconds / 3600);
    if (hours > 1) return `Hace ${hours} horas`;

    if (hours === 1) return `Hace ${hours} hora`;

    const minutes = Math.floor(seconds / 60);
    if (minutes > 1) return `Hace ${minutes} minutos`;

    if (minutes === 1) return `Hace ${minutes} minuto`;

    return "ahora";
  };
}
