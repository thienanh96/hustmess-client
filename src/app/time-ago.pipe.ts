import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  pure: false
})
export class TimeAgoPipe implements PipeTransform {

  transform(value: any, isIdle: boolean): any {
    let d = new Date(value);
    let now = new Date();
    let seconds = Math.round(Math.abs((now.getTime() - d.getTime()) / 1000));
    let timeToUpdate = (Number.isNaN(seconds)) ? 1000 : this.getSecondsUntilUpdate(seconds) * 1000;
    let minutes = Math.round(Math.abs(seconds / 60));
    let hours = Math.round(Math.abs(minutes / 60));
    let days = Math.round(Math.abs(hours / 24));
    let months = Math.round(Math.abs(days / 30.416));
    let years = Math.round(Math.abs(days / 365));
    if (Number.isNaN(seconds)) {
      return '';
    } else if (isIdle) {
      return 'Đang bận'
    }  else if (seconds <= 6) {
      return 'Đang hoạt động';
    } else if (seconds <= 90) {
      return 'Hoạt động 1 phút trước';
    } else if (minutes <= 45) {
      return 'Hoạt động ' + minutes + ' phút trước';
    } else if (minutes <= 90) {
      return 'Hoạt động 1 giờ trước';
    } else if (hours <= 22) {
      return 'Hoạt động ' + hours + ' giờ trước';
    } else if (hours <= 36) {
      return 'Hoạt động 1 ngày trước';
    } else if (days <= 25) {
      return 'Hoạt động ' + days + ' ngày trước';
    } else if (days <= 45) {
      return 'Hoạt động 1 tháng trước';
    } else if (days <= 345) {
      return 'Hoạt động ' + days + ' tháng trước';
    } else if (days <= 545) {
      return 'Hoạt động 1 năm trước';
    } else {
      // (days > 545)
      return years + ' years ago';
    }
  }

  getSecondsUntilUpdate(seconds) {
    let min = 60;
    let hr = min * 60;
    let day = hr * 24;
    if (seconds < min) {
      // less than 1 min, update every 2 secs
      return 2;
    } else if (seconds < hr) {
      // less than an hour, update every 30 secs
      return 30;
    } else if (seconds < day) {
      // less then a day, update every 5 mins
      return 300;
    } else {
      // update every hour
      return 3600;
    }
  };

}
