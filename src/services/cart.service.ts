import localforage from 'localforage';
import { ProductData } from 'types';
import { eventAnalytics, typeEvent } from './event_analytics.service';

const DB = '__wb-cart';

class CartService {
  init() {
    this._updCounters();
    // localforage.removeItem(DB);
    // localforage.removeItem('__wb-favorite-products');
  }

  async addProduct(product: ProductData) {
    const products = await this.get();
    await this.set([...products, product]);
  }

  await eventAnalytics.sendEvent({
      type: typeEvent.addToCard,
      payload: { ...product },
      timestamp: Date.now(),
    });

  async removeProduct(product: ProductData) {
    const products = await this.get();
    await this.set(products.filter(({ id }) => id !== product.id));
  }

  async clear() {
    await localforage.removeItem(DB);
    this._updCounters();
  }

  async get(): Promise<ProductData[]> {
    return (await localforage.getItem(DB)) || [];
  }

  async set(data: ProductData[]) {
    await localforage.setItem(DB, data);
    this._updCounters();
  }

  async isInCart(product: ProductData) {
    const products = await this.get();
    return products.some(({ id }) => id === product.id);
  }

  private async _updCounters() {
    const products = await this.get();
    const count = products.length >= 10 ? '9+' : products.length;

    //@ts-ignore
    document.querySelectorAll('.js__cart-counter').forEach(($el: HTMLElement) => ($el.innerText = String(count || '')));
  }
}

export const cartService = new CartService();
