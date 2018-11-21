import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeago'
})
export class TimeagoPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    let d = new Date(value);
    let now = new Date();
    let seconds = Math.round(Math.abs((now.getTime() - d.getTime()) / 1000));
    console.log('second: ',seconds)
    let timeToUpdate = (Number.isNaN(seconds)) ? 1000 : this.getSecondsUntilUpdate(seconds) * 1000;
    let minutes = Math.round(Math.abs(seconds / 60));
    let hours = Math.round(Math.abs(minutes / 60));
    let days = Math.round(Math.abs(hours / 24));
    let months = Math.round(Math.abs(days / 30.416));
    let years = Math.round(Math.abs(days / 365));
    if (Number.isNaN(seconds)) {
      return;
    }
    else if (seconds <= 45) {
      return 'Đang hoạt động';
    }
    else if (seconds <= 90) {
      return 'Hoạt động 1 phút trước';
    }
    else if (minutes <= 45) {
      return 'Hoạt động ' + minutes + ' phút trước';
    }
    else if (minutes <= 90) {
      return 'Hoạt động 1 giờ trước';
    }
    else if (hours <= 22) {
      return 'Hoạt động ' + hours + ' giờ trước';
    }
    else if (hours <= 36) {
      return 'Hoạt động 1 ngày trước';
    }
    else if (days <= 25) {
      return 'Hoạt động ' + days + ' ngày trước';
    }
    else if (days <= 45) {
      return 'Hoạt động 1 tháng trước';
    }
    else if (days <= 345) {
      return 'Hoạt động ' + days + ' tháng trước';
    }
    else if (days <= 545) {
      return 'Hoạt động 1 năm trước';
    }
    else {
      // (days > 545)
      return years + ' years ago';
    }
  }

  getSecondsUntilUpdate = function (seconds) {
    var  min = 60;
    var  hr = min * 60;
    var  day = hr * 24;
    if (seconds < min) {
      // less than 1 min, update every 2 secs
      return 2;
    }
    else if (seconds < hr) {
      // less than an hour, update every 30 secs
      return 30;
    }
    else if (seconds < day) {
      // less then a day, update every 5 mins
      return 300;
    }
    else {
      // update every hour
      return 3600;
    }
  };

}
