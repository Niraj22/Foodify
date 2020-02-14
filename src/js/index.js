import Search from "./models/search"
import * as searchView from "./views/searchView"
import { elements, renderLoader, clearLoader } from "./views/base"
import Recipe from "./models/Recipe"
import * as recipeView from "./views/recipeView"
import * as listView from './views/listView'
import List from './models/List'
import Likes from "./models/likes"
import * as likesView from './views/likesView'
/* Global state of the app
 * search object
 *current recipe object
 *shopping list object
 *liked recipe
 */
const state = {}
/**
 * Search controller
 */
const controlSearch = async () => {
  //1 Get the query from the view
  const query = searchView.getInput()
  if (query) {
    //2 new search object and add to state object
    state.search = new Search(query)
    //3 prepare UI to display result
    searchView.clearInput()
    searchView.clearResults()
    renderLoader(elements.searchRes)

    //4 search for recipes
    await state.search.getResults()
    //5 render results in UI
    clearLoader()
    searchView.renderResult(state.search.result)
  }
}

elements.searchForm.addEventListener("submit", e => {
  e.preventDefault()
  controlSearch()
})

elements.searchResPages.addEventListener("click", e => {
  const btn = e.target.closest(".btn-inline")
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10)
    searchView.clearResults()
    searchView.renderResult(state.search.result, goToPage)
  }
})
/**
 * Recipe controller
 */

const controlRecipe = async () => {
  //gets id from URL
  const id = window.location.hash.replace("#", "")
  if (id) {
    //prepares UI for result
    recipeView.clearRecipe()
    renderLoader(elements.recipe)
    //Highlight the selected recipe
    if (state.search) {
      searchView.highlightSelected(id);
    }

    //create new recipe object
    state.recipe = new Recipe(id)
    try {
      //get recipe data and parse ingridents
      await state.recipe.getRecipe()
      state.recipe.parseIngredients()
      //call methods for recipe
      state.recipe.calcTime()
      state.recipe.calcServings()
      //render the recipe
      clearLoader()
      recipeView.renderRecipe((state.recipe), state.likes.isLiked(id))
    } catch (error) {
      alert(error)
    }
  }
};
["hashchange", "load"].forEach(event =>
  window.addEventListener(event, controlRecipe)
)

//**List controller */
const controlList = () => {
  //create a new list if there's none
  if (!state.list) state.list = new List()
  //put all ingredients into list
  state.recipe.ingredients.forEach(element => {
    const item = state.list.addItem(element.count, element.unit, element.ingredient)
    listView.renderItem(item)
  });
}
//handling delete and update shopping list
elements.shopping.addEventListener('click', e => {
  const id = e.target.closest('.shopping__item').dataset.itemid
  //handle the delete button
  if (e.target.matches('.shopping__delete, .shopping__delete *')) {
    //delete both from state and user interface
    //1 delete from state 
    state.list.deleteItem(id)
    //1 delete from View or UI
    listView.deleteItem(id)
    //handle the count update
  } else if (e.target.matches('.shopping__count-value')) {
    const val = parseFloat(e.target.value)
    if (val >= 0) {
      state.list.updateCount(id, val);
    }

  }
})
//**Like controller */

const controlLike = () => {
  const currentID = state.recipe.uri;

  if (!state.likes) {
    state.likes = new Likes();
  }
  //if the recipie is not liked
  if (!state.likes.isLiked(currentID)) {
    //Add like to the state
    const newLike = state.likes.addLike(currentID, state.recipe.title, state.recipe.author, state.recipe.img)
    //Toogle the like button
    likesView.toggleLikeBtn(true)
    //Add like to UI list
    likesView.renderLike(newLike)
  } else {
    //Remove like from the state
    state.likes.deleteLike(currentID)
    //toogle like
    likesView.toggleLikeBtn(false)
    //remove like from ui
    likesView.deleteLike(currentID)
  }
  likesView.toggleLikeMenu(state.likes.getNumLikes())
}
//Restore liked recipe on page load
window.addEventListener('load', () => {
  state.likes = new Likes()
  //restore likes
  state.likes.readStorage();
  //toggle the like menu button
  likesView.toggleLikeMenu(state.likes.getNumLikes())
  //render the existing likes
  state.likes.likes.forEach(like => likesView.renderLike(like))
})

//Handling recipe button + or - clicks
elements.recipe.addEventListener('click', e => {
  if (e.target.matches('.btn-decrease, .btn-decrease *')) {
    //decrease button if clicked
    if (state.recipe.servings > 1) {
      state.recipe.updateServings('dec')
      recipeView.updateservingsIngredients(state.recipe)
    }
  } else if (e.target.matches('.btn-increase, .btn-increase *')) {
    //increase button if clicked
    state.recipe.updateServings('inc')
    recipeView.updateservingsIngredients(state.recipe)
  } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
    //this adds items to shopping list
    controlList();
  } else if (e.target.matches('.recipe__love, .recipe__love *')) {
    //like controller
    controlLike();
  }
})