/* eslint-disable class-methods-use-this */

class NavigationService {
  async init() {
    console.log('rd: NavigationService -> init');
  }

  async queryRoute() {
    console.log('rd: NavigationService -> queryRoute');
  }
}

export default new NavigationService();
