import axios from "axios";
import { appkey, appid, proxy } from "../config";
export default class Search {
  constructor(query) {
    this.query = query;
  }
  async getResults() {
    try {
      const res = await axios(
        `${proxy}https://api.edamam.com/search?q=${this.query}&app_id=${appid}&app_key=${appkey}&from=0&to=30`
      );
      this.result = res.data.hits;
    } catch (error) {
      alert(error);
    }
  }
}
