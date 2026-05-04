export class UnsupportedLensDataSource {
  constructor(name = "unsupported") {
    this.name = name;
  }

  async getProfile() {
    throw new Error(`${this.name} does not implement getProfile`);
  }

  async getState() {
    throw new Error(`${this.name} does not implement getState`);
  }

  async saveState() {
    throw new Error(`${this.name} does not implement saveState`);
  }

  async queryTags() {
    throw new Error(`${this.name} does not implement queryTags`);
  }

  async addTag() {
    throw new Error(`${this.name} does not implement addTag`);
  }

  async removeTag() {
    throw new Error(`${this.name} does not implement removeTag`);
  }

  async listLayers() {
    throw new Error(`${this.name} does not implement listLayers`);
  }

  async importLensPack() {
    throw new Error(`${this.name} does not implement importLensPack`);
  }

  async exportLensPack() {
    throw new Error(`${this.name} does not implement exportLensPack`);
  }
}

export function assertLensDataSource(adapter) {
  const requiredMethods = [
    "getProfile",
    "getState",
    "saveState",
    "queryTags",
    "addTag",
    "removeTag",
    "listLayers",
    "importLensPack",
    "exportLensPack"
  ];

  for (const method of requiredMethods) {
    if (typeof adapter?.[method] !== "function") {
      throw new TypeError(`Lens data source is missing ${method}`);
    }
  }

  return adapter;
}
