import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchRoomchat'
})
export class SearchRoomchatPipe implements PipeTransform {

  transform(roomchats: any, term: string): any {
    console.log("RRRRR: ",roomchats)
    if (!roomchats) return [];
    if (!term) return roomchats;
    if (term == '' || term == null) return [];
    return roomchats.filter(roomchat => {
      return roomchat.roomchatName.includes(term);
    })
  }

}
