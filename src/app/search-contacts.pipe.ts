import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchContacts'
})
export class SearchContactsPipe implements PipeTransform {

  transform(contacts: any, term: string): any {
    if (!contacts) return [];
    if (!term) return contacts;
    if (term == '' || term == null) return [];
    return contacts.filter(contact => {
      return contact.username.includes(term);
    })
  }

}
