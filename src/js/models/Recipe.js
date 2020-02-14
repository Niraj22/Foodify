import axios from "axios"
import { appkey, appid, proxy } from "../config"

export default class Recipe {
  constructor(uri) {
    this.uri = uri
  }
  async getRecipe() {
    try {
      const res = await axios(
        `${proxy}https://api.edamam.com/search?q=${this.uri}&app_id=${appid}&app_key=${appkey}`
      )
      const data = res.data.hits[0]
      this.title = data.recipe.label
      this.author = data.recipe.source
      this.img = data.recipe.image
      this.url = data.recipe.shareAs
      this.ingredients = data.recipe.ingredients
    } catch (error) {
      alert(error)
    }
  }
  calcTime() {
    //we assume for each ingrident 15 min is required
    const numberOfIngredients = this.ingredients.length
    const Periods = Math.ceil(numberOfIngredients / 3)
    this.time = Periods * 15
  }
  calcServings() {
    this.servings = 4
  }
  parseIngredients() {
    const unitsLong = [
      "tablespoons",
      "tablespoon",
      "ounces",
      "ounce",
      "teaspoons",
      "teaspoon",
      "cups",
      "pounds",
      "envelope",
      "kilogram",
      "gram"
    ]
    const unitsShort = [
      "tbsp",
      "tbsp",
      "oz",
      "oz",
      "tsp",
      "tsp",
      "cup",
      "pound",
      "env",
      "kg",
      "g"
    ]
    const newIngredients = this.ingredients.map(el => {
      //1 making all the units same
      const inputRecipe = el.text
      let ingredient = inputRecipe.toLowerCase()
      unitsLong.forEach((unit, i) => {
        ingredient = ingredient.replace(unit, unitsShort[i])
      })
      //2 remove parenthesis
      ingredient = ingredient.replace(/[\])}[{(]/g, "")
      //3 parse ingredients into count, unit and ingredient
      const arrIng = ingredient.split(" ")
      const unitIndex = arrIng.findIndex(ell => unitsShort.includes(ell))
      let objIng
      if (unitIndex > -1) {
        const arrCount = arrIng.slice(0, unitIndex)
        let count
        if (arrCount.length === 1) {
          count = Math.round(eval(arrIng[0].replace("-", "+")))
        } else {
          count = Math.round(eval(arrIng.slice(0, unitIndex).join("+")))
        }
        objIng = {
          count,
          unit: arrIng[unitIndex],
          ingredient: arrIng.slice(unitIndex + 1).join(" ")
        }
      } else if (parseInt(arrIng[0], 10)) {
        //there is no unit but the first element is just a number
        objIng = {
          count: parseInt(arrIng[0], 10),
          unit: "",
          ingredient: arrIng.slice(1).join(" ")
        }
      } else if (unitIndex === -1) {
        //there is a unit
        objIng = {
          count: 1,
          unit: "",
          ingredient: ingredient
        }
      }
      return objIng
    })
    this.ingredients = newIngredients
  }

  updateServings(type) {
    //servings
    const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;
    //ingredients
    this.ingredients.forEach(ing => { ing.count *= (newServings / this.servings); })
    this.servings = newServings
  }
}
