import { elements } from "./base"
export const getInput = () => elements.searchInput.value
export const clearInput = () => {
  elements.searchInput.value = ""
}
export const clearResults = () => {
  elements.searchResultList.innerHTML = ""
  elements.searchResPages.innerHTML = ""
}

export const highlightSelected = id => {
  const resultsArr = Array.from(document.querySelectorAll('.results__link'))
  resultsArr.forEach(el => {
    el.classList.remove('results__link--active');
  })
  document.querySelector(`.results__link[href*="#${id}"]`).classList.add('results__link--active')
}

//limit the title array to 17 characters
export const limiRecipeTitle = (title, limit = 17) => {
  const newTitle = []
  if (title.length > limit) {
    title.split(" ").reduce((acc, curr) => {
      if (acc + curr.length <= limit) {
        newTitle.push(curr)
      }
      return acc + curr.length
    }, 0)
    return `${newTitle.join(" ")}...`
  }
  return title
}

const renderRecipe = recipe => {
  const URI = recipe.recipe.uri
  const splitted = URI.split("_")
  const id = splitted[1]
  const visualMarkup = `
  
  <li>
        <a class="results__link" href="#${id}">
       <figure class="results__fig">
        <img src="${recipe.recipe.image}" alt="${recipe.recipe.label}">
       </figure>
       <div class="results__data">
        <h4 class="results__name">${limiRecipeTitle(recipe.recipe.label)}</h4>
        <p class="results__author">${recipe.recipe.source}</p>
       </div>
       </a>
    </li>`
  elements.searchResultList.insertAdjacentHTML("beforeend", visualMarkup)
}
//type can be previous or next
const createButton = (page, type) =>
  `<button class="btn-inline results__btn--${type}" data-goto = ${
  type === "prev" ? page - 1 : page + 1
  }>
      <svg class="search__icon">
          <use href="img/icons.svg#icon-triangle-${
  type === "prev" ? "left" : "right"
  }"></use>
      </svg>
    <span>Page ${type === "prev" ? page - 1 : page + 1}</span>
  </button>
`

const renderButtons = (page, numResults, resultsPerPage) => {
  const pages = Math.ceil(numResults / resultsPerPage)
  let button
  if (page === 1 && pages > 1) {
    //we need only button to next page
    button = createButton(page, "next")
  } else if (page < pages) {
    //we need both buttons to go to prev and next
    button = `
    ${createButton(page, "prev")}
    ${createButton(page, "next")}
    `
  } else if (page === pages && pages > 1) {
    //we need only button to previous page
    button = createButton(page, "prev")
  }
  elements.searchResPages.insertAdjacentHTML("afterbegin", button)
}

export const renderResult = (recipes, page = 1, resultsPerPage = 10) => {
  //render result of current page

  const start = (page - 1) * resultsPerPage
  const end = page * resultsPerPage
  recipes.slice(start, end).forEach(element => {
    renderRecipe(element)
  })
  renderButtons(page, recipes.length, resultsPerPage)
}
