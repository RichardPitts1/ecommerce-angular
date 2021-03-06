import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService {
  constructor(private db: AngularFireDatabase) {}

  async addToCart(course) {
    const cartId = localStorage.getItem('cartId');
    if (!cartId) {
      const cart = await this.db.list('/shoppingCart').push({
        dateCreated: new Date().getTime()
      });
      localStorage.setItem('cartId', cart.key);
      this.addCourseCart(cart.key, course);
    } else {
      this.addCourseCart(cartId, course);
    }
  }

  addCourseCart(idCart, courseAdd) {
    this.db
      .object(`/shoppingCart/${idCart}/items/${courseAdd.key}`)
      .snapshotChanges()
      .pipe(take(1))
      .subscribe(courseCart => {
        if (!courseCart.key) {
          this.db
            .list(`/shoppingCart/${idCart}/items/`)
            .set(courseAdd.key, { course: courseAdd });
        }
      });
  }

  deleteFromCart(id: string) {
    let cartId = localStorage.getItem('cartId');
    return this.db.object(`/shoppingCart/${cartId}/items/${id}`).remove();
  }

  getListItemsShoppingCart() {
    let cartId = localStorage.getItem('cartId');
    return this.db
      .list(`/shoppingCart/${cartId}/items/`)
      .snapshotChanges()
      .pipe(
        map(courses =>
          courses.map(courses => ({
            key: courses.payload.key,
            ...courses.payload.val()
          }))
        )
      );
  }
}
